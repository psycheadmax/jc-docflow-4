import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import axios from 'axios'
import dayjs from 'dayjs';
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

function CaseNComponent({idPerson, cases}) {

    const casesArr = cases.map(item => ({...item}))
    const [caseData, setCaseData] = useState(
        casesArr //works! but only if there is a data
    )
    const initialNewCaseData = {
        idPerson: `ObjectId(${idPerson})`,
        caseN: '',
        caseDate: dayjs().format('YYYY-MM-DD'),
        comment: ''
    }
    console.log('initialNewCaseData:', initialNewCaseData)
    const [newCaseData, setNewCaseData] = useState()
    console.log('caseData:', caseData)

    // useEffect(() => {
    //     // search()
    // }); // [filter] - condition to re-render
    
    function search() {
        const data = {
            lastName: { $regex: person.lastName },
            firstName: { $regex: person.firstName },
            middleName: { $regex: person.middleName },
        }
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/search`, data).then(persons => {
            setPersons(persons.data)
        });
    }
    
    function onCaseDataChange(e) {
        setNewCaseData({
            ...newCaseData,
            [e.target.id]: e.target.value
        })
    }

    function newCaseN(e) {
        e.preventDefault()
        setNewCaseData(initialNewCaseData)
    }
    
    function addCaseN(e) {
        e.preventDefault()
        const caseDataCopy = caseData.map(item => ({...item}))
        caseDataCopy.push(newCaseData)
        setCaseData(caseDataCopy)
        setNewCaseData()
    }

    function removeCaseN(e) {
        e.preventDefault()
        setNewCaseData()
        // const caseDataCopy = caseData.map(item => ({...item}))
        // caseDataCopy.splice(index, 1)
        // setCaseData(caseDataCopy)
    }

    return (
		<fieldset>
			<legend className="bg-light">Дело</legend>
			{caseData.map((element, index) => {
				return (
					<div className="row" key={index}>
						{/* radio */}
						<div className="form-check col-md-10 mb-3">
							<input
								className="form-check-input"
								type="checkbox"
								value={element._id}
								id="case"
							/>
							<label
								className="form-check-label"
								htmlFor="flexCheckDefault"
							>
								{`${element.caseN} Дата:${dayjs(
									element.caseDate
								).format("YYYY-MM-DD")} Комментарий:${
									element.comment
								}`}
							</label>
						</div>
						{/* radio */}
					</div>
				);
			})}
			{/* new case */}
			{/* {(index !== caseData.length-1) && <hr className="mb-4" />} */}
			{(newCaseData) && (
                <div className="row">
                    {/* Имя дела*/}
					<div className="col-md-3 mb-3">
						<label htmlFor="caseN">Имя</label>
						<input
							type="text"
							className="form-control"
							id="caseN"
							placeholder="0123-Коррупция-2023-01-01"
							value={newCaseData.caseN}
							onChange={(e) => onCaseDataChange(e)}
						/>
						<div className="invalid-feedback">
							Valid last NameGenitive is required.
						</div>
					</div>
					{/* Дата */}
					<div className="col-md-2 mb-3">
						<label htmlFor="date">Дата</label>
						<input
							type="date"
							className="form-control"
							id="caseDate"
							placeholder="2023-01-01"
							value={newCaseData.caseDate}
							onChange={(e) => onCaseDataChange(e)}
						/>
						<div className="invalid-feedback">
							Valid PKO date is required.
						</div>
					</div>
					{/* Комментарий */}
					<div className="col-md-6 mb-3">
						<label htmlFor="comment">Комментарий</label>
						<textarea
							className="form-control"
							id="comment"
							placeholder="Какой-то текст..."
							value={newCaseData.comment}
							onChange={(e) => onCaseDataChange(e)}
						/>
						<div className="invalid-feedback">
							Valid middle NameGenitive is required.
						</div>
					</div>
					<div className="col-md-1 mb-3">
							<button
								className="btn btn-outline-danger btn-sm btn-block"
								onClick={(e) => removeCaseN(e)}
							>
								удалить
							</button>
                            <button
								className="btn btn-outline-danger btn-sm btn-block"
								onClick={(e) => addCaseN(e)}
							>
								добавить
							</button>
					</div>
				</div>
			)}

			{/* new case */}

			<button
				className="btn btn-light btn-md btn-block"
				onClick={(e) => newCaseN(e)}
			>
				новое дело
			</button>
		</fieldset>
	);
}

export { CaseNComponent }