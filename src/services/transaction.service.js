import { prisma } from "@/lib/prisma";

export const getAllTransactions = async ({
    page = 1,
    limit = 10,
    user_id,
    from_date,
    to_date
}) => {

    const skip = (page - 1) * limit;

    const whereCondition = {
        is_deleted: false,
        ...(user_id && { user_id }),
        ...((from_date || to_date) && {
            transaction_date: {
                ...(from_date && { gte: new Date(from_date) }),
                ...(to_date && { lte: new Date(to_date + "T23:59:59") }),
            },
        }),

    };

    // ================= OPENING BALANCE =================
    const previousTransactions = await prisma.transaction.findMany({
        where: whereCondition,
        orderBy: {
            transaction_date: "asc",
        },
        take: skip,
        select: {
            transaction_type: true,
            amount: true,
        },
    });

    let openingBalance = 0;

    for (const txn of previousTransactions) {
        const amount = Number(txn.amount);

        if (txn.transaction_type === "credit") {
            openingBalance += amount;
        } else {
            openingBalance -= amount;
        }
    }

    // ================= CURRENT PAGE DATA =================
    const [data, total] = await Promise.all([
        prisma.transaction.findMany({
            where: whereCondition,
            orderBy: [
                { transaction_date: "asc" },
                { created_at: "asc" },
            ],
            skip,
            take: limit,
            include: {
                users: {
                    select: {
                        id: true,
                        user_name: true,
                    },
                },
            },
        }),

        prisma.transaction.count({
            where: whereCondition,
        }),
    ]);

    // ================= LEDGER CALC =================
    let runningBalance = openingBalance;

    const ledger = data.map((txn) => {

        const amount = Number(txn.amount);

        const debit = txn.transaction_type === "debit" ? amount : 0;
        const credit = txn.transaction_type === "credit" ? amount : 0;

        runningBalance = runningBalance + credit - debit;

        return {
            transaction_date: txn.transaction_date,
            username: txn.users?.user_name || "",
            debit,
            credit,
            balance: runningBalance,
        };
    });

    return {
        openingBalance,
        response: ledger,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
