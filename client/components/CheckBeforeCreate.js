import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import axios from 'axios'
require('dotenv').config()

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

function CheckBeforeCreate({receivePerson, person}) {
    const [persons, setPersons] = useState([])

    const givePerson = (person) => {
        receivePerson(person)
    }

    useEffect(() => {
        search()
        /* it must fix some problem */
        return() => {
            setPersons([])
        }
        /* it must fix some problem */
      }, [person]);

    const len = persons.length

    function search() {
        const data = {
            lastName: { $regex: person.lastName },
            firstName: { $regex: person.firstName },
            middleName: { $regex: person.middleName },
        }
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/search`, data).then(persons => {
            setPersons(persons.data)
        });
    }

    return (
        <div>
            <h3>Найдено похожих записей в БД: {len}</h3>
                <ul className="list-group">
                { persons.map((person, index) => (
                            (index < 10) 
                            ?  
                            <li className="list-group-item" key={index} id={person._id}> 
                                <Link onClick={() => givePerson(person)} to={{
                                    pathname: `/persons/id${person._id}`,
                                    // propsPerson: person
                                    }}>
                                    {person.lastName} {person.firstName} {person.middleName}
                                </Link>
                            </li>
                            :
                            null
                )) }
                </ul>
        </div>
    )
}

export { CheckBeforeCreate }

// TODO
// piece of code that fix following problem
// Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
/* const [state, setState] = useState({});

useEffect(() => {
    myFunction();
    return () => {
      setState({}); // This worked for me
    };
}, []);

const myFunction = () => {
    setState({
        name: 'Jhon',
        surname: 'Doe',
    })
}*/