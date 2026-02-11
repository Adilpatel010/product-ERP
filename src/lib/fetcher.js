import api from "./apiClient";

// super admin login
export const superAdminLogin = async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};

// get me
export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

// logout
export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

// change password
export const changePassword = async (payload) => {
    const response = await api.post("/auth/change-password", payload);
    return response.data;
};

// ====================== SUPPLIER ======================

// get all suppliers
export const getAllSuppliers = async (page, limit, search) => {
    const response = await api.get(`/supplier?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create supplier
export const createSupplier = async (payload) => {
    const response = await api.post("/supplier", payload);
    return response.data;
};

// delete supplier
export const deleteSupplier = async (id) => {
    const response = await api.delete(`/supplier/${id}`);
    return response.data;
};

// get supplier by id
export const getSupplierById = async (id) => {
    const response = await api.get(`/supplier/${id}`);
    return response.data;
};

// update supplier
export const updateSupplier = async (id, payload) => {
    const response = await api.put(`/supplier/${id}`, payload);
    return response.data;
};

// search supplier
export const searchSupplier = async (search) => {
    const response = await api.get(`/search/supplier?search=${search}`);
    return response.data;
};

// ======================= RAW PRODUCT =======================

// get all products 
export const getAllRawProducts = async (page, limit, search) => {
    const response = await api.get(`/raw-product?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create raw product
export const createRawProduct = async (payload) => {
    const response = await api.post("/raw-product", payload);
    return response.data;
};

// delete raw product
export const deleteRawProduct = async (id) => {
    const response = await api.delete(`/raw-product/${id}`);
    return response.data;
};

// get raw product by id
export const getRawProductById = async (id) => {
    const response = await api.get(`/raw-product/${id}`);
    return response.data;
};

// update raw product
export const updateRawProduct = async (id, payload) => {
    const response = await api.put(`/raw-product/${id}`, payload);
    return response.data;
};

// search raw product
export const searchRawProduct = async (search) => {
    const response = await api.get(`/search/raw-product?search=${search}`);
    return response.data;
};


// ======================== USER =========================

// get all users
export const getAllUsers = async (page, limit, search) => {
    const response = await api.get(
        `/user?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
};

// create user
export const createUser = async (payload) => {
    const response = await api.post("/user", payload);
    return response.data;
};

// get user by id
export const getUserById = async (id) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
};

// update user
export const updateUser = async (id, payload) => {
    const response = await api.put(`/user/${id}`, payload);
    return response.data;
};

// delete user 
export const deleteUser = async (id) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
};


export const getModules = async () => {
    const response = await api.get(`/modules`);
    return response.data;
};

// get user by permission
export const getUserByPermission = async () => {
    const response = await api.get("/user?type=permission");
    return response.data.data;
};

// ===================== RAW INWARD =====================

// get all raw inwards
export const getAllRawInward = async (page, limit, search) => {
    const response = await api.get(`/raw-inward?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create raw inwards
export const createRawInward = async (payload) => {
    const response = await api.post("/raw-inward", payload);
    return response.data;
};

// delete raw inwards
export const deleteRawInward = async (id) => {
    const response = await api.delete(`/raw-inward/${id}`);
    return response.data;
};

// get raw inwards by id
export const getRawInwardById = async (id) => {
    const response = await api.get(`/raw-inward/${id}`);
    return response.data;
};

// update raw inwards
export const updateRawInward = async (id, payload) => {
    const response = await api.put(`/raw-inward/${id}`, payload);
    return response.data;
};

// ======================= RAW OUTWARD =======================

// get all raw outwards
export const getAllRawOutward = async (page, limit, search) => {
    const response = await api.get(`/raw-outward?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create raw outwards
export const createRawOutward = async (payload) => {
    const response = await api.post("/raw-outward", payload);
    return response.data;
};

// delete raw outwards
export const deleteRawOutward = async (id) => {
    const response = await api.delete(`/raw-outward/${id}`);
    return response.data;
};

// get raw outwards by id
export const getRawOutwardById = async (id) => {
    const response = await api.get(`/raw-outward/${id}`);
    return response.data;
};

// update raw outwards
export const updateRawOutward = async (id, payload) => {
    const response = await api.put(`/raw-outward/${id}`, payload);
    return response.data;
};

// ====================== MOLDING (WORKING) ======================

// get all working
export const getAllWorking = async (page, limit, search) => {
    const response = await api.get(`/working?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create working
export const createWorking = async (payload) => {
    const response = await api.post("/working", payload);
    return response.data;
};

// delete working 
export const deleteWorking = async (id) => {
    const response = await api.delete(`/working/${id}`);
    return response.data;
};

// get working by id
export const getWorkingById = async (id) => {
    const response = await api.get(`/working/${id}`);
    return response.data;
}

// update working
export const updateWorking = async (id, payload) => {
    const response = await api.put(`/working/${id}`, payload);
    return response.data;
};

// ======================== MOLDING (MACHINE) ========================

// get all machines
export const getAllMachines = async (page, limit, search) => {
    const response = await api.get(`/machine?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create machine
export const createMachine = async (payload) => {
    const response = await api.post("/machine", payload);
    return response.data;
};

// delete machine
export const deleteMachine = async (id) => {
    const response = await api.delete(`/machine/${id}`);
    return response.data;
};

// get machine by id
export const getMachineById = async (id) => {
    const response = await api.get(`/machine/${id}`);
    return response.data;
};

// update machine
export const updateMachine = async (id, payload) => {
    const response = await api.put(`/machine/${id}`, payload);
    return response.data;
};

// toggle machine
export const toggleMachine = async (id) => {
    const response = await api.patch(`/machine/${id}`);
    return response.data;
};

// search machine
export const searchMachine = async (search) => {
    const response = await api.get(`/search/machine?search=${search}`);
    return response.data;
};

// ======================= PRODUCT =======================

// get all products
export const getAllProducts = async (page, limit, search) => {
    const response = await api.get(`/product?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create product
export const createProduct = async (payload) => {
    const response = await api.post("/product", payload);
    return response.data;
};

// delete product
export const deleteProduct = async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
};

// get product by id
export const getProductById = async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
};

// update product
export const updateProduct = async (id, payload) => {
    const response = await api.put(`/product/${id}`, payload);
    return response.data;
};
// search product
export const searchProduct = async (search) => {
    const response = await api.get(`/search/product?search=${search}`);
    return response.data;
};

// ====================== PACKING ======================

// ====================== Packing user ======================
// get all packing user
export const getAllPackingUser = async (page, limit, search) => {
    const response = await api.get(`/packing-user?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create packing user
export const createPackingUser = async (payload) => {
    const response = await api.post("/packing-user", payload);
    return response.data;
};

// delete packing user
export const deletePackingUser = async (id) => {
    const response = await api.delete(`/packing-user/${id}`);
    return response.data;
};

// get packing user by id
export const getPackingUserById = async (id) => {
    const response = await api.get(`/packing-user/${id}`);
    return response.data;
}

// update packing user
export const updatePackingUser = async (id, payload) => {
    const response = await api.put(`/packing-user/${id}`, payload);
    return response.data;
};

// ====================== Packing outward ======================
export const getAllPackingOutward = async (page, limit, search) => {
    const response = await api.get(`/packing-outward?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};
export const createPackingOutward = async (payload) => {
    const response = await api.post("/packing-outward", payload);
    return response.data;
};

export const searchOutwardUser = async (search) => {
    const response = await api.get(`/search/fitter-user?search=${search}`);
    return response.data;
};
// DELETE Packing Outward
export const deletePackingOutward = async (id) => {
    const response = await api.delete(`/packing-outward/${id}`);
    return response.data;
};

// GET Single Packing Outward (for View/Edit)
export const getPackingOutwardById = async (id) => {
    const response = await api.get(`/packing-outward/${id}`);
    return response.data;
};

// UPDATE Packing Outward
export const updatePackingOutward = async (id, data) => {
    const response = await api.put(`/packing-outward/${id}`, data);
    return response.data;
};

// ====================== Packing inward ======================

// get all packing inward
export const getAllPackingInward = async (page, limit, search) => {
    const response = await api.get(`/packing-inward?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// delete packing inward
export const deletePackingInward = async (id) => {
    const response = await api.delete(`/packing-inward/${id}`);
    return response.data;
};

// get packing inward by id
export const getPackingInwardById = async (id) => {
    const response = await api.get(`/packing-inward/${id}`);
    return response.data;
};

// update packing inward
export const createPackingInward = async (data) => {
    const response = await api.put("/packing-inward", data);
    return response.data;
};

// update data inward
export const updatePackingInwardData = async (id, data) => {
    const response = await api.put(`/packing-inward/${id}`, data);
    return response.data;
};

// packing product fitter by id 
export const getPackingProductByFitterId = async (id) => {
    const response = await api.get(`/packing-inward/${id}`);
    return response.data;
}

// ====================== packing payment ======================

// get all packing payment
export const getAllPackingPayment = async (page, limit, search, fromDate, toDate) => {
    const response = await api.get(`/packing-payment?page=${page}&limit=${limit}&search=${search}&fromDate=${fromDate}&toDate=${toDate}`);
    return response.data;
};
// search packing payment user
export const searchPackingPaymentUser = async (search) => {
    const response = await api.get(`/search/user?search=${search}`);
    return response.data;
};

//create packing payment
export const createPackingPayment = async (payload) => {
    const response = await api.post("/packing-payment", payload);
    return response.data;
};

// delete packing payment
export const deletePackingPayment = async (id) => {
    const response = await api.delete(`/packing-payment/${id}`);
    return response.data;
};

// get packing payment by id
export const getPackingPaymentById = async (id) => {
    const response = await api.get(`/packing-payment/${id}`);
    return response.data;
}

// update packing payment
export const updatePackingPayment = async (id, payload) => {
    const response = await api.put(`/packing-payment/${id}`, payload);
    return response.data;
};

// =================== Stock Details ===================
export const getStockDetails = async (page, limit, search) => {
    const response = await api.get(`/stock-details?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// =================== Mapper ===================
// get all mapper
export const getAllMapper = async (page, limit, search) => {
    const response = await api.get(`/mapper?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

// create mapper
export const createMapper = async (payload) => {
    const response = await api.post("/mapper", payload);
    return response.data;
};

// delete mapper
export const deleteMapper = async (id) => {
    const response = await api.delete(`/mapper/${id}`);
    return response.data;
};

// get mapper by id
export const getMapperById = async (id) => {
    const response = await api.get(`/mapper/${id}`);
    return response.data;
};

// update mapper
export const updateMapper = async (id, payload) => {
    const response = await api.put(`/mapper/${id}`, payload);
    return response.data;
};

// get mapper rate per gurus 
export const getMapperRatePerGurus = async (product_id, user_id) => {
    const res = await api.get("/mapper", {
        params: {
            product_id,
            user_id,
        },
    });

    return res.data?.data;
};

// ===================== Transaction Details =====================
export const getAllTransaction = async (page, limit, from_date, to_date, user_id) => {
    const response = await api.get(`/transaction?page=${page}&limit=${limit}&from_date=${from_date}&to_date=${to_date}&user_id=${user_id}`);
    return response.data;
};

export const getProductBomByProductId = async (id) => {
    const response = await api.get(`/product/product-bom/${id}`);
    return response.data;
};

// ===================== Expectation ======================
export const getAllExpectation = async (page, limit, search) => {
    const response = await api.get(`/expectation?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};