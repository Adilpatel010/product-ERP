import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import AddPackingPayment from '@/component/packing/packing-payment/AddPackingPayment'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            < AddPackingPayment/>
        </div>

    )
}

export default PackingPage