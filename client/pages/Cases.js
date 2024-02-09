import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { caseReducer, addCaseActionCreator, removeCaseActionCreator } from '../store/caseReducer'
import { CaseComponent } from "../components/CaseComponent";
import { getDataByIdFromURL } from "../functions";
import dayjs from "dayjs";
require("dotenv").config();

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

	async function getCasesById(data) {
		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/cases`, data)
			.then((cases) => {
				setCases(cases.data);
			});
	}

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const person = useSelector((state) => state.personReducer.person);

	useEffect(() => {
		getCasesById({ idPerson: person._id });
	}, []);

	console.log("person._id: ");
	console.log(person._id);
	console.log("cases: ");
	console.log(cases);

	function onChange(e) {
		console.log(e.target.value);
	}

	function receiveCase(data) {
		console.log("receiveCase: " + data);
	}

	function newCase(e) {
		// e.preventDefault();
        const data = {
            idPerson: person._id,
            caseReceivedDocs: [
                {
                    title: "",
                    have: false,
                },
            ],
            caseFlow: [
                {
                    phase: "",
                    date: "",
                    comment: "",
                },
            ],
            caseReminder: [
                {
                    title: "",
                    date: "",
                    active: false,
                    comment: "",
                },
            ],
        }
		navigate(`/cases/new`);
		/* axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/cases/write`, data)
			.then((item) => {
				console.log("item: ");
				console.log(item);
				navigate(`/cases/id${item.data._id}`);

				const dataFromURL = getDataByIdFromURL("cases");
				// data._id = item.data._id;
				// console.log(dataFromURL._id);
				// dispatch(captureActionCreator(data));
				// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
			}); */
	}

	return (
		<>
			{person._id && (
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => newCase()}
				>
					+ новое дело
				</button>
			)}
			<ul className="list-group">
				{cases.map((item, index) =>
					index < 30 ? (
						<li className="list-group-item" key={index}>
							<Link
								onClick={() => dispatch(addCaseActionCreator(item))}
								to={{
									pathname: `/cases/id${item._id}`,
								}}
							>
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
