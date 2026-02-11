import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import EditMapper from '@/component/mapper/EditMapper'

const MapperPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <EditMapper/>
        </div>

    )
}

export default MapperPage