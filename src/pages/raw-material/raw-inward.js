import Sidebar from '@/component/sidebar/Sidebar'
import RawInword from '@/component/raw-material/raw-inward/RawInward'
import React from 'react'


const RawMaterialPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <RawInword />
        </div>

    )
}

export default RawMaterialPage