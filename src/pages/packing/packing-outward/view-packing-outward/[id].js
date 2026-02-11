import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import ViewPackingOutward from '@/component/packing/packing-outward/ViewPackingOutward'


const ViewPackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ViewPackingOutward />
        </div>

    )
}

export default ViewPackingPage
