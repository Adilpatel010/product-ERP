import Sidebar from '@/component/sidebar/Sidebar'
import RowProduct from '@/component/raw-material/raw-product/RawProduct'
import React from 'react'

const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <RowProduct />
        </div>

    )
}

export default RawMaterialPage