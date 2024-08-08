import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { caseReducer, addCaseActionCreator, removeCaseActionCreator } from '../store/caseReducer'
import { CaseComponent } from "../components/CaseComponent";
import { getDataByIdFromURL } from "../functions";
import dayjs from "dayjs";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function Cases() {
	const [cases, setCases] = useState([
		{
			idPerson: "",
			caseTitle: "",
			caseDate: "",
			caseCategory: "",
			caseReceivedDocs: [], // [Title of the doc, Have] TODO find where to enter received docs
			caseFlow: [], // [Phase, Date, Comment] TODO
			caseReminder: [], // TODO [Title, Date, Active, Comment]
			comment: "",
		},
	]);

	const navigate = useNavigate();
	const dispatch = useDispatch();
	
	async function getCasesById(data) {
		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/cases/search`, data)
			.then((cases) => {
				setCases(cases.data);
			});
	}

	const person = useSelector((state) => state.personReducer.person);

	useEffect(() => {
		getCasesById({ idPerson: person._id });
	}, []);

	console.log("person._id: ", person._id);
	console.log("cases: ", cases);

	function onChange(e) {
		console.log(e.target.value);
	}

	function receiveCase(data) {
		console.log("receiveCase: " + data);
	}

	function newCase(e) {
		e.preventDefault();
		navigate(`/cases/new`);
	}

	return (
		<>
			{person._id && (
				<button
					type="button"
					className="btn btn-primary"
					onClick={(e) => newCase(e)}
				>
					+ новое дело
				</button>
			)}
			<ul className="list-group">
				{cases.map((item, index) =>
					index < 30 ? (
						<li className="list-group-item" key={index}>
							<Link to={{pathname: `/cases/id${item._id}`,}}>
								{item.caseTitle} от {dayjs(item.caseDate).format('DD.MM.YYYY')}
							</Link>
						</li>
					) : null
				)}
			</ul>
		</>
	);
}

export { Cases };
