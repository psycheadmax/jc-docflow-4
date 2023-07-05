import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import axios from 'axios'

function CheckBeforeCreate({receivePerson, person}) {
    const [persons, setPersons] = useState([])

    const givePerson = (person) => {
        receivePerson(person) // YEAH!!!!
    }

    useEffect(() => {
        search()
      }, [person]);

    const len = persons.length

    function search() {
        const data = {
            lastName: { $regex: person.lastName },
            firstName: { $regex: person.firstName },
            middleName: { $regex: person.middleName },
        }
        axios.post("http://localhost:3333/api/search", data).then(persons => {
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
                                    pathname: `/persons/${person._id}`,
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