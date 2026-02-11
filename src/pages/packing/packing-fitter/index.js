import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import PackingUser from '@/component/packing/packing-user/PackingUser'


const PackingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <PackingUser />
        </div>

    )
}

export default PackingPage