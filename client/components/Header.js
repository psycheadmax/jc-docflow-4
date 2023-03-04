import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import SearchAndResults from './SearchAndResults'
import PersonCard from './PersonCard'
import Docs from './Docs'

function Header() {
    return(
    <div className="Header container">
        <Router>
            <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
            <a href="/" className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none">
                Logo
                {/* <svg className="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"><use xlink:href="#bootstrap"/></svg> */}
            </a>

            <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                <li><Link to="/create">Person</Link></li>
                &nbsp;
                <li><Link to="/search">Search</Link></li>
                &nbsp; | &nbsp;
                <li><Link to="/docs">Docs</Link></li>
            </ul>

            <div className="col-md-3 text-end">
                <button type="button" className="btn btn-outline-primary me-2">Login</button>
                <button type="button" className="btn btn-primary">Sign-up</button>
            </div>
            </header>

            <Switch>
                <Route exact path="/create">
                    <PersonCard />
                </Route>
                <Route path="/search">
                    <SearchAndResults />
                </Route>
                <Route path="/persons/:id" render={(props) => (
                    <PersonCard {...props} />
                )} />
                <Route path="/docs" render={(props) => (
                    <Docs {...props} />
                )}>
                </Route>
            </Switch>

        </Router>
  </div>

    //     <div className="Header container">
    //     <Router>
    //       <div>
    //         <ul>
    //           <li><Link to="/create">Person</Link></li>
    //           <li><Link to="/search">Search</Link></li>
    //         </ul>

    //         <Switch>
    //           <Route exact path="/create">
    //             <PersonCard />
    //           </Route>
    //           <Route path="/search">
    //             <SearchAndResults />
    //           </Route>
    //           <Route path="/persons/:id" render={(props) => (
    //             <PersonCard {...props} />
    //           )} />
    //         </Switch>
    //       </div>
    //     </Router> 
    // </div>
    )
}

export default Header