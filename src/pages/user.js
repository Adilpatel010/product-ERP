import Sidebar from '@/component/sidebar/Sidebar'

import User from '@/component/user/User'
import React from 'react'

const UserPage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <User />
        </div>

    )
}

export default UserPage