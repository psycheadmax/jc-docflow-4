import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
	addTemplateActionCreator,
	removeTemplateActionCreator,
} from "../store/templateReducer";
import { addDocActionCreator, removeDocActionCreator } from '../store/docReducer';
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from '../components/Modal';

import htmlDocx from "html-docx-js";
import { saveAs } from "file-saver";

import {
	createTokens,
	fromTokensToResult,
	getDataByIdFromURL,
	paymentsSchedule
} from "../functions";

const dayjs = require("dayjs");

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function DocumentButtons() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const person = useSelector((state) => state.personReducer.person);
	const caseName = useSelector((state) => state.caseReducer);
	const template = useSelector((state) => state.templateReducer);
	const doc = useSelector((state) => state.docReducer);

	const [templateData, setTemplateData] = useState(template);
	const [destinationDocName, setDestinationDocName] = useState(
		doc.name ||
		`${person.lastName} ${person.firstName[0]}.${person.middleName[0]}. - ${templateData.type}`
	);

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
			setTemplateData({
				...templateData,
				[id]: value,
			});
		}
	}

	const editorRef = useRef(null);

	const saveDoc = async(e) => {
		e.preventDefault();
		let docExist;
		const query = { name: destinationDocName };
		try {
			docExist = await axios.post(
				`${SERVER_IP}:${SERVER_PORT}/api/docs/check`,
				query
				);
			} catch (error) {
				console.error(error);
			}

			console.log(query)
			console.log(docExist.data)
			
			// return

			let message;
			docExist.data
			? (message = `"${query.name}" уже существует.\nПерезаписать?`)
			: (message = `"${query.name}" нет в БД.\nСоздать?`);
			
			if (confirm(message)) {
				const data = {
					name: destinationDocName,
					idPerson: person._id,
					idCase: caseName._id,
					// type: TODO
					idTemplate: template._id,
					type: templateData.type,
					date: dayjs().format(),
					templateString: editorRef.current.getContent(),
					templateResultString: fromTokensToResult(
						tokens,
						editorRef.current.getContent()
					),
					// docProps: '' // TODO What about docProps?
				};
			try {
				await axios
					.post(
						`${SERVER_IP}:${SERVER_PORT}/api/docs/write`,
						data
					)
					.then((item) => {
						dispatch(removeDocActionCreator());
						dispatch(addDocActionCreator(item.data));
						alert(`Документ ${item.data.name} создан`);
						// const dataFromURL = getDataByIdFromURL('doctemplates')
						// data._id = item.data._id
						// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
					});
			} catch (error) {
				console.log(error);
			}
		}
	};

	const deleteDoc = () => {
		if (
			confirm(
				`Вы действительно хотите удалить документ "${destinationDocName}"?`
			)
		) {
			// TODO think about doc deletion
			alert(`Документ "${destinationDocName}" удален`);
		}
	};

	return (
		<>
			{/* DOCUMENT buttons */}
			<div className="row">
				<div className="col-md-6 mb-3">
					{/* <label htmlFor='title'>
										Имя шаблона
									</label> */}
					<input
						type="text"
						className="form-control"
						id="destinationDocName"
						placeholder="Имя документа"
						value={destinationDocName}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="col-md-4 mb-3">
					{/* КНОПКИ */}
					<div className="page-buttons">
						{/*  */}
						{templateData.content && (
							<button
								className="btn btn-primary btn-md btn-block btn-sm"
								onClick={saveDoc}
							>
								Сохранить документ
							</button>
						)}
						{/*  */}
						{doc._id && (
							<button
								className="btn btn-danger btn-md btn-block btn-sm"
								onClick={deleteDoc}
								disabled={doc._id}
							>
								Удалить документ
							</button>
						)}
					</div>
				</div>
			</div>
			{/* DOCUMENT END */}
		</>
	);
}

export { DocumentButtons };
