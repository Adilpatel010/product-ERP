import Product from '@/component/product/Product';
import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'

const ProductPage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <Product />
        </div>
    )
}

export default ProductPage;
