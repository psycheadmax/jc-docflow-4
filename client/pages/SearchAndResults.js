import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";
import { useDispatch } from "react-redux";
import { removeActionCreator } from "../store/personReducer";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function SearchAndResults() {
	const dispatch = useDispatch();

	const [query, setQuery] = useState({
		innNumber: "",
		lastName: "",
		firstName: "",
		middleName: "",
	});

	const [persons, setPersons] = useState([]);

	useEffect(() => {
		search();
	}, [query]);

	function onSearchFormChange(e) {
		setQuery({
			...query,
			[e.target.id]: e.target.value,
		});
		const debounceFn = debounce(search, 500);
    debounceFn();
	}

	async function search() {
		const data = {
			innNumber: { $regex: query.innNumber },
			lastName: { $regex: query.lastName },
			firstName: { $regex: query.firstName },
			middleName: { $regex: query.middleName },
		};
    let searchResult = []
		try {
			await axios
				.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/search`, data)
				.then((items) => {
          console.log(items.data);
					searchResult = items.data;
				});
		} catch (error) {
			console.error(error);
		}
    setPersons(searchResult);
	}

	return (
		<div className="component">
			<hr className="mb-4" />
			<div className="row">
				{/* ИНН Номер */}
				<div className="col-md-2 mb-3">
					<label htmlFor="innNumber">ИНН</label>
					<input
						type="number"
						className="form-control"
						id="innNumber"
						placeholder="110200300400"
						value={query.innNumber}
						onChange={onSearchFormChange}
					/>
					<div className="invalid-feedback">
						Valid number is required.
					</div>
				</div>
				<div className="col-md-3 mb-3">
					<label htmlFor="lastName">Фамилия</label>
					<input
						type="text"
						className="form-control"
						id="lastName"
						placeholder="Иванов"
						value={query.lastName}
						onChange={onSearchFormChange}
						required
					/>
					<div className="invalid-feedback">
						Valid last name is required.
					</div>
				</div>
				<div className="col-md-3 mb-3">
					<label htmlFor="firstName">Имя</label>
					<input
						type="text"
						className="form-control"
						id="firstName"
						placeholder="Иван"
						value={query.firstName}
						onChange={onSearchFormChange}
						required
					/>
					<div className="invalid-feedback">
						Valid first name is required.
					</div>
				</div>
				<div className="col-md-3 mb-3">
					<label htmlFor="middleName">Отчество</label>
					<input
						type="text"
						className="form-control"
						id="middleName"
						placeholder="Иванович"
						value={query.middleName}
						onChange={onSearchFormChange}
					/>
					<div className="invalid-feedback">
						Valid middle name is required.
					</div>
				</div>
			</div>
			<hr className="mb-4" />
			{persons.length ? `Найдено ${persons.length} клиентов. Выше - новее.` : null}
			<ul className="list-group">
				{persons.map((item, index) => (
					<li className="list-group-item" key={index}>
						<Link to={{pathname: `/persons/id${item._id}`}} >
							{item.innNumber && `ИНН: ${item.innNumber}, `}
							{item.lastName} {item.firstName}{" "}
							{item.middleName && `${item.middleName}`}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

export { SearchAndResults };
