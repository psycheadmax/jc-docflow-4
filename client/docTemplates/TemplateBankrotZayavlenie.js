import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
import dayjs from "dayjs";
import 'dayjs/locale/ru'
import {
	createTokens,
	deleteRub,
	getCurrentYearNumbers,
	getUnusedNumbers,
	paymentsSchedule,
} from "../functions";
import { Tokens } from "./Tokens";
import { TinyEditorAndButtons } from "./TinyEditorAndButtons";
import { addTemplateActionCreator } from '../store/templateReducer';
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import petrovich from "petrovich";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];


function TemplateBankrotZayavlenie() {
	// Шаблон Заявление гражданина-должника о признании банкротом
	const templateURLName = 'templatebankrotzayavlenie'
	const rubles = require("rubles").rubles;
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const person = useSelector((state) => state.personReducer.person);
	const caseName = useSelector((state) => state.caseReducer);
	const doc = useSelector((state) => state.docReducer);

	const fileInputRef = useRef(null)

	function handleTemplateStateChange(data) {
		setTemplateState((prevState) => ({ ...prevState, ...data }));
	}

	useEffect(() => {
		async function getTemplate() {
			const query = {title: 'Шаблон заявление гражданина-должника о признании банкротом'}
				try {
					const response = await axios.post(
						`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/search`, query
					);
					const template = response.data;
					dispatch(addTemplateActionCreator(template))
					console.log('got template and dispatched: ', response.data)
				} catch (error) {
					console.error("Error fetching document template:", error);
				}
		}

		getTemplate()
		handleChange()
	}, []);

	const personAccusative = petrovich({first: person.firstName, middle: person.middleName, last: person.lastName}, 'accusative')
	console.log('personAccusative:', personAccusative)

	const initialDocProps = {
		blockVariant: 'ВАРИАНТ01',
		date: dayjs().format("YYYY-MM-DD"),
		spravkaFnsDate: dayjs().format("YYYY-MM-DD"),
		marriageStatus: 'notMarried',
		deps: [],
		debtDate: dayjs().format("YYYY-MM-DD"),
		totalDebtSum: 0,
		payDebtSum: 0,
		ispolProds: [],
		job: 'working',
		jobIncome: 0,
		deals: [],
		lastNameAccusative: personAccusative.last,
		firstNameAccusative: personAccusative.first,
		middleNameAccusative: personAccusative.middle,
		procedure: 'realization'
	};

	const [docProps, setDocProps] = useState(initialDocProps);
	
	const {
		register,
		handleSubmit,
		watch,
		control,
		setValue,
		getValues,
		reset,
		formState: { errors, isDirty, isValid },
	} = useForm({
		defaultValues: docProps,
		mode: "onChange",
	});

	const { fields: depsFields, append: appendDepsFields, remove: removeDepsFields } = useFieldArray({ control, name: "deps"})
	const emptyDeps = {
		fio: "",
		birthDate: ''
	}

	const { fields: ispolProdsFields, append: appendIspolProdsFields, remove: removeIspolProdsFields } = useFieldArray({ control, name: "ispolProds"})
	const emptyIspolProds = {
		ispolProdNumDate: "",
		ispolProdIsOver: false,
	}

	const { fields: dealsFields, append: appendDealsFields, remove: removeDealsFields } = useFieldArray({ control, name: "deals"})
	const emptyDeals = {
		dealType: "pokupka",
		dealSubject: "",
		dealSubjectGender: "male",
		dealDate: "",
		dealPrice: 0,
	}

	const [tokens, setTokens] = useState(
		[...createTokens(person)].concat([...addDocPropsTokens(getValues())])
	);
	const [pdfContent, setPdfContent] = useState('')

	console.log("tokens:", tokens);
		
	function addDocPropsTokens(values) {
		// AGREEMENT DOCPROPS-SPECIFIED TOKENS
		let docPropsTokens = []

		values.lastNameAccusative && docPropsTokens.push(["%ФАМИЛИЯВИНПАДЕЖ%", values.lastNameAccusative])
		values.firstNameAccusative && docPropsTokens.push(["%ИМЯВИНПАДЕЖ%", values.firstNameAccusative])
		values.middleNameAccusative && docPropsTokens.push(["%ОТЧЕСТВОВИНПАДЕЖ%", values.middleNameAccusative])

		values.spravkaFnsDate && docPropsTokens.push(["%СПРАВКАФНСДАТА%", dayjs(values.spravkaFnsDate).format('DD.MM.YYYY')])

		let marriageBlock = ''
		if (values.marriageStatus === 'notMarried') {
			marriageBlock = 'В браке не состою.'
			docPropsTokens.push(["%БЛОКБРАК%", marriageBlock])
		}
		if (values.marriageStatus === 'married' && values.marriageActDate && values.spouse) {
			marriageBlock = `С ${dayjs(values.marriageActDate).format('DD.MM.YYYY')} состою в браке с ${values.spouse}.`
			docPropsTokens.push(["%БЛОКБРАК%", marriageBlock])
		}
		if (values.marriageStatus === 'divorced') {
			marriageBlock = `В браке не состою. Брак расторгнут ${dayjs(values.marriageActDate).format('DD.MM.YYYY')}.`
			docPropsTokens.push(["%БЛОКБРАК%", marriageBlock])
		}
		if (values.marriageStatus === 'spouseDied') {
			marriageBlock = `В браке не состою (супруг умер ${dayjs(values.marriageActDate).format('DD.MM.YYYY')}.)`
			docPropsTokens.push(["%БЛОКБРАК%", marriageBlock])
		}
		
		let depsBlock = 'В наличии имеются следующие иждивенцы:'
		if (values.deps) {
			for (const i in values.deps) {
				const current =  ` ${values.deps[i].fio} ${dayjs(values.deps[i].birthDate).format('DD.MM.YYYY')}г.р.`
				console.log('счет:', i, values.deps.length-1)
				if (i === values.deps.length-1) {
					depsBlock += current + '. '	
				} else {
					depsBlock += current + ','
				}
			}
		}
		docPropsTokens.push(["%БЛОКИЖДИВЕНЦЫ%", depsBlock])

		values.debtDate && docPropsTokens.push(["%ДАТАЗАДОЛЖЕННОСТИ%", dayjs(values.debtDate).format('DD.MM.YYYY')]) 
		values.totalDebtSum && docPropsTokens.push(["%ОБЩАЯСУММАЗАДОЛЖЕННОСТИ%", values.totalDebtSum]) 
		values.payDebtSum && docPropsTokens.push(["%СУММАОБЯЗАТЕЛЬНЫХПЛАТЕЖЕЙ%", values.payDebtSum])

		let ispolProdsBlock = ''
			let ispolsActualStart = 'В отношении меня в настоящее время ОСП по г. Воркуте УФССП России по РК ведутся следующие исполнительные производства:' + '<br/>' + '<ul>'
			let ispolsOverStart = 'Кроме того в соответствии с п.п. 3 и 4 ч. 1 ст. 46 Федерального закона № 229-ФЗ "Об исполнительном производстве" - в связи с невозможностью взыскания по исполнительному документу, по которому взыскание не производилось или произведено частично, ОСП по г. Воркуте УФССП России по РК были окончены следующие исполнительные производства:' + '<br/>' + '<ul>'
			let ispolsActualMid = ''
			let ispolsOverMid = ''
		if (values.ispolProds) {
			for (const i in values.ispolProds) {
				const current =  `${values.ispolProds[i].ispolProdNumDate}`
				console.log('current:', current)
				if (!values.ispolProds[i].ispolProdIsOver) {
					ispolsActualMid += '<li>' + '№ ' + current + ';' + '</li>'
				} else {
					ispolsOverMid += '<li>' + '№ ' + current + ';' + '</li>'
				}
			}
			console.log(ispolsActualMid)
			console.log(ispolsOverMid)
			if (ispolsActualMid !== '' ) {
				ispolProdsBlock = ispolsActualStart + ispolsActualMid.slice(0, -6) + '.</li></ul>' + '<br/>'
			}
			if (ispolsOverMid !== '' ) {
				ispolProdsBlock = ispolProdsBlock + ispolsOverStart + ispolsOverMid.slice(0, -2) + '.</li></ul>' + '<br/>'
			}
		}
		docPropsTokens.push(["%БЛОКИСПОЛПРОИЗВОДСТВА%", ispolProdsBlock])

		let dealsBlock = 'В настоящее время я не имею в собственности движимого или недвижимого имущества.' + '<br/>'
			let dealsSubBlock = ''
		if (values.deals.length) {
			for (const i in values.deals) {
				const current = values.deals[i]
				let pokupkaForm = ' был приобретен'
				let prodazhaForm = ' был продан'
				let menaForm = ' был обменян'
				let darenieForm = ' был подарен'
				if (current.dealSubjectGender === 'female') {
					pokupkaForm = ' была приобретена'
					prodazhaForm = ' была продана'
					menaForm = ' была обменяна'
					darenieForm = ' была подарена'
				} else if (current.dealSubjectGender === 'middle') {
					pokupkaForm = ' было приобретено'
					prodazhaForm = ' было продано'
					menaForm = ' было обменяно'
					darenieForm = ' было подарено'
				}
				console.log('current', current)
				switch (current.dealType) {
					case 'pokupka':
						dealsSubBlock += '<li>' + dayjs(current.dealDate).format('DD.MM.YYYY') + ' мной по договору купли-продажи' + pokupkaForm + ' ' + current.dealSubject + ', стоимостью' + ' ' + current.dealPrice + ' руб.' + '</li>'
						break
					case 'prodazha':
						dealsSubBlock += '<li>' + dayjs(current.dealDate).format('DD.MM.YYYY') + ' мной по договору купли-продажи' + prodazhaForm + ' ' + current.dealSubject + ', стоимостью' + ' ' + current.dealPrice + ' руб.' + '</li>'
						break
					case 'mena':
						dealsSubBlock += '<li>' + dayjs(current.dealDate).format('DD.MM.YYYY') + ' мной по договору мены' + menaForm + ' ' + current.dealSubject + ', стоимостью' + ' ' + current.dealPrice + ' руб.' + '</li>'
						break
					case 'darenie':
						dealsSubBlock += '<li>' + dayjs(current.dealDate).format('DD.MM.YYYY') + ' мной по договору дарения' + darenieForm + ' ' + current.dealSubject + ', стоимостью' + ' ' + current.dealPrice + ' руб.' + '</li>'
						break;		
					// default:
					// 	break;
				}
			}
			dealsBlock = '<ul>' + dealsSubBlock + '</ul>' + '<br/>' + 'Вырученные средства были направлены на ' + values.dealsTarget
		}
		docPropsTokens.push(["%БЛОКСДЕЛКИ%", dealsBlock])


		let jobBlock = ''
		let jobIncomeBlock = ''
		if (values.job) {
				console.log('job', values.job)
				switch (values.job) {
					case 'working':
						jobBlock = `В настоящее время ${(person.gender === 'муж' || person.gender === 'м' || person.gender === 'male') ? 'трудоустроен' : 'трудоустроена'} в ${values.jobPlace}.`
						jobIncomeBlock = `заработная плата в размере около `
						break
					case 'selfBusy':
						jobBlock = `В настоящее время являюсь ${(person.gender === 'муж' || person.gender === 'м' || person.gender === 'male') ? 'самозанятым' : 'самозанятой'}.`
						jobIncomeBlock = `заработная плата в размере около `
						break
					case 'pensionerOld':
						jobBlock = `В настоящее время являюсь получателем пенсии по старости.`
						jobIncomeBlock = `пенсия по старости в размере около `
						break
					case 'pensionerInvalid':
						jobBlock = `В настоящее время являюсь получателем пенсии по инвалидности.`
						jobIncomeBlock = `пенсия по инвалидности в размере около `
						break
					case 'unemployed':
						jobBlock = `В настоящее время состою на учете в ГУ РК "ЦЗН города Воркуты" в качестве ${(person.gender === 'муж' || person.gender === 'м' || person.gender === 'male') ? 'безработного' : 'безработной'}.`
						jobIncomeBlock = `пособие по безработице в размере около `
						break
					case 'notWorking':
						jobBlock = `В настоящее время не ${(person.gender === 'муж' || person.gender === 'м' || person.gender === 'male') ? 'трудоустроен' : 'трудоустроена'}.`
						break
					// default:
					// 	break;
				}
		}
		values.job && docPropsTokens.push(["%ТРУДОУСТРОЙСТВО%", jobBlock])
		values.job && docPropsTokens.push(["%ИСТОЧНИКДОХОДА%", jobIncomeBlock])
		values.jobIncome && docPropsTokens.push(["%ДОХОД%", values.jobIncome])

		let procedureBlock = ''
			let personDataString = ''
		if (values.addressToUse === 0 || values.addressToUse) {
			console.log('values.addressToUse', values.addressToUse)
			const i = values.addressToUse
			personDataString = `${values.lastNameAccusative} ${values.firstNameAccusative} ${values.middleNameAccusative} , ${dayjs(person.birthDate).format("DD.MM.YYYY")} года рождения, ИНН ${person.innNumber}, ${(person.gender === 'муж' || person.gender === 'м' || person.gender === 'male') ? 'зарегистрированного' : 'зарегистрированную'} по месту жительства по адресу: 
			${person.address[i].index ? person.address[i].index : ''} 
			${person.address[i].subject ? person.address[i].subject : ''} 
			${person.address[i].district ? person.address[i].district : ''} 
			${person.address[i].city ? person.address[i].city : ''} 
			${person.address[i].settlement ? person.address[i].settlement : ''} 
			${person.address[i].street ? person.address[i].street : ''} 
			${person.address[i].building ? person.address[i].building : ''} 
			${person.address[i].corp ? person.address[i].corp : ''} 
			${person.address[i].appartment ? person.address[i].appartment : ''} 
			`
		if (values.procedure === 'realization') {
			console.log(values.procedure)
			procedureBlock = `признать мое заявление о несостоятельности обоснованным, меня - ${personDataString}, -  несостоятельным (банкротом), и ввести процедуру реализации имущества гражданина`
		} else {
			console.log(values.procedure)
			procedureBlock = `признать мое заявление о несостоятельности обоснованным и ввести  в отношении меня - ${personDataString}, - процедуру реструктуризации долгов гражданина`
			}
		}
		values.procedure && docPropsTokens.push(["%БЛОКПРОЦЕДУРА%", procedureBlock])

		let attachmentsBlock = ''
			let attachmentsLines = ''
		if (values.attachments) {
			const attachmentsArray = values.attachments.split('\n')
				for (const i in attachmentsArray) {
					const current = `${attachmentsArray[i]}`
					console.log('current:', current)
						attachmentsLines +='<li>' + current + '</li>'
				}
			attachmentsBlock = '<ol>' + attachmentsLines + '</ol>'
		}
		values.attachments && docPropsTokens.push(["%БЛОКПРИЛОЖЕНИЕ%", attachmentsBlock])
		// values.date && docPropsTokens.push(["%ЗАЯВЛЕНИЕДАТА%", dayjs(values.date).format("DD.MM.YYYY")]);

		const documentDate = values.date || dayjs()
		const ruLocaleDate = dayjs(documentDate).locale("ru").format('DD MMMM YYYY')
		const dateArr = ruLocaleDate.split(' ')
		docPropsTokens.push(["%ДАТАКРАТКО%", dayjs(documentDate).format('DD.MM.YY')])
		docPropsTokens.push(["%ДАТАПОЛНОСТЬЮ%", ruLocaleDate])
		docPropsTokens.push(["%ДАТАЧИСЛО%", dateArr[0]])
		docPropsTokens.push(["%ДАТАМЕСЯЦБУКВЫ%", dateArr[1]])
		docPropsTokens.push(["%ДАТАГОД2%", dateArr[2].slice(2, 4)])
		docPropsTokens.push(["%ДАТАГОД4%", dateArr[2]])
		// values.totalSum && docPropsTokens.push(["%ДОГОВОРСУММАПРОПИСЬ%", deleteRub(rubles(values.totalSum))]);

		return docPropsTokens
	}

	async function handleChange() {
		setDocProps(getValues());
		const extraTokens =  addDocPropsTokens(getValues())
		setTokens([...createTokens(person)].concat([...addDocPropsTokens(getValues())]));
	}

	function logValues() {
		console.log(getValues());
	}

	const deleteCaseProps = (e) => {
		e.preventDefault();
		const reallyDelete = confirm(`Действительно удалить это дело из БД?`);
		if (reallyDelete) {
			axios
				.post(
					`${SERVER_IP}:${SERVER_PORT}/api/cases/delete/id${caseData._id}`
				)
				.then((data) => {
					alert(`Дело ${data._id} удалено из БД`);
					// this.props.history.push(`/persons/create`); // TODO
				});
			navigate(`/cases`);
		}
	};

	async function getDebtsFromSpisokKreditorov() {
		let foundDocs = []
		const query = {
			$and: [
				{
				  $or: [
					{ 'docProps.p11kreditorsNePredprinDen': { $exists: true } },
					{ 'docProps.p12kreditorsNePredprinPlat': { $exists: true } }
				  ]
				},
				{ 'idPerson': person._id }
			  ]
		  }
		  
		try {
			const response = await axios.post(
				`${SERVER_IP}:${SERVER_PORT}/api/docs/search`, query
			);
			foundDocs = response.data;
			// dispatch(addTemplateActionCreator(template))
			console.log('found docs: ', foundDocs)
		} catch (error) {
			console.error("Error fetching document template:", error);
		}

		if (foundDocs) {
			const debtDate = foundDocs[0].date
			const sumObyazatelstva = foundDocs[0].docProps.p11kreditorsNePredprinDen.reduce((total, element) => total + parseFloat(element['sumVsego']), 0)
			const sumObyazPlat = foundDocs[0].docProps.p12kreditorsNePredprinPlat.reduce((total, element) => total + parseFloat(element['nedoimka']), 0)
			const sumTotal = sumObyazatelstva + sumObyazPlat

			setValue('debtDate', dayjs(debtDate).format("YYYY-MM-DD"))
			setValue('totalDebtSum', sumTotal)
			setValue('payDebtSum', sumObyazPlat)
		} else {
			alert('Не найдено')
		}
	}

	function genderDetect(e, index) {
		const text = e.target.value.split(' ')[0]
		console.log(text)
		if (text.slice(-1) === 'а' || text.slice(-1) === 'я') { 
			setValue(`deals.${index}.dealSubjectGender`, 'female')	
			console.log('female')
		} else if (text.slice(-1) === 'е' || text.slice(-1) === 'о') {
			setValue(`deals.${index}.dealSubjectGender`, 'middle')	
			console.log('middle')
		} else {
			setValue(`deals.${index}.dealSubjectGender`, 'male')	
			console.log('male')
		}
	}

	function getAndSetDirsFilelist(e)  {
		const fileList = Array.from(e.target.files);
		const result = fileList.map(file => {
			return file.name.replace(/(\..{2,3})$/g, "")
		})
		console.log('getAndSetDirsFilelist:', result)
		setValue('attachments', result.join('\n'))
		handleChange()
	  };

	// TEXT ATTACHMENTS
	// function getTxtContent(e) {
	// 	const file = e.target.files[0];
	// 	const reader = new FileReader();
	// 	let lines = [];
	
	// 	reader.onload = (event) => {
	// 		const text = event.target.result;
	// 		lines = text.split('\n');
	// 		setValue('attachments', text)
	// 	};
	// 	console.log(lines)
	// 	reader.readAsText(file);
	// };
	// TEXT ATTACHMENTS END

	// PDF
	async function importPdf() {
		const pdfArrInfo = await processPdfText();
		insertValues(pdfArrInfo);
	  }

	async function getPdfText(e) {
		if (typeof pdfjsLib === "undefined") {
			console.error("pdfjsLib is not loaded.");
			return
		}

		try {
			const file = e.target.files[0];
			
			if (file) {
				const fileReader = new FileReader();
				
				let PDFText = ''
				fileReader.onload = async function(event) {
					try {
						const arrayBuffer = event.target.result;
						const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
						const numPages = pdf.numPages;
						
						for (let pageNum = 1; pageNum <= numPages; pageNum++) {
							const page = await pdf.getPage(pageNum);
							const textContent = await page.getTextContent();
							const textItems = textContent.items;
							
						let pageText = '';
					textItems.forEach(item => {
					  pageText += item.str + ' ';
					  PDFText += item.str + ' '
					});
					console.log('Page', pageNum, pageText);
					setPdfContent(PDFText)
				  }
				//   return PDFText
				} catch (error) {
				  console.error('Error loading PDF:', error);
				}
			  };
			  
			  fileReader.readAsArrayBuffer(file); // Read the selected file as an ArrayBuffer
			} else {
			  console.error('No file selected.');
			}
		  } catch (error) {
			console.error('Error loading PDF:', error);
		  }
	}

	async function insertValues(pdfInfo) {
		let count = 1
		for (const element of pdfInfo) {
			try {
					appendIspolProdsFields({
							...emptyIspolProds,
							ispolProdNumDate: element,
						});
					count++
			} catch (error) {
			  console.error('Error fetching bank info:', error);
			}
		  }
		handleChange()
	}
	
	async function processPdfText() {
		const str = pdfContent
		
		const regex = /\d+\/\d+\/\d+-ИП\s+от\s\d{1,2}.\d{1,2}.\d{2,4}/g
		const matches = Array.from(str.matchAll(regex))
		const result = matches.map(match => match[0])
		console.log('matches: ', matches)
		console.log('result: ', result)

		return result
	}
	// PDF END

	return (
		<>
			<div className="component">
				<form>
					{/* <form onSubmit={handleSubmit(onSubmit)}> */}
					<hr className="mb-4" />
					<h3>Данные заявления</h3>
					<fieldset>
					<legend className="bg-light">ФИО в винительном падеже (автоматически. измените если неправильно)</legend>
					<div className="row">
						{/* Фамилии */}
						<div className="col-md-4 mb-3">
							<label htmlFor="lastNameGenitive">Фамилию</label>
							<input type="text" className="form-control" id="docProps-lastNameGenitive" placeholder="Иванов" {...register("lastNameAccusative", { required: true, })}/>
							{errors.docProps?.lastNameGenitive && (<span className="required-field">Обязательное поле</span>)}
						</div>
						{/* Имени */}
						<div className="col-md-3 mb-3">
							<label htmlFor="firstNameGenitive">Имя</label>
							<input type="text" className="form-control" id="docProps-firstNameGenitive" placeholder="Иван" {...register("firstNameAccusative", {required: true,})}/>
							{errors.docProps?.firstNameGenitive && (<span className="required-field">Обязательное поле</span>)}
						</div>
						{/* Отчества */}
						<div className="col-md-4 mb-3">
							<label htmlFor="middleNameGenitive">Отчество</label>
							<input type="text" className="form-control" id="docProps-middleNameGenitive" placeholder="Иванович" {...register("middleNameAccusative")}/>
						</div>
					</div>

					<div className="row">
						<legend className="bg-light">Использовать адрес</legend>
						<div className="col-md-2 mb-3">
							{/* использовать адрес */}
							{/* <label htmlFor="addressToUse">Тип</label> */}
							<Controller name="addressToUse" control={control} render={({ field }) => (
									<select id="addressToUse" className="form-select"
									{...register("addressToUse", {onChange: () => handleChange(), required: true,})}
									>
										{person.address.map((element, index) => {
											return (
											<>
												<option key={index} value={index}>{element.description || 'основной'}</option>
											</>
											)
										})}
									</select>
								)}
							/>
						</div>
						{watch('addressToUse') && `${person.address[watch('addressToUse')].index && person.address[watch('addressToUse')].index} 
						${person.address[watch('addressToUse')].subject ? person.address[watch('addressToUse')].subject : ''} 
						${person.address[watch('addressToUse')].district ? person.address[watch('addressToUse')].district : ''} 
						${person.address[watch('addressToUse')].city ? person.address[watch('addressToUse')].city : ''} 
						${person.address[watch('addressToUse')].settlement ? person.address[watch('addressToUse')].settlement : ''} 
						${person.address[watch('addressToUse')].street ? person.address[watch('addressToUse')].street : ''} 
						${person.address[watch('addressToUse')].building ? person.address[watch('addressToUse')].building : ''} 
						${person.address[watch('addressToUse')].corp ? person.address[watch('addressToUse')].corp : ''} 
						${person.address[watch('addressToUse')].appartment ? person.address[watch('addressToUse')].appartment : ''}`}
					</div>

						<legend className="bg-light">Вид оплаты</legend>
						<div className="row">
							{/* Варианты заявлений */}
							<div className="col-md-4 mb-3">
								<div className="form-check">
									<label htmlFor="blockVariant">Вариант 1 (больше 500тыс., больше 3 мес.)</label>
									<input type="radio" className="form-check-input" id="blockVariant" value="ВАРИАНТ01" {...register("blockVariant", {onChange: () => handleChange(), required: true,})}/>
								</div>
							</div>
							<div className="col-md-4 mb-3">
								<div className="form-check">
									<label htmlFor="blockVariant">Вариант 2 (все остальные)</label>
									<input type="radio" className="form-check-input" id="blockVariant" value="ВАРИАНТ02" {...register("blockVariant", {onChange: () => handleChange(), required: true,})}/>
								</div>
							</div>

								<div className="row">
							{/* Справка ФНС Дата [кнопка] */}
							<div className="col-md-2 mb-3">
								<label htmlFor="spravkaFnsDate">Справка ФНС от</label>
								<input type="date" className="form-control" id="spravkaFnsDate" placeholder="1960-02-29"
									{...register("spravkaFnsDate", { onChange: () => handleChange(), required: true, })}
								/>
								{errors.datePayment && (
									<span className="required-field">Обязательное поле</span>
								)}
							</div>
							
							{/* Брак */}
							<div className='row' style={{display: "inline-flex",}} >
								<div className="col-md-3 mb-3">
										{/* статус брака */}
										<label htmlFor="marriageStatus">Брак</label>
										<Controller name="marriageStatus" control={control} render={({ field: { onChange, value, },}) => (
												<select id="marriageStatus" className="form-select"
													{...register("marriageStatus", {onChange: () => handleChange(), required: true,})}
												>
													<option value="notMarried">не состою в браке</option>
													<option value="married">состою</option>
													<option value="divorced">не состою, расторгнут</option>
													<option value="spouseDied">{person.gender === 'жен' ? 'не состою, супруг умер' : 'не состою, супруга умерла'} </option>
												</select>
											)}
										/>
									</div>
									{console.log('marriageStatus.watch', watch('marriageStatus'))}
									{watch("marriageStatus") !== "notMarried" &&
									<div className="col-md-2 mb-3">
										{/* дата акта */}
										<label htmlFor="marriageStatus">Дата акта</label>
										<input type="date" className="form-control" id="marriageActDate" placeholder=""
											{...register( "marriageActDate", { onChange: () => handleChange(), required: true,})}
										/>
									</div>}
									{watch("marriageStatus") === "married" &&
									<div className="col-md-5 mb-3">
										{/* супруг(а) */}
										<label htmlFor="marriageStatus">{person.gender === 'жен' ? 'Супруг' : 'Супруга'} (в родительном падеже)</label>
										<input type="text" className="form-control" id="spouse" placeholder={person.gender === 'жен' ? 'Абдулджалиловым Оглы Оглыевичем' : 'Фахрутдиновой Айгуль Кызыевной'}
											{...register( "spouse", { onChange: () => handleChange(), required: true,})}
										/>
									</div>}
								</div>
							</div>
							
							{/* Иждивенцы */}
							<label htmlFor="depsFields">{depsFields.length === 0 ? 'Иждивенцев нет' : 'Иждивенцев '+depsFields.length }</label>
							{depsFields.map((field, index) => {
								return (
									<div className="row" key={field.id}>
										<div className="col-sm-8 mb-3"><input type="text" id="deps-fio" className="form-control" {...register(`deps.${index}.fio`, { onChange: () => handleChange() })} placeholder="Дитятко Сынка Папкович" /></div>
										<div className="col-sm-3 mb-3"><input type="date" id="deps-birthDate" className="form-control" {...register(`deps.${index}.birthDate`, { onChange: () => handleChange() })} placeholder="" /></div>
										<div className="col-sm-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeDepsFields" onClick={() => {handleChange(); removeDepsFields(index)}}>-</button></div>
									</div>)})}
							<div className="container-fluid mb-3">
								<div className="col-sm-4 mb-1">
									<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendDepsFields(emptyDeps)}>+ Добавить иждивенца</button>
								</div>
							</div>

							{/* Задолженность */}
							<div className='row' style={{display: "inline-flex",}} >
								{/* дата состояния */}
								<div className="col-md-2 mb-3">
									<label htmlFor="debtDate">Дата задолженности</label>
									<input type="date" className="form-control" id="debtDate" placeholder=""
										{...register( "debtDate", { onChange: () => handleChange(), required: true,})}
									/>
								</div>
								{/* общая сумма задолженности */}
								<div className="col-md-2 mb-3">
									<label htmlFor="totalDebtSum">Общая сумма</label>
									<input type="number" className="form-control" id="totalDebtSum" 
										{...register("totalDebtSum", { 	onChange: () => handleChange(), })} 
									/>
									{errors.totalSum && ( <span className="required-field">Обязательное поле</span> )}
								</div>
									{/* сумма обязательных платежей */}
									<div className="col-md-2 mb-3">
									<label htmlFor="payDebtSum">Сумма обязательных платежей</label>
									<input type="number" className="form-control" id="payDebtSum" 
										{...register("payDebtSum", { 	onChange: () => handleChange(), })} 
									/>
									{errors.totalSum && ( <span className="required-field">Обязательное поле</span> )}
								</div>
								<div className="col-sm-3 mb-3">
									<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => getDebtsFromSpisokKreditorov()}>Вставить из списка кредиторов</button>
								</div>
							</div>

							{/* Исполнительные производства */}
							<label htmlFor="ispolProdsFields">{ ispolProdsFields.length === 0 ? 'Исполнительных производств нет' : 'Исполнительных производств ' + ispolProdsFields.length }</label>
							{ispolProdsFields.map((field, index) => {
								return (
									<div className="row" key={field.id}>
										<div className="col-sm-6 mb-3"><input type="text" id="ispolProdNumDate" className="form-control" {...register(`ispolProds.${index}.ispolProdNumDate`, { onChange: () => handleChange() })} placeholder="№ 123456/99/12345-ИП от 31.12.1999" /></div>
										{/* <div className="col-sm-2 mb-3"><input type="date" id="ispolProdIsOver" className="form-control" {...register(`ispolProds.${index}.ispolProdIsOver`, { onChange: () => handleChange() })} placeholder="" /></div> */}
										<div className="form-check col-sm-2 mb-3">
											<label className="form-check-label"htmlFor={`caseReminderActive-${index}`} >Окончено</label>
											<input className="form-check-input" type="checkbox" id={`caseReminderActive-${index}`} {...register(`ispolProds.${index}.ispolProdIsOver`, { onChange: () => handleChange() })}/>
										</div>
										<div className="col-sm-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeIspolProdsFields" onClick={() => {handleChange(); removeIspolProdsFields(index)}}>-</button></div>
									</div>)})}
							<div className="container-fluid mb-3">
								<div className="col-sm-4 mb-1">
									<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendIspolProdsFields(emptyIspolProds)}>+ Добавить исполпроизводство</button>
								</div>
							</div>
							<div className="row">
								<div className="col-sm-3 mb-3">
									<input className="form-control-sm" type="file" id="formFile" onChange={getPdfText} title='Выберите файл для импорта' />
								</div>
								<div className="col-sm-3 mb-3">
									{pdfContent !== '' ? 'файл загружен' : ''}
									{pdfContent !== '' ? <button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => importPdf()}>Вставить данные</button> : ''}
								</div>
							</div>

							{/* Сделки с имуществом */}
							<label htmlFor="dealsFields">{ dealsFields.length === 0 ? 'Сделок нет' : 'Сделок ' + dealsFields.length }</label>
							{dealsFields.map((field, index) => {
								return (
									<div className="row" key={field.id}>
										<div className="col-sm-2 mb-3">
										{/* статус брака */}
										<label htmlFor="dealType">Тип сделки</label>
										<Controller name={`deals.${index}.dealType`} control={control} render={({ field }) => (
											<select id="dealType" className="form-select"
												{...field }
											>
												<option value="pokupka">покупка</option>
												<option value="prodazha">продажа</option>
												<option value="mena">мена</option>
												<option value="darenie">дарение</option>
											</select>
											)}
										/>
									</div>
										<div className="col-sm-4 mb-3"><label htmlFor="dealSubject">Объект сделки</label><input type="text" id="dealSubject" className="form-control" {...register(`deals.${index}.dealSubject`, { onChange: (e) => { handleChange(); genderDetect(e, index) }})} placeholder="автомобиль Москвич-2141" /></div>
										<div className="col-sm-1 mb-3">
										<label htmlFor="dealSubjectGender" title='необходимо для корректности формулировки в тексте. Например: "был продан / была продана"'>род объекта</label>
										<Controller name={`deals.${index}.dealSubjectGender`} control={control} render={({ field }) => (
											<select id="dealSubjectGender" className="form-select"
												{...field } title='необходимо для корректности формулировки в тексте. Например: "был продан / была продана"'
											>
												<option value="male">муж</option>
												<option value="female">жен</option>
												<option value="middle">сред</option>
											</select>
											)}
										/>
										</div>
										<div className="col-sm-2 mb-3"><label htmlFor="dealDate">Дата сделки</label><input type="date" id="dealDate" className="form-control" {...register(`deals.${index}.dealDate`, { onChange: () => handleChange() })} placeholder="" /></div>
										<div className="col-sm-2 mb-3"><label htmlFor="dealPrice">Цена сделки</label><input type="number" id="dealPrice" className="form-control" {...register(`deals.${index}.dealPrice`, { onChange: () => handleChange() })} placeholder="100000" /></div>
										<div className="col-sm-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeDealsFields" onClick={() => {handleChange(); removeDealsFields(index)}}>-</button></div>
									</div>)})}
								{(dealsFields.length !== 0) && <div className="col-sm-8 mb-3"><label htmlFor="dealsTarget">Использование средств</label><input type="text" id="dealsTarget" className="form-control" {...register(`dealsTarget`, { onChange: () => handleChange() })} placeholder="на погашение кредита АО &laquo;Тинькофф Банк&raquo;" /></div>}
							<div className="container-fluid mb-3">
								<div className="col-sm-4 mb-1">
									<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendDealsFields(emptyDeals)}>+ Добавить сделку</button>
								</div>
							</div>

							{/* Трудоустройство */}
							<div className='row' style={{display: "inline-flex",}} >
								<div className="col-md-3 mb-3">
										{/* статус брака */}
										<label htmlFor="job">Трудоустройство</label>
										<Controller name="job" control={control} render={({ field }) => (
											<select id="job" className="form-select"
												{ ...field }
											>
												<option value="working">{person.gender === 'жен' ? 'трудоустроена' : 'трудоустроен'}</option>
												<option value="selfBusy">{person.gender === 'жен' ? 'самозанятая' : 'самозанятый'}</option>
												<option value="pensionerOld">{person.gender === 'жен' ? 'пенсионер по старости' : 'пенсионер по старости'}</option>
												<option value="pensionerInvalid">{person.gender === 'жен' ? 'пенсионер по инвалидности' : 'пенсионер по инвалидности'}</option>
												<option value="unemployed">{person.gender === 'жен' ? 'безработная' : 'безработный'}</option>
												<option value="notWorking">{person.gender === 'жен' ? 'не трудоустроена' : 'не трудоустроен'}</option>
											</select>
											)}
										/>
									</div>
									{/* место работы*/}
									{watch("job") === "working" &&
									<div className="col-md-3 mb-3">
										<label htmlFor="jobPlace">Место работы</label>
										<input type="text" className="form-control" id="jobPlace" placeholder='АО "Воркутауголь"'
											{...register("jobPlace", { onChange: () => handleChange(), required: true,})}
										/>
										{errors.jobPlace && (<span className="required-field">Обязательное поле</span>)}
									</div>}
									<div className="col-sm-2 mb-3"><label htmlFor="jobIncome">Доход</label><input type="number" id="jobIncome" className="form-control" {...register('jobIncome', { onChange: () => handleChange() })} placeholder="0" /></div>
									<div className="col-md-2 mb-3">
										{/* Процедура */}
										<label htmlFor="procedure">Процедура</label>
										<Controller name="procedure" control={control} render={({ field }) => (
											<select id="procedure" className="form-select" { ...field }>
												<option value="realization">реализации</option>
												<option value="restructurization">реструктуризации</option>
											</select>
											)}
										/>
									</div>
									<div className="row" style={{display: "inline-flex",}} >
										<div className="col-md-8 mb-3">
											<label htmlFor="attachments">Приложение</label>
											<textarea className="form-control" id="attachments" 
												placeholder="Импортируйте файл со списком файлов или введите список вручную " 
												style={{height: '150px' }} {...register("attachments", { onChange: () => handleChange(), required: true })}/>
											{errors.attachments && <span className="required-field">Обязательное поле</span>}
										</div>
										<div className="col-sm-3 mb-3">
											<label htmlFor="attachments">Выбрать файлы для приложения</label>
											<input  type="file"  ref={fileInputRef}  onChange={getAndSetDirsFilelist} directory multiple webkitdirectory />
										</div>
										{/* <div className="col-sm-3 mb-3">
											<label htmlFor="attachments">Импорт .txt файла</label>
											<input className="form-control-sm" type="file" id="formFile" onChange={getTxtContent} title='Выберите файл для импорта' />
										</div> */}
									</div>
									{/* Дата создания*/}
									<div className="col-md-2 mb-3">
										<label htmlFor="agreement-date">Дата создания</label>
										<input type="date" className="form-control" id="date" placeholder="1960-02-29" {...register("date", {/* value: docProps.date,*/ onChange: () => handleChange(), required: true, })}/>
										{errors.date && (<span className="required-field">Обязательное поле</span>)}
									</div>
								</div>
						</div>
					</fieldset>
				</form>
			</div>

			<Tokens tokens={tokens} />

			<TinyEditorAndButtons
				tokens={tokens}
				docProps={docProps}
				templateURLName={templateURLName}
				docName={doc.name || `${person.lastName} ${person.firstName[0]}.${person.middleName[0]}. - Заявление о признании банкротом`}
				logValues={logValues}
				blockVariant={docProps.blockVariant}
			/>
		</>
	);
}

export { TemplateBankrotZayavlenie };
