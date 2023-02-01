import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

class SearchAndResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      persons: []
    };
  }

  componentDidMount() {
    axios.get("http://localhost:3333/api/persons").then(persons => {
      this.setState({
        persons: persons.data
      })
    });
    console.log(this.state)
  }

  render() {
    return (
      <div className="component">
        <div className="input-group mb-3">
            <span className="input-group-text" id="inputGroup-sizing-default">Type last, first and middle names:</span>
            <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" />
        </div>
        ViewAllPersons
        <hr className="mb-4" />
        <ul className="list-group">
          {this.state.persons.map((person, index) => (
              <li className="list-group-item" key={index}>
                <Link to={{
                  pathname: `/person/${person._id}`,
                  propsPerson: person
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

export default SearchAndResults