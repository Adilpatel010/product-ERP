import Mapper from '@/component/mapper/Mapper'
import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'

const MapperPage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <Mapper />
        </div>

    )
}

export default MapperPage