import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"

import docGen from './docGen';
import SearchAndResults from './components/SearchAndResults';
import PersonCard from './components/PersonCard'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.docGenerator = this.docGenerator.bind(this)
  }

  docGenerator() {
    docGen(this.state)
  }

  render() {
    return (
      <div className="App container">
          <Router>
            <div>
              <ul>
                <li><Link to="/create">Person</Link></li>
                <li><Link to="/search">Search</Link></li>
              </ul>

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
              </Switch>
            </div>
          </Router> 
      </div>
    )
  }
}

export default App;
