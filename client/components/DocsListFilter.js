import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import debounce from 'lodash/debounce'
require('dotenv').config()

const PORT = process.env['PORT']
const SERVER_IP = process.env['SERVER_IP']

function DocsListFilter({person}) {
    
    console.log('person props in DocsListFilter: ',person)

    const [filter, setFilter] = useState({
        idPerson: person._id,
    }) 
    
    const [docs, setDocs] = useState([])
    
    useEffect(() => {
        searchDocs()
    }, [filter]); // [filter] - condition to re-render
    
    function onChange(e) {
        if (e.target.value === 'noValue') {
            const filterCopy = structuredClone(filter)
            delete filterCopy[e.target.id];
            setFilter(filterCopy)
        } else {
            setFilter({
                ...filter,
                [e.target.id]: e.target.value,
            })
        }
    }
    
    function searchDocs() {
		axios.post(`${SERVER_IP}:${PORT}/api/docs`, filter).then((items) => {
			setDocs(items.data);
		});
	}

    const len = docs.length

    return (
		<div className="component">
			Фильтр
			<div className="row">
				{/* Фамилия */}
				<div className="col-md-3 mb-3">
					<label htmlFor="disabledTextInput">
						Фамилия (только чтение)
					</label>
					<input
						type="text"
						className="form-control"
						id="disabledTextInput"
						placeholder="Иванов"
						value={`${person.lastName} ${person.firstName} ${person.middleName}`}
					/>
				</div>
				{/* Дело */}
				<div className="col-md-4 mb-3">
                    <label htmlFor="caseN">Дело</label>
					<select
						className="form-select form-select-md mb-3"
						aria-label=".form-select-sm example"
						id="caseN" onChange={(e) => onChange(e)}
					>
						<option defaultValue value='noValue'>Не выбрано</option>
						{person.cases.map((item, index) => (
							<option key={index} value={item._id}>{item.caseN}</option>
						))}
					</select>
				</div>

				{/* Тип документа */}
				<div className="col-md-2 mb-3">
					<label htmlFor="type">Тип документа</label>
					<select
						id="type"
						className="form-select"
						value={filter.type}
						onChange={onChange}
					>
						<option defaultValue value='noValue'>Не выбрано</option>
						<option value="ПКО">ПКО</option>
						<option value="Договор">Договор</option>
					</select>
				</div>
			</div>
			<hr className="mb-4" />
			<h3>{`Для ${person.lastName} ${person.firstName} ${person.middleName} есть ${len} документов`}</h3>
			<ul className="list-group">
				{docs.map((item, index) => (
					<li className="list-group-item" key={index} id={item._id}>
						<Link to={{ pathname: `/docs/${item._id}` }}>
							{`${item.type}  - ${item.description} - ${item.date}`}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

export { DocsListFilter }

