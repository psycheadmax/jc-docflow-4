import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
	addTemplateActionCreator,
	removeTemplateActionCreator,
} from "../store/templateReducer";
import axios from "axios";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function Doctemplates() {
	const [templateList, setTemplateList] = useState([]);
	const dispatch = useDispatch();

	useEffect(() => {
		async function getList() {
			try {
				const response = await axios.get(
					`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/all`
				);
				const data = response.data;
				setTemplateList(data);
			} catch (error) {
				console.error("Error fetching document templates:", error);
			}
		}
		getList();
	}, []);

	console.log("templateList: ", templateList);

	return (
		<>
			<header className="doctemplates d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
				<div>
					<ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
						<li>
							<Link to="/docs/receipt">ПКО</Link> • 
						</li>
						<li>
							<Link to="/docs/anydoc">AnyDoc</Link> • 
						</li>
						<li>
							<Link to="/docs/anydoc2">AnyDoc2</Link> • 
						</li>
						<li>
							<Link to="/docs/templateagreement">Договор</Link> • 
						</li>
						{/* GET TEMPLATES FROM DB
						{templateList.map((template, index) => (
							<li key={index}>
								<Link
									to="/docs/anydoc2"
									onClick={() =>
										dispatch(addTemplateActionCreator(template))
									}
								>
									{template.title}
								</Link> • 
							</li>
						))} 
						*/}
					</ul>
				</div>
			</header>
		</>
	);
}

export { Doctemplates };
