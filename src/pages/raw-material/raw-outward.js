import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import RawOutward from '@/component/raw-material/raw-outward/RawOutward'


const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <RawOutward />
        </div>

    )
}

export default RawMaterialPage