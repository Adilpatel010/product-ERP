import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import ViewRawOutward from '@/component/raw-material/raw-outward/ViewRawOutward'

const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ViewRawOutward />
        </div>

    )
}

export default RawMaterialPage