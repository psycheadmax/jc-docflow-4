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
const TINYMCEPATH =
	"https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js";

function TempAnyDoc2() {
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
	const [modalActive, setModalActive] = useState(false)

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

	const log = (e) => {
		e.preventDefault();
		if (editorRef.current) {
			console.log("templateData");
			console.log(templateData);
		}
	};

	const showResult = (e) => {
		e.preventDefault();
		if (previewType === "tokens") {
			tinymce.activeEditor.mode.set("readonly");
			setPreviewType("result");
			setContentBack(editorRef.current.getContent());
			setTemplateData({
				...templateData,
				content: fromTokensToResult(
					tokens,
					editorRef.current.getContent()
				),
			});
		} else {
			setPreviewType("tokens");
			setTemplateData({
				...templateData,
				content: contentBack,
			});
			tinymce.activeEditor.mode.set("design");
		}
	};

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
						setModalActive(false)
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
						dispatch(removeTemplateActionCreator())
						navigate(`/doctemplates`);
						alert(
							`Шаблон "${item.data.title}" удален.`
						);
					});
			} catch (error) {
				console.error(error);
			}
		}
	};

	const callSave = (e) => {
		e.preventDefault();
		let stringHTMLFinal = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<title>Сгенерированный документ</title>
			</head>
		<body>`;
		stringHTMLFinal += templateData.content;
		stringHTMLFinal += `
		</body>
		</html>
		`;

		const converted = htmlDocx.asBlob(stringHTMLFinal);
		saveAs(converted, "GeneratedDoc-Test.docx");
	};

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

	console.log(paymentsSchedule())

	return (
		<>
			{/* TOKENS */}
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
			{/* TOKENS END */}
			{/* DOCUMENT */}
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
				<div className="col-md-2 mb-3">
					<button className="btn btn-outline-primary btn-md btn-block btn-sm" onClick={() => setModalActive(true)}>Управление шаблоном</button>
				</div>
			</div>
			{/* DOCUMENT END */}
			{/* TEMPLATE */}
			<Modal active={modalActive} setActive={setModalActive}>
				<div className="row">
					<div className="col-md-12 mb-3">
						<label htmlFor='title'>
											Имя
										</label>
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
						<label htmlFor='title'>
											Тип
										</label>
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
						<label htmlFor='scenario'>
											Scenario
										</label>
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
						<label htmlFor='title'>Описание</label>
						<textarea class="form-control" id="description" rows="3" value={templateData.description} placeholder='Описание'></textarea>
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
			{/* TINYMCE EDITOR */}
			<form>
				<Editor
					tinymceScriptSrc={TINYMCEPATH}
					onInit={(evt, editor) => (editorRef.current = editor)}
					initialValue={templateData.content}
					onDirty={() => setDirty(true)}
					init={
						// BASIC TINYMCE
						// 	{
						// 	height: 700,
						// 	menubar: true,
						// 	plugins: [
						// 		"advlist autolink lists link image charmap print preview anchor",
						// 		"searchreplace visualblocks code fullscreen",
						// 		"insertdatetime media table paste code help wordcount",
						// 	],
						// 	toolbar:
						// 		"undo redo | formatselect | " +
						// 		"bold italic backcolor | alignleft aligncenter " +
						// 		"alignright alignjustify | bullist numlist outdent indent | " +
						// 		"removeformat | help ",
						// 	content_style:
						// 		"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
						// }
						// END OF BASIC TINYMCE
						{
							selector: "textarea#open-source-plugins",
							plugins:
								"print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons",
							imagetools_cors_hosts: ["picsum.photos"],
							menubar:
								"file edit view insert format tools table help",
							toolbar:
								"undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl",
							toolbar_sticky: true,
							autosave_ask_before_unload: true,
							autosave_interval: "30s",
							autosave_prefix: "{path}{query}-{id}-",
							autosave_restore_when_empty: false,
							autosave_retention: "2m",
							image_advtab: true,
							link_list: [
								{
									title: "My page 1",
									value: "https://www.tiny.cloud",
								},
								{
									title: "My page 2",
									value: "http://www.moxiecode.com",
								},
							],
							image_list: [
								{
									title: "My page 1",
									value: "https://www.tiny.cloud",
								},
								{
									title: "My page 2",
									value: "http://www.moxiecode.com",
								},
							],
							image_class_list: [
								{ title: "None", value: "" },
								{ title: "Some class", value: "class-name" },
							],
							importcss_append: true,
							file_picker_callback: function (
								callback,
								value,
								meta
							) {
								/* Provide file and text for the link dialog */
								if (meta.filetype === "file") {
									callback(
										"https://www.google.com/logos/google.jpg",
										{ text: "My text" }
									);
								}

								/* Provide image and alt text for the image dialog */
								if (meta.filetype === "image") {
									callback(
										"https://www.google.com/logos/google.jpg",
										{ alt: "My alt text" }
									);
								}

								/* Provide alternative source and posted for the media dialog */
								if (meta.filetype === "media") {
									callback("movie.mp4", {
										source2: "alt.ogg",
										poster: "https://www.google.com/logos/google.jpg",
									});
								}
							},
							templates: [
								{
									title: "New Table",
									description: "creates a new table",
									content:
										'<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>',
								},
								{
									title: "Starting my story",
									description: "A cure for writers block",
									content: "Once upon a time...",
								},
								{
									title: "New list with dates",
									description: "New List with dates",
									content:
										'<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>',
								},
							],
							template_cdate_format:
								"[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
							template_mdate_format:
								"[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
							height: 600,
							image_caption: true,
							quickbars_selection_toolbar:
								"bold italic | quicklink h2 h3 blockquote quickimage quicktable",
							noneditable_noneditable_class: "mceNonEditable",
							toolbar_mode: "sliding",
							contextmenu: "link image imagetools table",
							skin: "oxide", //'oxide-dark';
							content_css: "default", //'dark';
							content_style:
								"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
						}
					}
				/>
				<button onClick={log}>Log editor content</button>
				<button onClick={showResult}>
					{previewType === "tokens" ? "Show Result" : "Show Tokens"}
				</button>
				<button onClick={callSave}>Сгенерировать Ворд</button>
			</form>
			{/* TINYMCE EDITOR END*/}
		</>
	);
}

export { TempAnyDoc2 };
