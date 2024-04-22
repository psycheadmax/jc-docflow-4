import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
	addTemplateActionCreator,
	removeTemplateActionCreator,
} from "../store/templateReducer";
import {
	addDocActionCreator,
	removeDocActionCreator,
} from "../store/docReducer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../components/Modal";

import {
	createTokens,
	fromTokensToResult,
	getDataByIdFromURL,
	paymentsSchedule,
} from "../functions";

const dayjs = require("dayjs");

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function TemplateButtons() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const person = useSelector((state) => state.personReducer.person);
	const caseName = useSelector((state) => state.caseReducer);
	const template = useSelector((state) => state.templateReducer);
	const doc = useSelector((state) => state.docReducer);

	const [contentBack, setContentBack] = useState();
	const [dirty, setDirty] = useState(false);
	const [previewType, setPreviewType] = useState("tokens");
	const [tokens, setTokens] = useState(createTokens(person));
	const [templateData, setTemplateData] = useState(template);
	const [initialTemplateTitle, setInitialTemplateTitle] = useState(
		templateData.title
	);
	const [destinationDocName, setDestinationDocName] = useState(
		doc.name ||
			`${person.lastName} ${person.firstName[0]}.${person.middleName[0]}. - ${templateData.type}`
	);
	const [modalActive, setModalActive] = useState(false);

	useEffect(() => {
		async function getData() {
			const data = await getDataByIdFromURL("doctemplates"); // TODO calling now even if there no id (create instead)
			if (data) {
				setTemplateData({
					...data,
				});
				setInitialTemplateTitle(data.title);
			}
		}
		getData();
	}, []);

	function onChange(e) {
		e.persist();
		const { id, value } = e.target;
		if (id === "destinationDocName") {
			setDestinationDocName(value);
		} else {
			console.log("Шаблон", templateData.title);
			setTemplateData({
				...templateData,
				[id]: value,
			});
		}
	}

	const editorRef = useRef(null);

	const saveDocTemp = async () => {
		let templateExist;
		const query = { title: templateData.title };
		try {
			templateExist = await axios.post(
				`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/check`,
				query
			);
		} catch (error) {
			console.error(error);
		}

		let message;
		templateExist.data
			? (message = `"${templateData.title}" уже существует.\nПерезаписать?`)
			: (message = `"${templateData.title}" нет в БД.\nСоздать?`);

		if (confirm(message)) {
			const data = {
				...templateData,
				content: editorRef.current.getContent(),
			};
			try {
				await axios
					.post(
						`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/write`,
						data
					)
					.then((item) => {
						dispatch(removeTemplateActionCreator());
						dispatch(addTemplateActionCreator(item.data));
						alert(`Шаблон ${item.data.title} создан`);
						setModalActive(false);
						// const dataFromURL = getDataByIdFromURL('doctemplates')
						// data._id = item.data._id
						// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
					});
			} catch (error) {
				console.log(error);
			}
		}
	};

	const deleteDocTemp = async () => {
		if (
			confirm(
				`Вы действительно хотите удалить шаблон\n"${templateData.title}"?`
			)
		) {
			try {
				await axios
					.post(
						`${SERVER_IP}:${SERVER_PORT}/api/doctemplate/delete/${template._id}`
					)
					.then((item) => {
						dispatch(removeTemplateActionCreator());
						navigate(`/doctemplates`);
						alert(`Шаблон "${item.data.title}" удален.`);
					});
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<>
			<div className="row">
				<div className="col-md-2 mb-3">
					<button
						className="btn btn-outline-primary btn-md btn-block btn-sm"
						onClick={() => setModalActive(true)}
					>
						Управление шаблоном
					</button>
				</div>
			</div>
			{/* TEMPLATE buttons */}
			<Modal active={modalActive} setActive={setModalActive}>
				<div className="row">
					<div className="col-md-12 mb-3">
						<label htmlFor="title">Имя</label>
						<input
							type="text"
							className="form-control"
							id="title"
							placeholder="Имя шаблона"
							value={templateData.title}
							onChange={(e) => onChange(e)}
						/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-6 mb-3">
						<label htmlFor="title">Тип</label>
						<input
							type="text"
							className="form-control"
							id="type"
							placeholder="Тип шаблона"
							value={templateData.type}
							onChange={(e) => onChange(e)}
						/>
					</div>
					<div className="col-md-6 mb-3">
						<label htmlFor="scenario">Scenario</label>
						<input
							type="text"
							className="form-control"
							id="type"
							placeholder="пока не реализовано"
							value={templateData.scenario}
							onChange={(e) => onChange(e)}
						/>
					</div>
					<div className="col-md-12 mb-3">
						<label htmlFor="title">Описание</label>
						<textarea
							className="form-control"
							id="description"
							rows="3"
							onChange={onChange}
							value={templateData.description}
							placeholder="Описание"
						></textarea>
					</div>
				</div>
				<div className="row">
					<div className="footer-buttons">
						<div className="col-md-6 mb-3">
							{/* КНОПКИ */}
							{/*  */}
							{templateData.content && (
								<button
									className="btn btn-primary btn-md btn-block btn-sm"
									onClick={saveDocTemp}
								>
									Сохранить шаблон
								</button>
							)}
							{/*  */}
							{templateData.content && (
								<button
									className="btn btn-danger btn-md btn-block btn-sm"
									onClick={deleteDocTemp}
								>
									Удалить
								</button>
							)}
						</div>
					</div>
				</div>
			</Modal>
			{/* TEMPLATE END*/}
		</>
	);
}

export { TemplateButtons };
