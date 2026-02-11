import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import ViewPackingInward from '@/component/packing/packing-inward/ViewPackingInward'


const ViewPackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ViewPackingInward />
        </div>

    )
}

export default ViewPackingPage
