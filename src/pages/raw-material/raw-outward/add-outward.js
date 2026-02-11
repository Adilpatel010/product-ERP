import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import AddRawOutward from '@/component/raw-material/raw-outward/AddRawOutward'

const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <AddRawOutward />
        </div>

    )
}

export default RawMaterialPage