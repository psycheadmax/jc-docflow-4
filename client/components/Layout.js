import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Header } from './Header'

function Layout() {
    return(
        <>
            <Header />
            <div className="content-container">
            <Outlet />
            </div>
            <footer>MaxKorn &copy;2023</footer>
        </>
    )
}

export {Layout}