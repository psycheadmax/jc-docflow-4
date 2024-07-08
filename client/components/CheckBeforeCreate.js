import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import axios from 'axios'
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

function CheckBeforeCreate({receiveFromChild, whatToSearch}) {
    console.log('whatToSearch:', whatToSearch)
    const [foundData, setFoundData] = useState([])
    const giveToParent = (obj) => {
        receiveFromChild(obj)
    }
    let dataType
    let data = {}
    if (whatToSearch.lastName) {
        dataType = 'persons'
        data = {
            lastName: { $regex: whatToSearch.lastName },
            firstName: { $regex: whatToSearch.firstName },
            middleName: { $regex: whatToSearch.middleName },
            innNumber: { $regex: whatToSearch.innNumber },
        }
    }
    if (whatToSearch.shortName) {
        dataType = 'orgs'
        data = {
            shortName: { $regex: whatToSearch.shortName },
            innOrg: { $regex: whatToSearch.innOrg },
        }
    }
    


    useEffect(() => {
        search()
        /* it must fix some problem */
        return() => {
            setFoundData([])
        }
        /* it must fix some problem */
      }, [whatToSearch]);

    const len = foundData.length
    async function search() {     
        if (dataType) {
            await axios.post(`${SERVER_IP}:${SERVER_PORT}/api/${dataType}/search`, data).then(found => {
                setFoundData(found.data)
            });
        }
    }

    return (
        <div>
            <h3>Найдено похожих записей в БД: {len}</h3>
                <ul className="list-group">
                { foundData.map((item, index) => (
                            (index < 30) 
                            ?  
                            <li className="list-group-item" key={index} id={item._id}> 
                                <Link onClick={() => giveToParent(item)} to={{
                                    pathname: `/${dataType}/id${item._id}`,
                                    // propsPerson: person
                                    }}>
                                    {(dataType === 'persons') && (`${item.lastName} ${item.firstName} ${item.middleName}`)}
                                    {(dataType === 'orgs') && (`${item.shortName} ИНН: ${item.innOrg}`)}
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

// TODO memory leak
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