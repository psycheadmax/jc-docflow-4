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
    this.state = {
      lastName: 'ЛШТШФУМ',
      firstName: 'Ащьф',
      middleName: 'Иванович',
      birthday: '07.12.2022',
      gender: 'male'
      // docTemplate(s): ???
    }

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
          <li>
            <Link to="/create">Person</Link>
          </li>
          <li>
            <Link to="/search">Search</Link>
          </li>
        </ul>

        <Switch>
          <Route exact path="/create">
            <PersonCard 
              // firstName={this.state.firstName}
              // lastName={this.state.lastName}
              // middleName={this.state.middleName}
              // gender={this.state.gender}
            />
          </Route>
          <Route path="/search">
            <SearchAndResults />
          </Route>
          <Route path="/person/:id" render={(props) => (
            <PersonCard {...props} />
          )}
          />

          

        </Switch>
      </div>
    </Router>        
        
        {/* <button className="btn btn-danger btn-lg btn-block" onClick={this.insertPerson} >Insert</button> MOVED to CreatePerson component*/}
        {/* <button className="btn btn-primary btn-lg btn-block" type="submit" onClick={this.docGenerator} >OK</button> NEED tomove to document generator component*/}
      </div>
    )
  }
}

export default App;
