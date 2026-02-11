import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import AddPackingOutward from '@/component/packing/packing-outward/AddPackingOutward'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <AddPackingOutward/>
        </div>

    )
}

export default PackingPage