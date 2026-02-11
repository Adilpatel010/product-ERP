import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import PackingPayment from '@/component/packing/packing-payment/PackingPayment'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            < PackingPayment/>
        </div>

    )
}

export default PackingPage