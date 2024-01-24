import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import htmlDocx from "html-docx-js";
import { saveAs } from "file-saver";

import { createTokens, fromTokensToResult, getDataByIdFromURL } from "../functions";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

const TINYMCEPATH = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js'

function TempAnyDoc2() {
	const person = useSelector((state) => state.personReducer.person);
	const navigate = useNavigate()
	const template = useSelector(state => state.templateReducer)
	
	const [contentBack, setContentBack] = useState();
	const [dirty, setDirty] = useState(false)
	const [previewType, setPreviewType] = useState("tokens");
	const [tokens, setTokens] = useState(createTokens(person));
	const [templateData, setTemplateData] = useState(template);

	const [initialTemplateTitle, setInitialTemplateTitle] = useState(templateData.title)

	useEffect(() => {
		console.log("tokens in state");
		console.log(tokens);
        async function getData() {
            const data = await getDataByIdFromURL('doctemplates') // TODO calling now even if there no id (create instead)
            console.log('useEffect data: ',data)
			if (data) {
				setTemplateData({
					...data
				})
				setInitialTemplateTitle(data.title)
			}
        }
        getData()
	}, []);
	
	
	function onChange(e) {
		e.persist();
		setTemplateData({
			...templateData,
			[e.target.id]: e.target.value
		})
	}

	const editorRef = useRef(null);

	const log = (e) => {
		e.preventDefault();
		if (editorRef.current) {
			console.log('templateData');
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
				content: fromTokensToResult(tokens, editorRef.current.getContent())
			})
		} else {
			setPreviewType("tokens");
			setTemplateData({
				...templateData,
				content: contentBack
			})
			tinymce.activeEditor.mode.set("design");
		}
	};

	const saveDocTemp = () => {
		const data = {
			...templateData,
			content: editorRef.current.getContent(),
		};

		if (editorRef.current) {
			setDirty(false)
			editorRef.current.setDirty(false)
		}

		axios.post(`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/write`, data).then(item => {
            alert(`Шаблон ${templateData.title} создан`);
            navigate(`/doctemplates/id${item.data._id}`)
            // TODO click on the /create doesn't empty form
            // TODO buttons after creation doesn't changes
            // const dataFromURL = getDataByIdFromURL('doctemplates') 
            // data._id = item.data._id
            // this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
        })

	};

	const saveCopyDocTemp = () => {
		const data = {
			...templateData,
			content: editorRef.current.getContent(),
		};

		delete data._id
		
		axios.post(`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/write`, data).then(item => {
            alert(`Шаблон ${templateData.title} создан`);
			editorRef.current.setDirty(false)
            navigate(`/doctemplates/id${item.data._id}`)
            // TODO click on the /create doesn't empty form
            // TODO buttons after creation doesn't changes
            const dataFromURL = getDataByIdFromURL('doctemplates') 
            // data._id = item.data._id
            // this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
        })
	};

	const deleteDocTemp = () => {
		if (confirm(`Вы действительно хотите удалить шаблон "${templateData.title}"?`)) {
			alert(`Шаблон "${templateData.title}" действительно в натуре удален`)
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
		stringHTMLFinal += templateData.content
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
							onClick={saveDocTemp} disabled={!dirty}
						>
							Сохранить
						</button>
					)}
					&nbsp;
					{/*  */}
					{templateData.content && (
						<button
							className="btn btn-warning btn-md btn-block btn-sm"
							onClick={saveCopyDocTemp} disabled={templateData.title === initialTemplateTitle}
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
				<Editor
					tinymceScriptSrc={TINYMCEPATH}
					onInit={(evt, editor) => editorRef.current = editor}
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
						selector: 'textarea#open-source-plugins',
						plugins: 'print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
						imagetools_cors_hosts: ['picsum.photos'],
						menubar: 'file edit view insert format tools table help',
						toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
						toolbar_sticky: true,
						autosave_ask_before_unload: true,
						autosave_interval: '30s',
						autosave_prefix: '{path}{query}-{id}-',
						autosave_restore_when_empty: false,
						autosave_retention: '2m',
						image_advtab: true,
						link_list: [
						  { title: 'My page 1', value: 'https://www.tiny.cloud' },
						  { title: 'My page 2', value: 'http://www.moxiecode.com' }
						],
						image_list: [
						  { title: 'My page 1', value: 'https://www.tiny.cloud' },
						  { title: 'My page 2', value: 'http://www.moxiecode.com' }
						],
						image_class_list: [
						  { title: 'None', value: '' },
						  { title: 'Some class', value: 'class-name' }
						],
						importcss_append: true,
						file_picker_callback: function (callback, value, meta) {
						  /* Provide file and text for the link dialog */
						  if (meta.filetype === 'file') {
							callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
						  }
					  
						  /* Provide image and alt text for the image dialog */
						  if (meta.filetype === 'image') {
							callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
						  }
					  
						  /* Provide alternative source and posted for the media dialog */
						  if (meta.filetype === 'media') {
							callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
						  }
						},
						templates: [
							  { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
						  { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
						  { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
						],
						template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
						template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
						height: 600,
						image_caption: true,
						quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
						noneditable_noneditable_class: 'mceNonEditable',
						toolbar_mode: 'sliding',
						contextmenu: 'link image imagetools table',
						skin: 'oxide', //'oxide-dark';
						content_css: 'default', //'dark';
						content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
					   }}
				/>
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
