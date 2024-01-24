import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { NavLink } from "react-router-dom";
import axios from "axios";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function Header() {
	const state = useSelector((state) => state);
	console.log("useSelector(state)", state);

	const person = useSelector((state) => state.personReducer.person);
	const caseName = useSelector((state) => state.caseReducer);
	const template = useSelector((state) => state.templateReducer);

	console.log("caseName: ", caseName);

	// const [logged, setLogged] = useState()
	// TODO set  КЛИЕНТ link '/create ' or '..../id' if there person id

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
								<NavLink to="/create">Клиент</NavLink>
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
					<Link
						to={{
							pathname: `/persons/id${person._id}`,
						}}
					>
						{person.innNumber && `ИНН: ${person.innNumber}, `}
						{person.lastName} {person.firstName}{" "}
						{person.middleName && `${person.middleName}`}
					</Link>
					{caseName._id ? (
						<span>
						&nbsp;|&nbsp;
							<Link
								to={{
									pathname: `/cases/id${caseName._id}`,
								}}
							>
								{caseName.caseN && `${caseName.caseN}`}
								{caseName.createdAt &&
									` от ${caseName.createdAt}`}
							</Link>
						</span>
					) : (
						<span className="attention"> | Дело не выбрано</span>
					)}

					{template._id && ` | `}
					<Link
						to={{
							pathname: `/docs/anydoc2`,
						}}
					>
						{template.title && `${template.title}`}
					</Link>
				</div>
			</div>
		</>
	);
}

export { Header };
