import React from 'react';

import docGen from './docGen';
import Header from './components/Header'

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
        <Header />
      </div>
    )
  }
}

export default App;
