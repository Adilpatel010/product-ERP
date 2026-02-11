import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import AddRawInward from '@/component/raw-material/raw-inward/AddRawInward'


const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <AddRawInward />
        </div>

    )
}

export default RawMaterialPage