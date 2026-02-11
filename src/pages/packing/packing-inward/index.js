import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import PackingInward from '@/component/packing/packing-inward/PackingInward'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <PackingInward />
        </div>

    )
}

export default PackingPage