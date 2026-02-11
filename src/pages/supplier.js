import Sidebar from '@/component/sidebar/Sidebar'
import Supplier from '@/component/supplier/Supplier'
import React from 'react'

const SupplierPage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <Supplier />
        </div>

    )
}

export default SupplierPage