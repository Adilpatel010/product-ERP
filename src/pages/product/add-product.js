import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import AddProduct from '@/component/product/AddProduct'

const ProductPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <AddProduct />
        </div>

    )
}

export default ProductPage