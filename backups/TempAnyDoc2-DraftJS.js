import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { convertToRaw, EditorState, convertFromHTML, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";
import draftToHtml from "draftjs-to-html";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import htmlDocx from "html-docx-js";
import { saveAs } from "file-saver";

import {
	createTokens,
	fromTokensToResult,
	getDataByIdFromURL,
} from "../functions";

import * as fns from './EditorStylesFn'

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function TempAnyDoc2() {
	const person = useSelector((state) => state.personReducer.person);
	const navigate = useNavigate();

	const fromMarkupToState = (html) => {
		const blocks = convertFromHTML(html)
		const state = ContentState.createFromBlockArray(
			blocks.contentBlocks,
			blocks.entityMap
		)
		return state
	}
	
	const [contentBack, setContentBack] = useState();
	const [dirty, setDirty] = useState(false);
	const [previewType, setPreviewType] = useState("tokens");
	const [tokens, setTokens] = useState(createTokens(person));
	const [templateData, setTemplateData] = useState({
		title: "",
		type: "",
		description: "",
		content: `<h3 style="padding-left: 640px;">Lorem ipsum dolor sit amet</h3>
		<h3 style="padding-left: 640px;">%ФАМИЛИЯ% %ИМЯ% %ОТЧЕСТВО%</h3>
		<h3 style="padding-left: 640px;">adipisicing elit.&nbsp;</h3>
		<h3 style="padding-left: 640px;">&nbsp;</h3>
		<h3 style="text-align: center;">Заявление</h3>
		<p style="text-align: center;">&nbsp;</p>
		<p>Я, товарищ %ФАМИЛИЯ% %ИМЯ% %ОТЧЕСТВО%, Паспорт РФ %ПАСПОРТСЕРИЯ% %ПАСПОРТНОМЕР% natus exercitationem consequuntur, minus earum nihil cupiditate, laudantium numquam fugit corporis dolorem. Aspernatur fuga sunt, consequuntur consectetur rem ullam.</p>`,
	});

	const [editorState, setEditorState] = useState(
		EditorState.createWithContent(fromMarkupToState(templateData.content))
		);
	const [initialTemplateTitle, setInitialTemplateTitle] = useState(templateData.title)
	const [initialTemplateContent, setInitialTemplateContent] = useState(editorState.getCurrentContent())

	useEffect(() => {
		console.log("tokens in state");
		console.log(tokens);
		async function getData() {
			const data = await getDataByIdFromURL("doctemplates"); // TODO calling now even if there no id (create instead)
			console.log("useEffect data: ", data);
			if (data) {
				setTemplateData({
					...data,
				});
			}
			setInitialTemplateTitle(data.title);
		}
		getData();
	}, []);

	function onChange(e) {
		e.persist();

		setTemplateData({
			...templateData,
			[e.target.id]: e.target.value,
		});
	}

	const log = (e) => {
		e.preventDefault();
			console.log("templateData");
			console.log(templateData);
			console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())));
	};

	const showResult = (e) => {
		e.preventDefault();
		if (previewType === "tokens") {
			// TODO Set Editor to 'READ ONLY' mode
			// tinymce.activeEditor.mode.set("readonly");
			setPreviewType("result");
			setContentBack(draftToHtml(convertToRaw(editorState.getCurrentContent())));
			const content = fromTokensToResult(
				tokens,
				draftToHtml(convertToRaw(editorState.getCurrentContent()))
			)

			setTemplateData({
				...templateData,
				[content]: content, // here is an error but no need to fix it, cause it will be refactored
			});
		} else {
			setPreviewType("tokens");
			setTemplateData({
				...templateData,
				[content]: contentBack, // here is an error but no need to fix it, cause it will be refactored
			});
			// TODO Set Editor to 'EDIT' mode
			// tinymce.activeEditor.mode.set("design");
		}
	};

	const saveDocTemp = () => {
		const data = {
			...templateData,
			content: draftToHtml(convertToRaw(editorState.getCurrentContent())),
		};
		console.log("data to save");
		console.log(data);

			// TODO set dirty
			// setDirty(false);
			// editorRef.current.setDirty(false);

		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/write`, data)
			.then((item) => {
				// TODO correct the alert message
				alert(`Шаблон ${templateData.title} создан/сохранен`);
				navigate(`/doctemplates/id${item.data._id}`);
				// TODO click on the /create doesn't empty form
				// TODO buttons after creation doesn't changes
				// const dataFromURL = getDataByIdFromURL('doctemplates')
				// data._id = item.data._id
				// console.log(dataFromURL._id)
				// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
			});
	};

	const saveCopyDocTemp = () => {
		const data = {
			...templateData,
			content: draftToHtml(convertToRaw(editorState.getCurrentContent())),
		};

		delete data._id;
		console.log("data to save after deletion _id");
		console.log(data);

		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/write`, data)
			.then((item) => {
				navigate(`/doctemplates/id${item.data._id}`);
				alert(`Копия шаблона ${templateData.title} создана и вы сейчас с ней работаете`);
				// TODO click on the /create doesn't empty form
				// TODO buttons after creation doesn't changes
				const dataFromURL = getDataByIdFromURL("doctemplates");
				setTemplateData({ ...item.data })
				// data._id = item.data._id
				// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
			});

			
	};

	const deleteDocTemp = () => {
		if (
			confirm(
				`Вы действительно хотите удалить шаблон "${templateData.title}"?`
			)
		) {
			alert(
				`Шаблон "${templateData.title}" действительно удален`
			);
		}
	};

	const callSave = (e) => {
		e.preventDefault()
		let stringHTMLFinal = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<title>Сгенерированный документ</title>
			</head>
		<body>`
		stringHTMLFinal += draftToHtml(convertToRaw(editorState.getCurrentContent()))
		stringHTMLFinal += `
		</body>
		</html>
		`

		const converted = htmlDocx.asBlob(stringHTMLFinal)
		saveAs(converted, 'GeneratedDoc-Test.docx')
	}

	return (
		<>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-evenly",
				}}
			>
				{tokens.map(
					(element) =>
						element[1] && (
							<div
								style={{
									border: "1px solid gray",
									paddingLeft: "2px",
									paddingRight: "2px",
								}}
							>
								{element[0]} = {element[1]}
							</div>
						)
				)}
			</div>
			<div className="row">
				<div className="col-md-5 mb-3">
					{/* <label htmlFor='title'>
										Имя шаблона
									</label> */}
					<input
						type="text"
						className="form-control"
						id="title"
						placeholder="Имя шаблона"
						value={templateData.title}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="col-md-4 mb-3">
					{/* КНОПКИ */}
					{/*  */}
					{templateData.content && (
						<button
							className="btn btn-primary btn-md btn-block btn-sm"
							onClick={saveDocTemp}
							disabled={
								initialTemplateContent === editorState.getCurrentContent()
							}
						>
							Сохранить
						</button>
					)}
					&nbsp;
					{/*  */}
					{templateData.content && (
						<button
							className="btn btn-warning btn-md btn-block btn-sm"
							onClick={saveCopyDocTemp}
							disabled={
								templateData.title === initialTemplateTitle
							}
						>
							Сохранить копию
						</button>
					)}
					&nbsp;
					{/*  */}
					{templateData.content && (
						<button
							className="btn btn-danger btn-md btn-block btn-sm"
							onClick={deleteDocTemp}
						>
							Удалить шаблон
						</button>
					)}
					&nbsp;
				</div>
			</div>
			<div className="row">
				<div className="col-md-3 mb-3">
					{/* <label htmlFor='title'>
										Имя шаблона
									</label> */}
					<input
						type="text"
						className="form-control"
						id="type"
						placeholder="Тип шаблона"
						value={templateData.type}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="col-md-9 mb-3">
					{/* <label htmlFor='title'>
										Имя шаблона
									</label> */}
					<input
						type="text"
						className="form-control"
						id="description"
						placeholder="Описание шаблона"
						value={templateData.description}
						onChange={(e) => onChange(e)}
					/>
				</div>
			</div>
			<form>
				{/* */}
				<Editor
					defaultEditorState={editorState}
					onEditorStateChange={setEditorState}
					wrapperClassName="wrapper-class"
					editorClassName="editor-class"
					toolbarClassName="toolbar-class"
					blockStyleFn={fns.jcBlockquote}
				/>
				<div className="code-view">
					<p>HTML View </p>
					<textarea
						className="text-area"
						disabled
						value={draftToHtml(
							convertToRaw(editorState.getCurrentContent())
						)}
					/>
				</div>
				{/*  */}
				<button onClick={log}>Log editor content</button>
				<button onClick={showResult}>
					{previewType === "tokens" ? "Show Result" : "Show Tokens"}
				</button>
				<button onClick={callSave}>Сгенерировать Ворд</button>
			</form>
		</>
	);
}

export { TempAnyDoc2 };
