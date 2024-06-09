import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate} from "react-router-dom";
import { NavLink } from "react-router-dom";
import { removeActionCreator } from '../store/personReducer';
import { removeCaseActionCreator } from '../store/caseReducer';
import { removeTemplateActionCreator } from '../store/templateReducer';
import { removeDocActionCreator } from '../store/docReducer';
import axios from "axios";
import dayjs from 'dayjs';

import { MdClear } from "react-icons/md";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function Header() {
	const dispatch = useDispatch()
	const location = useLocation()
	const navigate = useNavigate()

	const person = useSelector((state) => state.personReducer.person);
	const template = useSelector((state) => state.templateReducer);
	const caseName = useSelector((state) => state.caseReducer);
	const doc = useSelector((state) => state.docReducer);

	console.log("person in redux: ", person);
	console.log("caseName in redux: ", caseName);
	console.log("template in redux: ", template);
	console.log("doc in redux: ", doc);

	function clearState() {
		dispatch(removeActionCreator())
		dispatch(removeCaseActionCreator())
		dispatch(removeTemplateActionCreator())
		dispatch(removeDocActionCreator())
		if (location.pathname.startsWith('/persons')) {
			navigate('/person')
		}
		if (location.pathname.startsWith('/docs/id')) {
			navigate('/docs')
		}
	}

	function logout(e) {
		e.preventDefault();
		axios.post(`${SERVER_IP}:${SERVER_PORT}/logout`).then((data) => {
			alert(data.data.message);
			// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
		});
	}

	return (
		<>
			<div className="Header container">
				<div>
					<header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
						<a
							href="/"
							className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none"
						>
							Logo
							{/* <svg className="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"><use xlink:href="#bootstrap"/></svg> */}
						</a>

						<ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
							<li>
								<NavLink to="/">Главная</NavLink>
							</li>
							&nbsp; | &nbsp;
							<li>
								<NavLink to="/search">Поиск</NavLink>
							</li>
							&nbsp;
							<li>
								{person._id ? 
									<NavLink to={`/persons/id${person._id}`}>Клиент</NavLink> :
									<NavLink to={`/person`}>Клиент</NavLink>
								}
							</li>
							&nbsp;
							<li>
									<NavLink to={`/orgs`}>Орг•</NavLink>
							</li>
							&nbsp; | &nbsp;
							<li>
								<NavLink to="/cases">Дело</NavLink>
							</li>
							&nbsp; | &nbsp;
							<li>
								<NavLink to="/doctemplates">Шаблоны</NavLink>
							</li>
							&nbsp; | &nbsp;
							<li>
								<NavLink to="/docs">Документы</NavLink>
							</li>
						</ul>

						<div className="col-md-3 text-end">
							<button
								type="button"
								className="btn btn-outline-primary me-2"
							>
								<NavLink to="/login">Вход</NavLink>
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={logout}
							>
								Выход
							</button>
						</div>
					</header>
				</div>
				<div className="fromReduxState">
				{(person._id || caseName._id || template._id || doc._id) && (<button
					className="btn btn-outline-danger btn-sm btn-block"
					onClick={clearState}
					title="Очистить"
					>
					<MdClear />
				</button>)}
					<Link
						to={{
							pathname: `/persons/id${person._id}`,
						}}
					>
						{person.innNumber && ` ИНН: ${person.innNumber}, `}
						{person.lastName} {person.firstName}{" "}
						{person.middleName && `${person.middleName}`}
					</Link>
					{(caseName._id) ? (
						<span>
						&nbsp;|&nbsp;
							<Link
								to={{
									pathname: `/cases/id${caseName._id}`,
								}}
							>
								{caseName.caseTitle && `${caseName.caseTitle}`}
								{caseName.createdAt &&
									` от ${dayjs(caseName.createdAt).format('DD.MM.YYYY')}`}
							</Link>
						</span>
					) : (
						person._id && <span className="attention"> | Дело не выбрано</span>
					)}

					{template &&
					<Link
						to={{
							pathname: `/docs/` + (template.templateURLName ? template.templateURLName : `anydoc2`)
						}}
					>
						{template.title && ` | ${template.title}`}
					</Link>}
					
					{doc._id && ` | `}
					<Link
						to={{
							pathname: `/docs/id${doc._id}`,
						}}
					>
						{doc.name && `${doc.name}`}
					</Link>
				</div>
			</div>
		</>
	);
}

export { Header };
