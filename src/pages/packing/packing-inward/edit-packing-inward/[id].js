import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import EditPackingInward from '@/component/packing/packing-inward/EditPackingInward'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <EditPackingInward />
        </div>

    )
}

export default PackingPage