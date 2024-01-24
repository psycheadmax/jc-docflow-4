import React, {useState} from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { DocsListFilter } from '../components/DocsListFilter'

function Docs(props) {
    const person = useSelector(state => state.personReducer.person)
    // const [person] = useState([{
    //     ...props.person
    // }])
    // Component to display all available documents to generate
    return (
        <>
            <DocsListFilter person={person}/>
        </>
        
    )
}

export { Docs }