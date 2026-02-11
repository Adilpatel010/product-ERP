import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import EditRawOutward from '@/component/raw-material/raw-outward/EditRawOutward'

const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <EditRawOutward />
        </div>

    )
}

export default RawMaterialPage