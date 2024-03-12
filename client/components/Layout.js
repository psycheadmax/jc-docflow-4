import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'

function Layout() {
    return(
        <>
            <Header />
            <div className="Content container">
                <Outlet />
            </div>
            <footer>MaxKorn &copy;2023</footer>
        </>
    )
}

export { Layout }