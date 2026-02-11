import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import ViewMapper from '@/component/mapper/ViewMapper'

const MapperPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ViewMapper/>
        </div>

    )
}

export default MapperPage