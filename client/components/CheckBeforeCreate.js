import React from 'react'
import { Link } from "react-router-dom";

function CheckBeforeCreate(props) {
    const givePerson = (person) => {
        props.receivePerson(person) // YEAH!!!!
    }
    const len = props.persons.length
    return (
        <div>
            <h3>There are {len} such entries in DB</h3>
                <ul className="list-group">
                { props.persons.map((person, index) => (
                            (index < 3) 
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

export default CheckBeforeCreate