import React, { useState, useEffect } from 'react';
import { Link, withRouter } from "react-router-dom";
import axios from "axios";
import debounce from 'lodash/debounce';
require('dotenv').config()

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

function SearchAndResults() {

  const [query, setQuery] = useState({
    innNumber: '',
    lastName: '',
    firstName: '',
    middleName: '',
  })

  const [persons, setPersons] = useState([])

  useEffect(() => {
    search()
  }, [query]);

  function onSearchFormChange(e) {
    setQuery({
      ...query,
      [e.target.id]: e.target.value,
    });
    const debounceFn = debounce(search, 500)
    debounceFn()
  }
  
  function search() {
    const data = {
      innNumber: { $regex: query.innNumber },
      lastName: { $regex: query.lastName },
      firstName: { $regex: query.firstName },
      middleName: { $regex: query.middleName },
    }
    axios.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/search`, data).then(persons => {
        setPersons(
          persons.data
        )
    });
  }

  return (
    <div className="component">
        <hr className="mb-4" />
        <div className="row">
          {/* ИНН Номер */}
          <div className="col-md-2 mb-3">
                        <label htmlFor="innNumber">ИНН</label>
                        <input type="number" className="form-control" id="innNumber" placeholder="110200300400" value={query.innNumber} onChange={onSearchFormChange} />
                        <div className="invalid-feedback">
                        Valid number is required.
                        </div>
                    </div>
        <div className="col-md-3 mb-3">
                <label htmlFor="lastName">Фамилия</label>
                <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={query.lastName} onChange={onSearchFormChange} required />
                <div className="invalid-feedback">
                Valid last name is required.
                </div>
            </div>
            <div className="col-md-3 mb-3">
                <label htmlFor="firstName">Имя</label>
                <input type="text" className="form-control" id="firstName" placeholder="Иван" value={query.firstName} onChange={onSearchFormChange} required />
                <div className="invalid-feedback">
                Valid first name is required.
                </div>
            </div>
            <div className="col-md-3 mb-3">
                <label htmlFor="middleName">Отчество</label>
                <input type="text" className="form-control" id="middleName" placeholder="Иванович" value={query.middleName} onChange={onSearchFormChange} />
                <div className="invalid-feedback">
                Valid middle name is required.
                </div>
            </div>
          </div>
        <hr className="mb-4" />
        { (persons.length) ? `Найдено ${persons.length} клиентов` : null}
        <ul className="list-group">
          {persons.map((person, index) => (
              <li className="list-group-item" key={index}>
                <Link to={{
                  pathname: `/persons/id${person._id}`,
                  // propsPerson: person
                  }}>
                    {person.innNumber && `ИНН: ${person.innNumber}, `}{person.lastName} {person.firstName} {person.middleName && `${person.middleName}`}
                </Link>
              </li>
        ))}
        </ul>
      </div>
  )
}

export { SearchAndResults }