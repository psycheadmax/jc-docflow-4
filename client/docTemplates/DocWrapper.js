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
import { TinyEditorAndButtons } from "./TinyEditorAndButtons";
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
			<TinyEditorAndButtons
				docName={doc.name || `${person.lastName} ${person.firstName[0]}.${person.middleName[0]}. - Договор банкротство`}
				documentMode={true}
				// tokens={tokens}
				// templateURLName={templateURLName}
			/>
			{/* TINYMCE EDITOR END*/}
		</>
	);
}

export { DocWrapper };
