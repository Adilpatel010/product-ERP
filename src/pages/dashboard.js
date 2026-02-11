import Dashboard from '@/component/dashboard/Dashboard'
import Sidebar from '@/component/sidebar/Sidebar'
import React from 'react'

const DashboardPage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <Dashboard />
        </div>

    )
}

export default DashboardPage