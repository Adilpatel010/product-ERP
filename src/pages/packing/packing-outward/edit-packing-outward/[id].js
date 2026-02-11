import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import EditPackingOutward from '@/component/packing/packing-outward/EditPackinOutward'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <EditPackingOutward/>
        </div>

    )
}

export default PackingPage