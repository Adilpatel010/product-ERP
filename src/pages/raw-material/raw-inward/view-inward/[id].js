import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import ViewRawInward from '@/component/raw-material/raw-inward/ViewRawInward'


const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ViewRawInward />
        </div>

    )
}

export default RawMaterialPage