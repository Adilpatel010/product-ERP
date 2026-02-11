import AddMapper from '@/component/mapper/AddMapper'
import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'

const MapperPage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <AddMapper />
        </div>

    )
}

export default MapperPage