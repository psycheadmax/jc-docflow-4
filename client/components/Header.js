import React from 'react'
import { NavLink } from 'react-router-dom'

function Header() {
    return(
        <div className="Header container">
                <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
                <a href="/" className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none">
                    Logo
                    {/* <svg className="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"><use xlink:href="#bootstrap"/></svg> */}
                </a>

                <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                    <li><NavLink to="/">Главная</NavLink></li>
                    &nbsp;
                    <li><NavLink to="/create">Клиент</NavLink></li>
                    &nbsp; | &nbsp;
                    <li><NavLink to="/search">Поиск</NavLink></li>
                    &nbsp; | &nbsp;
                    <li><NavLink to="/docs">Документы</NavLink></li>
                </ul>

                <div className="col-md-3 text-end">
                    <button type="button" className="btn btn-outline-primary me-2">Login</button>
                    <button type="button" className="btn btn-primary">Sign-up</button>
                </div>
                </header>
        </div>
    )
}

export { Header }