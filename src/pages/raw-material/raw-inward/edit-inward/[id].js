import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import EditRawInward from '@/component/raw-material/raw-inward/EditRawInward'


const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <EditRawInward />
        </div>

    )
}

export default RawMaterialPage