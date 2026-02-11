import AddWorking from '@/component/molding/working/AddWorking'
import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'

const MoldingPage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <AddWorking />
        </div>

    )
}

export default MoldingPage