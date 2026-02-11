import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import EditWorking from '@/component/molding/working/EditWorking'

const WorkingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <EditWorking />
        </div>

    )
}

export default WorkingPage