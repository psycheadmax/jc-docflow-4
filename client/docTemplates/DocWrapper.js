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
	getDataByIdFromURL,
} from "../functions";

const dayjs = require("dayjs");

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];
const TINYMCEPATH =
	"https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js";

function DocWrapper() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const person = useSelector((state) => state.personReducer.person);
	const caseName = useSelector((state) => state.caseReducer);
	const template = useSelector((state) => state.templateReducer);
	const doc = useSelector((state) => state.docReducer);

	const [contentBack, setContentBack] = useState();
	const [dirty, setDirty] = useState(false);

	useEffect(() => {
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
		stringHTMLFinal += editorRef.current.getContent(),
		stringHTMLFinal += `
		</body>
		</html>
		`;

		const converted = htmlDocx.asBlob(stringHTMLFinal);
		saveAs(converted, `${doc.name}.docx`);
	};

	return (
		<>
			<h3>{doc.name}</h3>
			{/* TINYMCE EDITOR */}
			<form>
				<Editor
					tinymceScriptSrc={TINYMCEPATH}
					onInit={(evt, editor) => (editorRef.current = editor)}
					initialValue={doc.templateResultString}
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
				<button className="btn btn-primary btn-md btn-block btn-sm" onClick={callSave}>Сгенерировать .docx</button>
			</form>
			{/* TINYMCE EDITOR END*/}
		</>
	);
}

export { DocWrapper };
