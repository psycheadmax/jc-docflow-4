import React, {useState} from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import TempReceiptForm from '../docTemplates/TempReceiptForm'

function Docs(props) {
    const [person] = useState([{
        ...props.person
    }])
    console.log(person)
    // Component to display all available documents to generate
    return (
        <Router>
            <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
                <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                    <li><Link to="/docs/receipt">Receipt</Link></li>
                    {/* &nbsp; */}
                    {/* <li><Link to="/search">Search</Link></li> */}
                </ul>
            </header>

            <Switch>
                <Route exact path="/docs/receipt">
                    <TempReceiptForm />
                </Route>
            </Switch>

        </Router>
    )
}

export default Docs