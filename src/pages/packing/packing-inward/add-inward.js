import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import AddPackingInward from '@/component/packing/packing-inward/AddPackingInward'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <AddPackingInward/>
        </div>

    )
}

export default PackingPage