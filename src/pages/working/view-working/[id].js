import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'
import ViewWorking from '@/component/molding/working/ViewWorking'

const WorkingPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ViewWorking />
        </div>

    )
}

export default WorkingPage