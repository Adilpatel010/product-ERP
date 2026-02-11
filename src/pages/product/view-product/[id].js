import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import ViewProduct from '@/component/product/ViewProduct'

const ProductPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ViewProduct />
        </div>

    )
}

export default ProductPage