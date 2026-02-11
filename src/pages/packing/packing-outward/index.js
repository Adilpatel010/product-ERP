import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import PackingOutward from '@/component/packing/packing-outward/PackingOutward'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <PackingOutward />
        </div>

    )
}

export default PackingPage