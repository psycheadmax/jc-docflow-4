import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";
import { useDispatch } from "react-redux";
import { addDocActionCreator } from "../store/docReducer";
import { captureActionCreator } from "../store/personReducer";
import {
	addCaseActionCreator,
	removeCaseActionCreator,
} from "../store/caseReducer";
import {
	addTemplateActionCreator,
	removeTemplateActionCreator,
} from "../store/templateReducer";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function DocsListFilter({ person }) {
	console.log("person props in DocsListFilter: ", person);

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [filter, setFilter] = useState({
		idPerson: person._id,
	});

	const [docs, setDocs] = useState([]);
	const [caseNames, setCaseNames] = useState([]);
	const [types, setTypes] = useState([]);
	const [isFirstTime, setIsFirstTime] = useState(true);

	useEffect(() => {
		searchDocs();
	}, [filter]); // [filter] - condition to re-render

	useEffect(() => {
		searchCaseNames();
	}, []);

	useEffect(() => {
		searchUniqueTypes();
	}, [docs]);

	function onFilterChange() {}

	function onChange(e) {
		const { id, value } = e.target;
		if (value === "noValue") {
			const filterCopy = structuredClone(filter);
			delete filterCopy[id];
			setFilter(filterCopy);
		} else {
			setFilter({
				...filter,
				[id]: value,
			});
		}
		console.log("current filter", filter);
	}

	async function loadState(e, id) {
		e.preventDefault();
		console.log("clicked:", id);
		const doc = await axios.get(
			`${SERVER_IP}:${SERVER_PORT}/api/docs/id${id}`
		);
		console.log(doc.data);
		dispatch(addDocActionCreator(doc.data));
		if (doc.data.idPerson) {
			const person = await axios.get(
				`${SERVER_IP}:${SERVER_PORT}/api/persons/id${doc.data.idPerson}`
			);
			console.log("person.data: ", person.data);
			dispatch(captureActionCreator(person.data));
		}
		if (doc.data.idCase) {
			const result = await axios.get(
				`${SERVER_IP}:${SERVER_PORT}/api/cases/id${doc.data.idCase}`
			);
			console.log("caseTitleame.data: ", result.data);
			dispatch(removeCaseActionCreator());
			dispatch(addCaseActionCreator(result.data));
		}
		if (doc.data.idTemplate) {
			const result = await axios.get(
				`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/id${doc.data.idTemplate}`
			);
			console.log("template.data: ", result.data);
			dispatch(removeTemplateActionCreator());
			dispatch(addTemplateActionCreator(result.data));
		}
		navigate(`/docs/id${doc.data._id}`);
	}

	async function searchDocs() {
		try {
			const responce = await axios.post(
				`${SERVER_IP}:${SERVER_PORT}/api/docs/search`,
				filter
			);
			setDocs(responce.data);
			console.log("docs found: ", responce.data);
		} catch (error) {
			console.log(error);
		}
	}

	async function searchCaseNames() {
		try {
			const responce = await axios.post(
				`${SERVER_IP}:${SERVER_PORT}/api/cases/search`,
				filter
			);
			console.log("cases found:", responce.data);
			setCaseNames(responce.data);
		} catch (error) {
			console.log(error);
		}
	}

	function searchUniqueTypes() {
		if (docs.length > 0 && isFirstTime) {
			const uniqueTypes = [...new Set(docs.map((item) => item.type))];
			setTypes(uniqueTypes);
			console.log("types found:", uniqueTypes);
			setIsFirstTime(false);
		}
	}

	const len = docs.length;

	return (
		<div className="component">
			Фильтр
			<div className="row">
				{/* Дело */}
				<div className="col-md-6 mb-3">
					<label htmlFor="idCase">Дело</label>
					<select
						className="form-select form-select-md mb-3"
						aria-label=".form-select-sm example"
						id="idCase"
						onChange={(e) => onChange(e)}
					>
						<option defaultValue value="noValue">
							Не выбрано
						</option>
						{caseNames &&
							caseNames.map((item, index) => (
								<option key={index} value={item._id}>
									{`${item.caseTitle} от ${dayjs(
										item.caseDate
									).format("DD.MM.YYYY")}`}
								</option>
							))}
					</select>
				</div>

				{/* Тип документа */}
				<div className="col-md-4 mb-3">
					<label htmlFor="type">Тип документа</label>
					<select
						id="type"
						className="form-select"
						value={filter.type}
						onChange={onChange}
					>
						<option defaultValue value="noValue">
							Не выбрано
						</option>
						{types &&
							types.map((item, index) => (
								<option key={index} value={item}>
									{`${item}`}
								</option>
							))}
					</select>
				</div>
			</div>
			<hr className="mb-4" />
			<h3>{`Для ${person.lastName} ${person.firstName} ${
				person.middleName
			} есть ${len} документов на сумму ${docs.reduce((acc, item) => {
				return acc + (item.sum || 0);
			}, 0)} руб.`}</h3>
			<ul className="list-group">
				{docs.map((item, index) => (
					<li className="list-group-item" key={index} id={item._id}>
						{/* <Link to={{ pathname: `/docs/id${item._id}` }} onClick={() => loadState(item._id)}> */}
						<Link onClick={(e) => loadState(e, item._id)}>
							{
								(item.name ? `имя: ${item.name} • ` : ``)+
								(item.type ? `тип: ${item.type} • ` : ``)+
								(item.type === "ПКО" ? `№: ${item.number} • ` : ``)+
								(item.date ? `от ${dayjs(item.date).format("DD.MM.YYYY")} • ` : ``)+
								(item.sum ? `на: ${item.sum}руб.• ` : ``)+
								(item.description ? `описание: ${item.description} • ` : ``)+
								(!person._id ? `клиент: ${item.idPerson.lastName} ${item.idPerson.firstName[0]}. ${item.idPerson.middleName[0]}. • ` : ``)+
								(item.idCase ? `дело: ${item.idCase.caseTitle} от ${dayjs(item.idCase.caseDate).format('DD.MM.YYYY')}` : ``)
							}
							{/* NAME • TYPE • DESCRIPTION • DATE • PERSON • CASE • SUM */}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

export { DocsListFilter };
