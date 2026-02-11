import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import EditProduct from '@/component/product/EditProduct'

const ProductPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <EditProduct />
        </div>

    )
}

export default ProductPage