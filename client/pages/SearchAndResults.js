import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import axios from "axios";
import debounce from 'lodash/debounce';
require('dotenv').config()

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

class SearchAndResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      persons: [],
      lastName: '',
      firstName: '',
      middleName: ''
    }

    this.onSearchFormChange = this.onSearchFormChange.bind(this)
    this.search = this.search.bind(this)
  }

  // componentDidMount() {
  //   console.log('Component Did Mount')
  //   axios.get("http://localhost:3333/api/persons").then(persons => {
  //     this.setState({
  //       persons: persons.data,
  //       lastName: '',
  //       firstName: '',
  //       middleName: ''
  //     })
  //   });
  // }

onSearchFormChange(e) {
  this.setState({
    persons: [
      ...this.state.persons,
    ],
    [e.target.id]: e.target.value,
  });
  const debounceFn = debounce(this.search, 500)
  debounceFn()
}

search() {
  const data = {
    lastName: { $regex: this.state.lastName },
    firstName: { $regex: this.state.firstName },
    middleName: { $regex: this.state.middleName },
  }
  axios.post(`${SERVER_IP}:${SERVER_PORT}/api/search`, data).then(persons => {
      this.setState({
        persons: persons.data
      })
  });
}

  render() {
    return (
      <div className="component">
        <hr className="mb-4" />
            SearchForm
        <div className="row">
        <div className="col-md-4 mb-3">
                <label htmlFor="lastName">Last name</label>
                <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={this.state.lastName} onChange={this.onSearchFormChange} required />
                <div className="invalid-feedback">
                Valid last name is required.
                </div>
            </div>
            <div className="col-md-4 mb-3">
                <label htmlFor="firstName">First name</label>
                <input type="text" className="form-control" id="firstName" placeholder="Иван" value={this.state.firstName} onChange={this.onSearchFormChange} required />
                <div className="invalid-feedback">
                Valid first name is required.
                </div>
            </div>
            <div className="col-md-4 mb-3">
                <label htmlFor="middleName">MIddle name</label>
                <input type="text" className="form-control" id="middleName" placeholder="Иванович" value={this.state.middleName} onChange={this.onSearchFormChange} />
                <div className="invalid-feedback">
                Valid middle name is required.
                </div>
            </div>
          </div>
        ViewAllPersons
        <hr className="mb-4" />
        { (this.state.persons.length) ? `Found ${this.state.persons.length} entries` : null}
        <ul className="list-group">
          {this.state.persons.map((person, index) => (
              <li className="list-group-item" key={index}>
                <Link to={{
                  pathname: `/persons/${person._id}`,
                  // propsPerson: person
                  }}>
                    {person.lastName} {person.firstName} {person.middleName}
                </Link>
              </li>
        ))}
        </ul>
      </div>
    );
  }
}

export { SearchAndResults }