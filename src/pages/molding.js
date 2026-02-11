import Molding from '@/component/molding/Molding';
import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'

const molding = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <Molding />
        </div>
    )
}

export default molding;
