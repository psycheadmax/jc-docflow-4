import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
import dayjs from "dayjs";
import {
	createTokens,
	deleteRub,
	getCurrentYearNumbers,
	getUnusedNumbers,
	paymentsSchedule,
	excelDateToJSDate,
	convertHTMLentities
} from "../functions";
import { Tokens } from "./Tokens";
import { TinyEditorAndButtons } from "./TinyEditorAndButtons";
import { addTemplateActionCreator } from '../store/templateReducer';
import { addressPhoneUpdateActionCreator } from '../store/personReducer';
import { PageNumberSeparator } from 'docx';
import { table } from 'console';
import * as XLSX from 'xlsx';

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];


function TemplateBankrotOpis() {
	// Шаблон опись имущества гражданина
	// (утв. приказом Минэкономразвития от 05.08.2015 № 530)
	const templateURLName = 'templatebankrotopis'
	const rubles = require("rubles").rubles;
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const person = useSelector((state) => state.personReducer.person);
	const caseName = useSelector((state) => state.caseReducer);
	const doc = useSelector((state) => state.docReducer);

	function handleTemplateStateChange(data) {
		setTemplateState((prevState) => ({ ...prevState, ...data }));
	}

	useEffect(() => {
		async function getTemplate() {
			const query = {title: 'Шаблон опись имущества гражданина'}
				try {
					const response = await axios.post(
						`${SERVER_IP}:${SERVER_PORT}/api/doctemplates/search`, query
					);
					dispatch(addTemplateActionCreator(response.data))
					console.log('got template and dispatched: ', response.data)
				} catch (error) {
					console.error("Error fetching document template:", error);
				}
		}
		getTemplate()
	}, []);

	const initialDocProps = {
		prevnames: "",
    	p1nedvizh: [],
    	p2dvizh: [],
    	p3banki: [],
    	p4akcii: [],
    	p5inye: [],
    	p6nalich: [],
		date: dayjs().format('YYYY-MM-DD')
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
	
	/* structure
	1. Недвижимое имущество
		1.1	Земельные участки
		1.2	Жилые дома, дачи
		1.3	Квартиры
		1.4	Гаражи
		1.5	Иное недвижимое имущество
	2. Движимое имущество
		2.1	Автомобили легковые
		2.2	Автомобили грузовые
		2.3	Мототранспортные средства
		2.4	Сельскохозяйственная техника
		2.5	Водный транспорт
		2.6	Воздушный транспорт
		2.7	Иные транспортные средства
	3. Сведения о счетах в банках и иных кредитных организациях
	4. Акции и иное участие в коммерческих организациях
	5. Иные ценные бумаги
	6. Сведения о наличных денежных средствах и ином ценном имуществе
		6.1	Наличные денежные средства
		6.2	Драгоценности, в том числе ювелирные украшения, и другие предметы роскоши
		6.3	Предметы искусства
		6.4	Имущество, необходимое для профессиональных занятий
		6.5	Иное ценное имущество 
	*/

	const { fields: p1Fields, append: appendP1Fields, remove: removeP1Fields } = useFieldArray({ control, name: "p1nedvizh"})
	const { fields: p2Fields, append: appendP2Fields, remove: removeP2Fields } = useFieldArray({ control, name: "p2dvizh"})
	const { fields: p3Fields, append: appendP3Fields, remove: removeP3Fields } = useFieldArray({ control, name: "p3banki"})
	const { fields: p4Fields, append: appendP4Fields, remove: removeP4Fields } = useFieldArray({ control, name: "p4akcii"})
	const { fields: p5Fields, append: appendP5Fields, remove: removeP5Fields } = useFieldArray({ control, name: "p5inye"})
	const { fields: p6Fields, append: appendP6Fields, remove: removeP6Fields } = useFieldArray({ control, name: "p6nalich"})

	const headers = {
		p1nedvizh: [
			{ num: "1.1", numName: "Земельные участки" },
			{ num: "1.2", numName: "Жилые дома, дачи" },
			{ num: "1.3", numName: "Квартиры" },
			{ num: "1.4", numName: "Гаражи" },
			{ num: "1.5", numName: "Иное недвижимое имущество" },
		],
		p2dvizh: [
			{ num: "2.1", numName: "Автомобили легковые" },
			{ num: "2.2", numName: "Автомобили грузовые" },
			{ num: "2.3", numName: "Мототранспортные средства" },
			{ num: "2.4", numName: "Сельскохозяйственная техника" },
			{ num: "2.5", numName: "Водный транспорт" },
			{ num: "2.6", numName: "Воздушный транспорт" },
			{ num: "2.7", numName: "Иные транспортные средства" },
		],
		p3banki: [{}],
		p4akcii: [{}],
		p5inye: [{}],
		p6nalich: [
			{num: "6.1", numName: "Наличные денежные средства" },
			{num: "6.2", numName: "Драгоценности, в том числе ювелирные украшения, и другие предметы роскоши" },
			{num: "6.3", numName: "Предметы искусства" },
			{num: "6.4", numName: "Имущество, необходимое для профессиональных занятий" },
			{num: "6.5", numName: "Иное ценное имущество" },
		]
	}
	const emptyP1 = {
		num: "",
		numName: "",
		vidNaim: "",
		vidSob: "",
		address: "",
		square: "",
		osnAndPrice: "",
		zalogInfo: "",
	}
	const emptyP2 = {
		num: "",
		numName: "",
		vidMarka: "",
		idNumber: "",
		vidSob: "",
		address: "",
		stoim: "",
		zalogInfo: "",
	}
	const emptyP3 = {
		num: "",
		synName: "",
		bik: "",
		shortName: "",
		index: "",
		city: "",
		addressUlDom: "",
		vidAndVal: "",
		dateOtkr: "",
		ostatok: "",
	}
	const emptyP4 = {
		num: "",
		nameAndOrg: "",
		address: "",
		ustKapital: "",
		dol: "",
		osn: "",
	}
	const emptyP5 = {
		num: "",
		vid: "",
		litso: "",
		nomVel: "",
		kolvo: "",
		stoim: ""
	}
	const emptyP6 = {
		num: "",
		numName: "",
		vidNaim: "",
		stoimAndVal: "",
		address: "",
		zalogInfo: "",
	}
	
	const [tokens, setTokens] = useState(
		// createTokens(person)
		[...createTokens(person)].concat([...addDocPropsTokens(getValues())])
	);

	function logValues() {
		console.log(getValues());
	}
		
	function addDocPropsTokens(values) {
		// AGREEMENT DOCPROPS-SPECIFIED TOKENS
		
		const tdTableHeader = "border: solid #000001 1.0pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;"
		const tdRowHeader = "border: solid #000001 1.0pt; border-bottom: none; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;"
		const tdRowNum = 'border-top: none; border-left: solid windowtext 1.0pt; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;'
		const tdRowCountNone = 'border: none; border-right: none; mso-border-left-alt: solid #000001 .5pt; mso-border-right-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;'
		const tdRowCountBottom = 'border-top: none; border-left: solid windowtext 1.0pt; border-bottom: solid windowtext 1.0pt; border-right: none; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;'
		const tdRowCountBottomWOLeft = 'border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: none; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;'
		const tdRowBorderNone = 'border: none; border-right: solid #000001 1.0pt; border-left: solid #000001 1.0pt; mso-border-left-alt: solid #000001 .5pt; mso-border-right-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;'
		const tdRowBorderNoneWOLeft = 'border: none; border-right: solid #000001 1.0pt; border-left: none; mso-border-left-alt: solid #000001 .5pt; mso-border-right-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;'
		const tdRowBorderBottom = 'border-top: none; border-left: solid windowtext 1.0pt; border-bottom: solid windowtext 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;'

		
		function table1() {
			const tableStart = `
			<div align="center"><!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <span lang="RU" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;"><!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> <!-- [if !supportMisalignedRows]--> 
			<table class="MsoNormalTable" style="border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" cellspacing="0" cellpadding="0">
			<tbody>
			<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; height: 19.85pt;">
			<td style="${tdTableHeader}" colspan="8" width="679">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong><span lang="EN-US" style="mso-ansi-language: EN-US;">I<span lang="RU">. Недвижимое имущество</strong></p>
			</td>
			<td style="height: 19.85pt; border: none;" width="0" height="20">&nbsp;</td>
			<!--[endif]--></tr>
			<!-- 1 . Недвижимое имущество ТАБЛИЦА ЗАГОЛОВОК-->
			<tr style="mso-yfti-irow: 1; height: 13.8pt;">
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="33">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">№<br>п/п</p>
			</td>
			<td style="${tdTableHeader}" colspan="2" rowspan="2" valign="top" width="157">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Вид и наименование имущества</p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="66">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Вид собственности<a style="mso-footnote-id: ftn2;" title="" href="#_ftn2" name="_ftnref2"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[2]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="156">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Местонахождение (адрес)</p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="65">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Площадь<br>(кв. м)</p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="93">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Основание приобретения<a style="mso-footnote-id: ftn3;" title="" href="#_ftn3" name="_ftnref3"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[3]<!--[endif]--></a><span lang="RU"> и<span lang="RU" style="mso-ansi-language: EN-US;"> <span lang="RU">стоимость<a style="mso-footnote-id: ftn4;" title="" href="#_ftn4" name="_ftnref4"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[4]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="110">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Сведения о<span lang="EN-US" style="mso-ansi-language: EN-US;">&nbsp;<span lang="RU">залоге и залогодержателе<a style="mso-footnote-id: ftn5;" title="" href="#_ftn5" name="_ftnref5"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[5]<!--[endif]--></a></p>
			</td>
			<td style="height: 13.8pt; border: none;" width="0" height="14">&nbsp;</td>
			<!--[endif]--></tr>
			<tr style="mso-yfti-irow: 2; height: 13.8pt;">
			<td style="height: 13.8pt; border: none;" width="0" height="14">&nbsp;</td>
			<!--[endif]--></tr>`
			const tableEnd = `</tbody>
			</table>
			</div>`
			let tableMiddle = ``
			headers.p1nedvizh.forEach((header) => {
				const found = values.p1nedvizh.filter(item => item.num === header.num)
				const iterations = found.length > 2 ? found.length : 2
				const rowHeader = `<tr style="mso-yfti-irow: 9; height: 14.2pt;">
				<td style="${tdRowNum}" rowspan="${iterations + 1}" valign="top" width="33">
				<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">${header.num}</p>
				</td>
				<td style="${tdRowHeader}" colspan="2" valign="top" width="157">
				<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span lang="RU" style="font-size: 11.0pt;">${header.numName}</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="66">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="156">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="65">
				<p class="MsoNormal" style="text-align: right;" align="right"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="93">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="110">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="height: 14.2pt; border: none;" width="0" height="14">&nbsp;</td>
				<!--[endif]--></tr>`
				tableMiddle += rowHeader

				for (let count = 0; count < iterations; count++) {
					const row = `<tr>
					<td style="${count === iterations-1 ? tdRowCountBottom : tdRowCountNone}" width="22">
							<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span lang="RU" style="font-size: 11.0pt;">${count + 1 + ")"}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowCountBottomWOLeft : tdRowBorderNoneWOLeft}" width="134">
							<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].vidNaim : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" width="66">
							<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].vidSob : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" width="156">
							<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].address : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" width="65">
							<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].square : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" width="93">
							<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].osnAndPrice : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" width="110">
							<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].zalogInfo : '-'}</p>
					</td>
					<td style="border: none;" width="0" height="14">&nbsp;</td>
			<!--[endif]--></tr>`;
					tableMiddle += row
				}
			})
			return tableStart + tableMiddle + tableEnd
		}
		function table2() {
			const tableStart = `
			<table class="MsoNormalTable" style="margin-left: .95pt; border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" cellspacing="0" cellpadding="0">
			<tbody>
			<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; page-break-inside: avoid; height: 19.85pt;">
			<td style="${tdTableHeader}" colspan="8" width="679">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong><span lang="EN-US" style="mso-ansi-language: EN-US;">II<span lang="RU">. Движимое имущество</strong></p>
			</td>
			<td style="height: 19.85pt; border: none;" width="0" height="20">&nbsp;</td>
			<!--[endif]--></tr>
			<tr style="mso-yfti-irow: 1; page-break-inside: avoid; height: 13.8pt;">
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="33">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">№<br>п/п</p>
			</td>
			<td style="${tdTableHeader}" colspan="2" rowspan="2" valign="top" width="157">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Вид, марка, модель транспортного средства, год изготовления</p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="66">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Идентификационный номер<a style="mso-footnote-id: ftn7;" title="" href="#_ftn7" name="_ftnref7"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[7]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="80">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Вид собственности<a style="mso-footnote-id: ftn8;" title="" href="#_ftn8" name="_ftnref8"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[8]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="141">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Место нахождения/место хранения (адрес)</p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="93">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Стоимость<a style="mso-footnote-id: ftn9;" title="" href="#_ftn9" name="_ftnref9"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[9]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="110">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Сведения о&nbsp;залоге и залогодержателе<a style="mso-footnote-id: ftn10;" title="" href="#_ftn10" name="_ftnref10"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[10]<!--[endif]--></a></p>
			</td>
			<td style="height: 13.8pt; border: none;" width="0" height="14">&nbsp;</td>
			<!--[endif]--></tr>
			<tr style="mso-yfti-irow: 2; page-break-inside: avoid; height: 13.8pt;">
			<td style="height: 13.8pt; border: none;" width="0" height="14">&nbsp;</td>
			<!--[endif]--></tr>`
			const tableEnd = `</tbody>
			</table>`
			let tableMiddle = ``
			headers.p2dvizh.forEach((header) => {
				const found = values.p1nedvizh.filter(item => item.num === header.num)
				const iterations = found.length > 2 ? found.length : 2
				const rowHeader = `<tr style="mso-yfti-irow: 3; page-break-inside: avoid; height: 14.2pt;">
				<td style="${tdRowNum}" rowspan="${iterations + 1}" valign="top" width="33">
				<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">${header.num}</p>
				</td>
				<td style="${tdRowHeader}" colspan="2" valign="top" width="157">
				<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span lang="RU" style="font-size: 11.0pt;">${header.numName}</p>
				</td>
				<td style="${tdRowHeader}" width="66">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" width="80">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" width="141">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" width="93">
				<p class="MsoNormal" style="text-align: right;" align="right"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="${tdRowHeader}" width="110">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</p>
				</td>
				<td style="height: 14.2pt; border: none;" width="0" height="14">&nbsp;</td>
				<!--[endif]--></tr>`
				tableMiddle += rowHeader
				for (let count = 0; count < iterations; count++) {
					const row = `<tr style="mso-yfti-irow: 4; page-break-inside: avoid; height: 14.2pt;">
					<td style="${count === iterations-1 ? tdRowCountBottom : tdRowCountNone}" valign="center" width="22">
					<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span lang="RU" style="font-size: 11.0pt;">${count + 1 + ")"}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowCountBottomWOLeft : tdRowBorderNoneWOLeft}" valign="center" width="134">
					<p class="MsoNormal" style="text-align: center;" align="center"><strong><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].vidMarka : '-'}</strong></p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="66">
					<p class="MsoNormal" style="text-align: center;" align="center"><strong><span lang="EN-US" style="font-size: 11.0pt;">${found[count] ? found[count].idNumber : '-'}</strong></p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="80">
					<p class="MsoNormal" style="text-align: center;" align="center"><strong><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].vidSob : '-'}</strong></p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="141">
					<p class="MsoNormal" style="text-align: center;" align="center"><strong><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].address : '-'}</strong></p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="93">
					<p class="MsoNormal" style="text-align: center;" align="center"><strong><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].stoim : '-'}</strong></p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="110">
					<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].zalogInfo : '-'}</p>
					</td>
					<td style="height: 14.2pt; border: none;" width="0" height="14">&nbsp;</td>
					<!--[endif]--></tr>`;
					tableMiddle += row
				}
			})
			return tableStart + tableMiddle + tableEnd
		}
		function table3() {
			const tableStart = `
			<div align="center">
			<table class="MsoNormalTable" style="border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" width="679" cellspacing="0" cellpadding="0">
			<tbody>
			<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; height: 19.85pt;">
			<td style="${tdTableHeader}" colspan="5" width="679">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong><span lang="EN-US" style="mso-ansi-language: EN-US;">III<span lang="RU">. Сведения о счетах в банках и иных кредитных организациях</strong></p>
			</td>
			</tr>
			<tr style="mso-yfti-irow: 1;">
			<td style="${tdTableHeader}" valign="top" width="33">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">№<br>п/п</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="316">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Наименование и адрес банка или иной кредитной организации</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="107">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Вид и валюта счета<a style="mso-footnote-id: ftn11;" title="" href="#_ftn11" name="_ftnref11"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[11]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="97">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Дата открытия счета</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="127">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Остаток на&nbsp;счете<a style="mso-footnote-id: ftn12;" title="" href="#_ftn12" name="_ftnref12"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[12]<!--[endif]--></a><span lang="RU"><br>(руб.)</p>
			</td>
			</tr>`
			const tableEnd = `</tbody>
			</table>
			</div>`
			let tableMiddle = ``
			const iterations = values.p3banki.length > 3 ? values.p3banki.length : 3
			for (let count = 0; count < iterations; count++) {
				const row = `<tr style="mso-yfti-irow: 2; height: 19.85pt;">
				<td style="${tdRowBorderBottom}" valign="center" width="33">
				<p class="MsoNormal" style="text-align: center; margin: 0cm -3.55pt .0001pt -.45pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">${"3." + (count + 1)}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="316">
				<p class="MsoNormal" style="margin-right: -7.55pt;"><span lang="RU" style="font-size: 11.0pt; mso-fareast-font-family: 'Times New Roman'; color: black; mso-font-kerning: 0pt;">${values.p3banki[count] ? values.p3banki[count].shortName : ''}</p>
				<p class="MsoNormal" style="margin-right: -7.55pt;"><span lang="RU" style="font-size: 11.0pt; mso-fareast-font-family: 'Times New Roman'; color: black; mso-font-kerning: 0pt;">${values.p3banki[count] ? values.p3banki[count].index+', '+values.p3banki[count].city+', '+values.p3banki[count].addressUlDom : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="107">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt; mso-fareast-font-family: 'Times New Roman'; color: black; mso-font-kerning: 0pt;">${values.p3banki[count] ? values.p3banki[count].vidAndVal : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="97">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt; mso-fareast-font-family: 'Times New Roman'; color: black; mso-font-kerning: 0pt;">${values.p3banki[count] ? values.p3banki[count].dateOtkr : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="127">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p3banki[count] ? values.p3banki[count].ostatok : '-'}</p>
				</td>
				</tr>`;
				tableMiddle += row
			}
			return tableStart + tableMiddle + tableEnd
		}
		function table4() {
			const tableStart = `
			<table class="MsoNormalTable" style="margin-left: .95pt; border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" cellspacing="0" cellpadding="0">
			<tbody>
			<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; height: 19.85pt;">
			<td style="${tdTableHeader}" colspan="6" width="679">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong><span lang="EN-US" style="mso-ansi-language: EN-US;">IV<span lang="RU">. Акции и иное участие в коммерческих организациях</strong></p>
			</td>
			</tr>
			<tr style="mso-yfti-irow: 1;">
			<td style="${tdTableHeader}" valign="top" width="33">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">№<br>п/п</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="199">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Наименование и организационно-правовая форма организации<a style="mso-footnote-id: ftn13;" title="" href="#_ftn13" name="_ftnref13"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[13]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="199">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Местонахождение организации (адрес)</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="109">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Уставный, складочный капитал, </p>
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">паевый фонд<a style="mso-footnote-id: ftn14;" title="" href="#_ftn14" name="_ftnref14"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[14]<!--[endif]--></a><span lang="RU"> (руб.)</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="55">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Доля участия<a style="mso-footnote-id: ftn15;" title="" href="#_ftn15" name="_ftnref15"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[15]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="85">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Основание участия<a style="mso-footnote-id: ftn16;" title="" href="#_ftn16" name="_ftnref16"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[16]<!--[endif]--></a></p>
			</td>
			</tr>`
			const tableEnd = `</tbody>
			</table>`
			let tableMiddle = ``
			const iterations = values.p4akcii.length > 3 ? values.p4akcii.length : 3
			for (let count = 0; count < iterations; count++) {
				const row = `<tr style="mso-yfti-irow: 2; height: 19.85pt;">
				<td style="${tdRowBorderBottom}" valign="bottom" width="33">
				<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">${"4." + (count + 1)}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="199">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p4akcii[count] ? values.p4akcii[count].nameAndOrg : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="199">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p4akcii[count] ? values.p4akcii[count].address : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="109">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p4akcii[count] ? values.p4akcii[count].ustKapital : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="55">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p4akcii[count] ? values.p4akcii[count].dol : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="85">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p4akcii[count] ? values.p4akcii[count].osn : '-'}</p>
				</td>
				</tr>`;
				tableMiddle += row
			}
			return tableStart + tableMiddle + tableEnd
		}
		function table5() {
			const tableStart = `
			<table class="MsoNormalTable" style="margin-left: .95pt; border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" cellspacing="0" cellpadding="0">
			<tbody>
			<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; height: 19.85pt;">
			<td style="${tdTableHeader}" colspan="6" width="679">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong><span lang="EN-US" style="mso-ansi-language: EN-US;">V<span lang="RU">. Иные ценные бумаги</strong></p>
			</td>
			</tr>
			<tr style="mso-yfti-irow: 1;">
			<td style="${tdTableHeader}" valign="top" width="33">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">№<br>п/п</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="147">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Вид ценной бумаги<a style="mso-footnote-id: ftn17;" title="" href="#_ftn17" name="_ftnref17"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[17]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="192">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Лицо, выпустившее ценную бумагу</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="108">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Номинальная величина обязательства (руб.)</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="84">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Общее количество</p>
			</td>
			<td style="${tdTableHeader}" valign="top" width="116">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Общая стоимость<a style="mso-footnote-id: ftn18;" title="" href="#_ftn18" name="_ftnref18"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[18]<!--[endif]--></a><span lang="RU"><br>(руб.)</p>
			</td>
			</tr>`
			const tableEnd = `</tbody>
			</table>`
			let tableMiddle = ``
			const iterations = values.p5inye.length > 3 ? values.p5inye.length : 3
			for (let count = 0; count < iterations; count++) {
				const row = `<tr style="mso-yfti-irow: 2; height: 19.85pt;">
				<td style="${tdRowBorderBottom}" valign="bottom" width="33">
				<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">${"5." + (count + 1)}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="147">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p3banki[count] ? values.p3banki[count].vid : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="192">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p3banki[count] ? values.p3banki[count].litso : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="108">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p3banki[count] ? values.p3banki[count].nomVel : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="84">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p3banki[count] ? values.p3banki[count].kolvo : '-'}</p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="116">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${values.p3banki[count] ? values.p3banki[count].stoim : '-'}</p>
				</td>
				</tr>`;
				tableMiddle += row
			}
			return tableStart + tableMiddle + tableEnd
		}
		function table6() {
			const tableStart = `
			<table class="MsoNormalTable" style="margin-left: .95pt; border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" cellspacing="0" cellpadding="0">
			<tbody>
			<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; height: 19.85pt;">
			<td style="${tdTableHeader}" colspan="6" width="679">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong><span lang="EN-US" style="mso-ansi-language: EN-US;">VI<span lang="RU">. Сведения о наличных денежных средствах и ином ценном имуществе</strong></p>
			</td>
			<td style="height: 19.85pt; border: none;" width="0" height="20">&nbsp;</td>
			<!--[endif]--></tr>
			<tr style="mso-yfti-irow: 1; height: 13.8pt;">
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="33">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">№<br>п/п</p>
			</td>
			<td style="${tdTableHeader}" colspan="2" rowspan="2" valign="top" width="168">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Вид и наименование имущества</p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="125">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Стоимость<br>(сумма и валюта)<a style="mso-footnote-id: ftn19;" title="" href="#_ftn19" name="_ftnref19"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[19]<!--[endif]--></a></p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="177">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Место нахождения/место хранения<a style="mso-footnote-id: ftn20;" title="" href="#_ftn20" name="_ftnref20"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[20]<!--[endif]--></a><span lang="RU"> (адрес)</p>
			</td>
			<td style="${tdTableHeader}" rowspan="2" valign="top" width="177">
			<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Сведения о залоге и залогодержателе<a style="mso-footnote-id: ftn21;" title="" href="#_ftn21" name="_ftnref21"><span class="MsoFootnoteReference"><span lang="RU"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[21]<!--[endif]--></a></p>
			</td>
			<td style="height: 13.8pt; border: none;" width="0" height="14">&nbsp;</td>
			<!--[endif]--></tr>
			<tr style="mso-yfti-irow: 2; height: 13.8pt;">
			<td style="height: 13.8pt; border: none;" width="0" height="14">&nbsp;</td>
			<!--[endif]--></tr>`
			const tableEnd = `</tbody>
			</table>`
			let tableMiddle = ``
			headers.p6nalich.forEach((header) => {
				const found = values.p6nalich.filter(item => item.num === header.num)
				const iterations = header.num === '6.1' ? 1 : (found.length > 2 ? found.length : 2 ) // one little exclution for '6.1' here and further for table6
				const rowHeader = `<tr style="mso-yfti-irow: 3; height: 14.2pt;">
				<td style="${tdRowNum}" rowspan="${header.num === '6.1' ? '1' : iterations+1}" valign="top" width="33">
				<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">${header.num}</p>
				</td>
				<td style="${tdRowHeader}" colspan="2" valign="bottom" width="168">
				<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span lang="RU" style="font-size: 11.0pt;">${header.numName}</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="125">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${header.num === '6.1' && found[0] ? found[0].stoimAndVal : '-'}</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="177">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${header.num === '6.1' && found[0] ? found[0].address : '-'}</p>
				</td>
				<td style="${tdRowHeader}" valign="bottom" width="177">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${header.num === '6.1' && found[0] ? found[0].zalogInfo : '-'}</p>
				</td>
				<td style="height: 14.2pt; border: none;" width="0" height="14">&nbsp;</td>
				<!--[endif]--></tr>`
				tableMiddle += rowHeader
				for (let count = 0; count < iterations; count++) {
					const row = `<tr style="mso-yfti-irow: 5; height: 14.2pt;">
					<td style="${count === iterations-1 ? tdRowCountBottom : tdRowCountNone}" valign="center" width="22">
					<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt; text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${count + 1 + ")"}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowCountBottomWOLeft : tdRowBorderNoneWOLeft}" valign="center" width="145">
					<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].vidNaim : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="125">
					<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].stoimAndVal : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="177">
					<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].address : '-'}</p>
					</td>
					<td style="${count === iterations-1 ? tdRowBorderBottom : tdRowBorderNone}" valign="center" width="177">
					<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${found[count] ? found[count].zalogInfo : '-'}</p>
					</td>
					<td style="height: 14.2pt; border: none;" width="0" height="14">&nbsp;</td>
					<!--[endif]--></tr>`;
					if (header.num !== '6.1') {
						tableMiddle += row
					}
				}
			})
			return tableStart + tableMiddle + tableEnd
		}

		let docPropsTokens = []
		docPropsTokens.push(["%ПРЕДЫДУЩИЕ_ФИО%", values.prevNames || '-'])
		docPropsTokens.push(["%ТАБЛИЦА1%", table1()])
		docPropsTokens.push(["%ТАБЛИЦА2%", table2()])
		docPropsTokens.push(["%ТАБЛИЦА3%", table3()])
		docPropsTokens.push(["%ТАБЛИЦА4%", table4()])
		docPropsTokens.push(["%ТАБЛИЦА5%", table5()])
		docPropsTokens.push(["%ТАБЛИЦА6%", table6()])
		
		return docPropsTokens
	}

	function importBankAccReport(e) {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (event) => {
			const data = new Uint8Array(event.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
			const worksheet = workbook.Sheets[sheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
			jsonDataBankAccInput(jsonData)
		};
		reader.readAsArrayBuffer(file);
	}	

	async function jsonDataBankAccInput(jsonData) {
		jsonData.shift()
		let count = 1
		for (const element of jsonData) {
			try {
			  const exist = await findBankInfo({ synName: element[0] });
			  appendP3Fields({
				...emptyP3,
				num: '3.' + count,
				numName: 'Счет',
				synName: element[0],
				bik: exist[0].bik || '',
				index: exist[0].index || '',
				city: exist[0].city || '',
				shortName: exist[0].shortName || '',
				addressUlDom: exist[0].addressUlDom || '',
				vidAndVal: element[4],
				dateOtkr: dayjs(excelDateToJSDate(element[2])).format('DD.MM.YYYY'),
				ostatok: "",
			  });
			  count++
			} catch (error) {
			  console.error('Error fetching bank info:', error);
			}
		  }
		handleChange()
	}

	async function findBankInfo(query) {
		try {
			const response = await axios.post(
				`${SERVER_IP}:${SERVER_PORT}/api/banks/search`, query
			)
			return response.data
		} catch (error) {
			console.error('Error fetching data:', error)
		}
	}

	async function findInBikInfo(index) {
		const value = docProps.p3banki[index].bik
		const apiUrl = `https://bik-info.ru/api.html?type=json&bik=${value}`
		try {
			const response = await axios.get(apiUrl)
			if (response.data.bik) {
				setValue(`p3banki.${index}.shortName`, convertHTMLentities(response.data.namemini))
				setValue(`p3banki.${index}.index`, convertHTMLentities(response.data.index))
				setValue(`p3banki.${index}.city`, convertHTMLentities(response.data.city))
				setValue(`p3banki.${index}.addressUlDom`, convertHTMLentities(response.data.address))
				handleChange()
			}
		} catch (error) {
			console.error('Error fetching data:', error)
		}
	}

	async function recordBank(index) {
		const message = `Записать ${docProps.p3banki[index].shortName} в БД?`;
		if (!confirm(message)) {
			return;
		}
		if (!docProps.p3banki[index].bik) {
			console.error("БИК обязателен")
			return;
		}
		const query = {
			synName: docProps.p3banki[index].synName,
			bik: docProps.p3banki[index].bik,
			shortName: docProps.p3banki[index].shortName,
			index: docProps.p3banki[index].index,
			city: docProps.p3banki[index].city,
			addressUlDom: docProps.p3banki[index].addressUlDom,
		}
		try {
			await axios.post(
				`${SERVER_IP}:${SERVER_PORT}/api/banks/write`, query
			)
		} catch(error) {
			console.error('Error recording data', error)
		}
	}

	async function handleChange() {
		const values = getValues();
		setDocProps(values);
		setTokens([...createTokens(person)].concat([...addDocPropsTokens(values)]));
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

	/* just in case (saved template content)
	<p class="MsoNormal" style="text-align: right;" align="right"><a name="OLE_LINK2"></a><a name="OLE_LINK1"></a><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 8.0pt;">Приложение № 2</span></span></p>
<p class="MsoNormal" style="text-align: right;" align="right"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 8.0pt;">к приказу Минэкономразвития России</span></span></span></p>
<p class="MsoNormal" style="text-align: right;" align="right"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 8.0pt;">от 5 августа 2015&nbsp;г. №&nbsp;530</span></span></span></p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal" style="margin-bottom: 2.0pt; text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU" style="font-size: 14.0pt;">Опись имущества гражданина</span></strong></span></span></p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<!-- ТАБЛИЦА Информация о гражданине -->
<table class="MsoNormalTable" style="margin-left: .95pt; border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" width="680" cellspacing="0" cellpadding="0">
<tbody>
<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; height: 17.0pt;">
<td style="width: 510.25pt; border: solid #000001 1.0pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 17.0pt;" colspan="3" width="680">
<p class="MsoNormal" style="margin-left: 2.85pt; text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">Информация о гражданине</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 1; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">фамилия</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%ФАМИЛИЯ%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 2; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">имя</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%ИМЯ%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 3; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">отчество</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%ОТЧЕСТВО%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 4; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">в случае изменения фамилии, имени, отчества указать прежние фамилии, имена, отчества</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU"><span style="mso-spacerun: yes;">&nbsp;</span><em>%ПРЕДЫДУЩИЕ_ФИО%</em></span></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 5; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">дата рождения</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%ДАТАРОЖДЕНИЯ%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 6; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">место рождения</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%ПАСПОРТМЕСТО%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 7; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">СНИЛС</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%СНИЛС%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 8; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">ИНН</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%ИНН%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 9; height: 19.85pt;">
<td style="width: 510.25pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" colspan="3" width="680">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">документ, удостоверяющий личность</span></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 10; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">вид документа</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">паспорт</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 11; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">серия (при наличии) и номер</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">%ПАСПОРТСЕРИЯ% %ПАСПОРТНОМЕР%</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 12; height: 19.85pt;">
<td style="width: 510.25pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" colspan="3" width="680">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">адрес регистрации по месту жительства в Российской Федерации<span class="MsoFootnoteReference">*</span></span></span></span><a style="mso-footnote-id: ftn1;" title="" href="#_ftn1" name="_ftnref1"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[1]</span><!--[endif]--></span></span></span></a></p>
</td>
</tr>
<tr style="mso-yfti-irow: 13; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">субъект Российской Федерации</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">обязательно</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">Республика Коми</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 14; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">район</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 15; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">город</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">г. Воркута</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 16; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">населенный пункт (село, поселок и так далее)</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 17; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">улица (проспект, переулок и так далее)</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">ул. Чернова</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 18; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">номер дома (владения)</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">д. 5Б</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 19; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">номер корпуса (строения)</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">-</span></strong></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 20; mso-yfti-lastrow: yes; height: 19.85pt;">
<td style="width: 171.45pt; border: solid #000001 1.0pt; border-top: none; mso-border-top-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="229">
<p class="MsoNormal" style="margin: 0cm 2.85pt .0001pt 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">номер квартиры (офиса)</span></span></span></p>
</td>
<td style="width: 77.75pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="104">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">при наличии</span></span></span></p>
</td>
<td style="width: 261.05pt; border-top: none; border-left: none; border-bottom: solid #000001 1.0pt; border-right: solid #000001 1.0pt; mso-border-top-alt: solid #000001 .5pt; mso-border-left-alt: solid #000001 .5pt; mso-border-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="348">
<p class="MsoNormal" style="margin-left: 2.85pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><strong><span lang="RU">кв. 45</span></strong></span></span></p>
</td>
</tr>
</tbody>
</table>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="EN-US" style="mso-ansi-language: EN-US;">&nbsp;</span></span></span></p>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph; page-break-before: always;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 1.0pt;">&nbsp;</span></span></span></p>
<!-- ТАБЛИЦА1 -->
<p>%ТАБЛИЦА1%</p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 6.0pt;">&nbsp;</span></span></span></p>
<p><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;"><!-- [if !supportMisalignedRows]--> </span></span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span></p>
<!-- 2. Движимое имущество -->
<p>%ТАБЛИЦА2%</p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<!-- 3. Сведения о счетах в банках и иных кредитных организациях -->
<p>%ТАБЛИЦА3%</p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<!-- 4. Акции и иное участие в коммерческих организациях -->
<p>%ТАБЛИЦА4%</p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 1.0pt;">&nbsp;</span></span></span></p>
<!-- 5. Иные ценные бумаги -->
<p>%ТАБЛИЦА5%</p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;"><!-- [if !supportMisalignedRows]--> </span></span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><!-- [if !supportMisalignedRows]--> </span></span></p>
<!-- 6. Сведения о наличных денежных средствах и ином ценном имуществе -->
<p>%ТАБЛИЦА6%</p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<p class="MsoNormal" style="text-indent: 27.0pt;"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">Достоверность и полноту настоящих сведений подтверждаю.</span></span></span></p>
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
<!-- дата подпись -->
<table class="MsoNormalTable" style="margin-left: .7pt; border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" cellspacing="0" cellpadding="0">
<tbody>
<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; height: 14.2pt;">
<td style="width: 9.0pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="12">
<p class="MsoNormal" style="margin-left: -343.7pt; text-align: right;" align="right"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&laquo;</span></span></span></p>
</td>
<td style="width: 23.8pt; border: none; border-bottom: solid #000001 1.0pt; mso-border-bottom-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="32">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">03</span></span></span></p>
</td>
<td style="width: 11.85pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="16">
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&raquo;</span></span></span></p>
</td>
<td style="width: 80.4pt; border: none; border-bottom: solid #000001 1.0pt; mso-border-bottom-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="107">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">апреля</span></span></span></p>
</td>
<td style="width: 15.4pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="21">
<p class="MsoNormal" style="text-align: right;" align="right"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">20</span></span></span></p>
</td>
<td style="width: 23.8pt; border: none; border-bottom: solid #000001 1.0pt; mso-border-bottom-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="32">
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">24</span></span></span></p>
</td>
<td style="width: 93.15pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="124">
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU"><span style="mso-spacerun: yes;">&nbsp;</span>г.</span></span></span></p>
</td>
<td style="width: 84.0pt; border: none; border-bottom: solid #000001 1.0pt; mso-border-bottom-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="112">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
</td>
<td style="width: 10.15pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="14">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">&nbsp;</span></span></span></p>
</td>
<td style="width: 157.95pt; border: none; border-bottom: solid #000001 1.0pt; mso-border-bottom-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="211">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU">И.А. Гарифуллова</span></span></span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 1; mso-yfti-lastrow: yes;">
<td style="width: 9.0pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="12">
<p class="MsoNormal" style="text-align: right;" align="right"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></span></span></p>
</td>
<td style="width: 23.8pt; border: none; mso-border-top-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="32">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></span></span></p>
</td>
<td style="width: 11.85pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="16">
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></span></span></p>
</td>
<td style="width: 80.4pt; border: none; mso-border-top-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="107">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></span></span></p>
</td>
<td style="width: 15.4pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="21">
<p class="MsoNormal" style="text-align: right;" align="right"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></span></span></p>
</td>
<td style="width: 23.8pt; border: none; mso-border-top-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="32">
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></span></span></p>
</td>
<td style="width: 93.15pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="124">
<p class="MsoNormal"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></span></span></p>
</td>
<td style="width: 84.0pt; border: none; mso-border-top-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="112">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><em><span lang="RU" style="font-size: 7.0pt;">(подпись гражданина)</span></em></span></span></p>
</td>
<td style="width: 10.15pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="14">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><em><span lang="RU" style="font-size: 7.0pt;">&nbsp;</span></em></span></span></p>
</td>
<td style="width: 157.95pt; border: none; mso-border-top-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="211">
<p class="MsoNormal" style="text-align: center;" align="center"><span style="mso-bookmark: OLE_LINK1;"><span style="mso-bookmark: OLE_LINK2;"><em><span lang="RU" style="font-size: 7.0pt;">(расшифровка подписи)</span></em></span></span></p>
</td>
</tr>
</tbody>
</table>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph;"><span lang="RU">&nbsp;</span></p>
<!-- footnotes -->
<div style="mso-element: footnote-list;"><!-- [if !supportFootnotes]--><br clear="all"><hr align="left" size="1" width="33%"><!--[endif]-->
<div id="ftn1" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn1;" title="" href="#_ftnref1" name="_ftn1"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[1]</span><!--[endif]--></span></span></span></a><span class="MsoFootnoteReference"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>*</span></span><span lang="RU" style="font-size: 8.0pt;">&nbsp;При отсутствии регистрации по месту жительства в пределах Российской Федерации указать наименование субъекта Российской Федерации по</span><span lang="EN-US" style="font-size: 8.0pt; mso-ansi-language: EN-US;">&nbsp;</span><span lang="RU" style="font-size: 8.0pt;">месту пребывания без указания конкретного адреса:</span></p>
<table class="MsoNormalTable" style="border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" cellspacing="0" cellpadding="0">
<tbody>
<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes; mso-yfti-lastrow: yes; height: 14.2pt;">
<td style="width: 506.05pt; border: none; border-bottom: solid #000001 1.0pt; mso-border-bottom-alt: solid #000001 .5pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="675">
<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 8.0pt;">&nbsp;</span></p>
</td>
<td style="width: 3.45pt; padding: 0cm 0cm 0cm 0cm; height: 14.2pt;" valign="bottom" width="5">
<p class="MsoNormal"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span><span lang="EN-US" style="font-size: 8.0pt; mso-ansi-language: EN-US;">.</span></p>
</td>
</tr>
</tbody>
</table>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph;"><span lang="RU" style="font-size: 1.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>00</span></p>
<p class="MsoNormal" style="text-align: justify; text-justify: inter-ideograph;"><span lang="RU">&nbsp;</span></p>
</div>
<div id="ftn2" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn2;" title="" href="#_ftnref2" name="_ftn2"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[2]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается вид собственности (индивидуальная, долевая, общая); для совместной собственности указываются иные лица (фамилия, имя и отчество (последнее &mdash; при наличии) или наименование), в собственности которых находится имущество; для долевой собственности указывается доля гражданина, который составляет опись имущества.</span></p>
</div>
<div id="ftn3" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn3;" title="" href="#_ftnref3" name="_ftn3"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[3]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указываются наименование и реквизиты документа, являющегося законным основанием для возникновения права собственности.</span></p>
</div>
<div id="ftn4" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn4;" title="" href="#_ftnref4" name="_ftn4"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[4]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается при наличии документов, содержащих сведения о стоимости имущества (например, отчет о стоимости имущества, подготовленный оценщиком, договор купли-продажи, иной документ об оплате (приобретении) имущества).</span></p>
</div>
<div id="ftn5" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn5;" title="" href="#_ftnref5" name="_ftn5"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[5]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указываются сведения о договоре залога, иной сделке, на основании которой возникает залог в силу закона, а также наименование юридического лица или фамилия, имя и отчество (последнее &mdash; при наличии) физического лица, в залоге у которого находится имущество.</span></p>
</div>
<div id="ftn6" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn6;" title="" href="#_ftnref6" name="_ftn6"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[6]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается вид земельного участка (пая, доли): под индивидуальное жилищное строительство, дачный, садовый, приусадебный, огородный и&nbsp;другие.</span></p>
</div>
<div id="ftn7" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn7;" title="" href="#_ftnref7" name="_ftn7"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[7]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается при наличии у движимого имущества цифрового, буквенного обозначения или комбинации таких обозначений, которые идентифицируют указанное имущество, в том числе идентификационный номер транспортного средства (VIN).</span></p>
</div>
<div id="ftn8" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn8;" title="" href="#_ftnref8" name="_ftn8"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[8]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается вид собственности (индивидуальная, долевая, общая); для совместной собственности указываются иные лица (фамилия, имя и отчество (последнее &mdash; при наличии) или наименование), в собственности которых находится имущество; для долевой собственности указывается доля гражданина, который составляет опись имущества.</span></p>
</div>
<div id="ftn9" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn9;" title="" href="#_ftnref9" name="_ftn9"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[9]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается при наличии документов, содержащих сведения о стоимости имущества (например, отчет о стоимости имущества, подготовленный оценщиком, договор купли-продажи, кассовый чек, товарный чек, иной документ об оплате (приобретении) имущества).</span></p>
</div>
<div id="ftn10" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn10;" title="" href="#_ftnref10" name="_ftn10"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[10]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указываются сведения о договоре залога, иной сделке, на основании которой возникает залог в силу закона, а также наименование юридического лица или фамилия, имя и отчество (последнее &mdash; при наличии) физического лица, в залоге у которого находится имущество.</span></p>
</div>
<div id="ftn11" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn11;" title="" href="#_ftnref11" name="_ftn11"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[11]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается вид счета (например, депозитный, текущий, расчетный, ссудный) и валюта счета.</span></p>
</div>
<div id="ftn12" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn12;" title="" href="#_ftnref12" name="_ftn12"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[12]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Остаток на счете указывается по состоянию на дату составления описи имущества гражданина. Для счетов в иностранной валюте остаток указывается в рублях по курсу Банка России на дату составления описи имущества гражданина.</span></p>
</div>
<div id="ftn13" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn13;" title="" href="#_ftnref13" name="_ftn13"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[13]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается полное или сокращенное официальное наименование организации и ее организационно-правовая форма (например, акционерное общество, общество с ограниченной ответственностью, полное товарищество, товарищество на вере, производственный кооператив, хозяйственное партнерство).</span></p>
</div>
<div id="ftn14" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn14;" title="" href="#_ftnref14" name="_ftn14"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[14]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается согласно учредительным документам организации по состоянию на дату составления описи имущества гражданина. Суммы, выраженные в иностранной валюте, указываются в рублях по курсу Банка России на дату составления описи имущества гражданина.</span></p>
</div>
<div id="ftn15" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn15;" title="" href="#_ftnref15" name="_ftn15"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[15]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается доля участия в уставном, складочном капитале, паевом фонде. Для акционерных обществ указываются также номинальная стоимость и количество акций.</span></p>
</div>
<div id="ftn16" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn16;" title="" href="#_ftnref16" name="_ftn16"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[16]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указываются основание приобретения доли участия (например, учредительный договор, приватизация, покупка, мена, дарение, наследование), а&nbsp;также реквизиты (дата, номер) соответствующего договора или акта.</span></p>
</div>
<div id="ftn17" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn17;" title="" href="#_ftnref17" name="_ftn17"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[17]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указываются все ценные бумаги по видам (например, облигации, векселя), за исключением акций, указанных в разделе IV &laquo;Акции и иное участие в коммерческих организациях&raquo;.</span></p>
</div>
<div id="ftn18" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn18;" title="" href="#_ftnref18" name="_ftn18"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[18]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указывается общая стоимость ценных бумаг данного вида исходя из стоимости их приобретения (если ее нельзя определить &mdash; исходя из рыночной стоимости или номинальной стоимости). Для обязательств, выраженных в иностранной валюте, стоимость указывается в рублях по курсу Банка России на дату составления описи имущества гражданина.</span></p>
</div>
<div id="ftn19" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn19;" title="" href="#_ftnref19" name="_ftn19"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[19]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;В отношении наличных денежных средств в валюте указывается сумма по курсу Банка России на дату подачи заявления о признании должника банкротом, в отношении иного указывается при наличии документов, содержащих сведения о стоимости имущества (например, отчет о стоимости имущества, подготовленный оценщиком, договор купли-продажи, кассовый чек, товарный чек, иной документ об оплате (приобретении) имущества).</span></p>
</div>
<div id="ftn20" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn20;" title="" href="#_ftnref20" name="_ftn20"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[20]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указываются сведения о договоре хранения ценностей в индивидуальном банковском сейфе (ячейке) и наименование кредитной организации.</span></p>
</div>
<div id="ftn21" style="mso-element: footnote;">
<p class="MsoFootnoteText" style="text-align: justify; text-justify: inter-ideograph;"><a style="mso-footnote-id: ftn21;" title="" href="#_ftnref21" name="_ftn21"><span class="a"><span lang="RU" style="font-size: 8.0pt;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 8.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: SimSun; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: RU; mso-bidi-language: AR-SA;">[21]</span><!--[endif]--></span></span></span></a><span lang="RU" style="font-size: 8.0pt;"><span style="mso-tab-count: 1;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>&nbsp;Указываются сведения о договоре залога, иной сделке, на основании которой возникает залог в силу закона, а также наименование юридического лица или фамилия, имя и отчество (последнее &mdash; при наличии) физического лица, в залоге у которого находится имущество.</span></p>
</div>
</div>
	*/

	return (
		<>
			<div className="component">
				<form>
					{/* <form onSubmit={handleSubmit(onSubmit)}> */}
					<hr className="mb-3" />
					<h3>Данные описи имущества гражданина</h3>

				{/* Предыдущие ФИО */}
				<div className="col-md-12 mb-3">
					<label htmlFor="bankrotopis-prevNames">
					Предыдущие ФИО
					</label>
					<input
						type="text"
						className="form-control"
						id="prevNames"
						placeholder="Девичьева, Затупина, Елена Сергеевна Выскочко..."
						{...register("prevNames", { onChange: () => handleChange() })}
					/>
				</div>

				<legend className="bg-light">1. Недвижимое имущество</legend>
				{p1Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p1nedvizh">{field.num} {field.numName}</label>
							<div className="col-md-3 mb-3"><input type="text" id="p1Fields-vidNaim" className="form-control" {...register(`p1nedvizh.${index}.vidNaim`, { onChange: () => handleChange() })} placeholder="Вид и наименование имущества" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p1Fields-vidSob" className="form-control" {...register(`p1nedvizh.${index}.vidSob`, { onChange: () => handleChange() })} placeholder="Вид собственности" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p1Fields-address" className="form-control" {...register(`p1nedvizh.${index}.address`, { onChange: () => handleChange() })} placeholder="Местонахождение (адрес)" /></div>
							<div className="col-md-1 mb-3"><input type="text" id="p1Fields-square" className="form-control" {...register(`p1nedvizh.${index}.square`, { onChange: () => handleChange() })} placeholder="Площадь (кв.м.)" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p1Fields-osnAndPrice" className="form-control" {...register(`p1nedvizh.${index}.osnAndPrice`, { onChange: () => handleChange() })} placeholder="Основание приобретения и стоимость" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p1Fields-zalogInfo" className="form-control" {...register(`p1nedvizh.${index}.zalogInfo`, { onChange: () => handleChange() })} placeholder="Сведения о залогодержателе" /></div>
							<div className="col-md-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP1Fields" onClick={() => removeP1Fields(index)}>-</button></div>
						</div>)})}
				<div className="container mb-3">
					{headers.p1nedvizh.map((item, index) => {
						return <button type="button" className="btn btn-light btn-sm" key={index} id="phone" onClick={() => appendP1Fields({...emptyP1, num: item.num, numName: item.numName})}>+ {item.num} {item.numName}</button>
					})}
				</div>
					
				<legend className="bg-light">2. Движимое имущество</legend>
				{p2Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p2-nedvizh">{field.num} {field.numName}</label>
							<div className="col-md-3 mb-3"><input type="text" id="p2Fields-vidMarka" className="form-control" {...register(`p2dvizh.${index}.vidMarka`, { onChange: () => handleChange() })} placeholder="Вид, марка, модель транспортного средства, год изготовления" readOnly/></div>
							<div className="col-md-3 mb-3"><input type="text" id="p2Fields-idNumber" className="form-control" {...register(`p2dvizh.${index}.idNumber`, { onChange: () => handleChange() })} placeholder="Вид собственности" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p2Fields-vidSob" className="form-control" {...register(`p2dvizh.${index}.vidSob`, { onChange: () => handleChange() })} placeholder="Место нахождения/место хранения (адрес)" /></div>
							<div className="col-md-1 mb-3"><input type="text" id="p2Fields-address" className="form-control" {...register(`p2dvizh.${index}.address`, { onChange: () => handleChange() })} placeholder="Стоимость" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p2Fields-stoim" className="form-control" {...register(`p2dvizh.${index}.stoim`, { onChange: () => handleChange() })} placeholder="Основание приобретения и стоимость" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p2Fields-zalogInfo" className="form-control" {...register(`p2dvizh.${index}.zalogInfo`, { onChange: () => handleChange() })} placeholder="Сведения о залогодержателе" /></div>
							<div className="col-md-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP2Fields" onClick={() => removeP2Fields(index)}>-</button></div>
						</div>)})}
				<div className="container mb-3">
				{headers.p2dvizh.map((item, index) => {
						return <button type="button" className="btn btn-light btn-sm" key={index} id="phone" onClick={() => appendP2Fields({...emptyP2, num: item.num, numName: item.numName})}>+ {item.num} {item.numName}</button>
					})}
				</div>
				
				<legend className="bg-light">3. Сведения о счетах в банках и иных кредитных организациях</legend>
				{p3Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p3banki">{field.num} {field.numName}</label>
							<div className="col-sm-3 mb-3"><input type="text" id="p3Fields-synName" className="form-control" {...register(`p3banki.${index}.synName`, { onChange: () => handleChange() })} placeholder="Наименование банка или иной кредитной организации" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p3Fields-bik" className="form-control" {...register(`p3banki.${index}.bik`, { onChange: () => handleChange() })} placeholder="БИК" /></div>
							<div className="col-sm-1 mb-3">
								<button type="button" className="btn btn-outline-primary btn-sm btn-block" id="findInBikInfo" onClick={() => findInBikInfo(index)} title='искать данные по Краткому наименованию или БИК в справочнике БИК' disabled={!docProps.p3banki[index]}>?</button>
								&nbsp;
								<button type="button" className="btn btn-outline-primary btn-sm btn-block" id="findInBikInfo" onClick={() => recordBank(index)} title='записать банк в БД ' disabled={!docProps.p3banki[index]}>&bull;</button>
							</div>
							<div className="col-sm-2 mb-3"><input type="text" id="p3Fields-shortName" className="form-control" {...register(`p3banki.${index}.shortName`, { onChange: () => handleChange() })} placeholder="Краткое наименование банка" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p3Fields-index" className="form-control" {...register(`p3banki.${index}.index`, { onChange: () => handleChange() })} placeholder="Индекс банка или иной кредитной организации" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p3Fields-city" className="form-control" {...register(`p3banki.${index}.city`, { onChange: () => handleChange() })} placeholder="Город банка или иной кредитной организации" /></div>
							<div className="col-sm-4 mb-3"><input type="text" id="p3Fields-addressUlDom" className="form-control" {...register(`p3banki.${index}.addressUlDom`, { onChange: () => handleChange() })} placeholder="Адрес банка или иной кредитной организации" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p3Fields-vidAndVal" className="form-control" {...register(`p3banki.${index}.vidAndVal`, { onChange: () => handleChange() })} placeholder="Вид и валюта счета" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p3Fields-dateOtkr" className="form-control" {...register(`p3banki.${index}.dateOtkr`, { onChange: () => handleChange() })} placeholder="Дата открытия счета" /></div>
							<div className="col-sm-1 mb-3"><input type="text" id="p3Fields-ostatok" className="form-control" {...register(`p3banki.${index}.ostatok`, { onChange: () => handleChange() })} placeholder="Остаток" /></div>
							<div className="col-sm-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP3Fields" onClick={() => removeP3Fields(index)}>-</button></div>
						</div>)})}
				<div className="container-fluid mb-3">
					<div className="col-sm-2 mb-1">
						<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendP3Fields({...emptyP3, num: `3.${p3Fields.length+1}`, numName: "Счет"})}>+ Добавить счет</button>
					</div>
					<div className="col-sm-3 mb-3">
						<input className="form-control-sm" type="file" id="formFile" onChange={importBankAccReport} title='Выберите файл для импорта' />
					</div>
				</div>
				
				<legend className="bg-light">4. Акции и иное участие в коммерческих организациях</legend>
				{p4Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p4akcii">{field.num} {field.numName}</label>
							<div className="col-md-3 mb-3"><input type="text" id="p4Fields-nameAndOrg" className="form-control" {...register(`p4akcii.${index}.nameAndOrg`, { onChange: () => handleChange() })} placeholder="Наименование и организационно-правовая форма организации" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p4Fields-address" className="form-control" {...register(`p4akcii.${index}.address`, { onChange: () => handleChange() })} placeholder="Местонахождение организации (адрес)" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p4Fields-ustKapital" className="form-control" {...register(`p4akcii.${index}.ustKapital`, { onChange: () => handleChange() })} placeholder="Уставный, складочный капитал, паевый фонд (руб.)" /></div>
							<div className="col-md-1 mb-3"><input type="text" id="p4Fields-dol" className="form-control" {...register(`p4akcii.${index}.dol`, { onChange: () => handleChange() })} placeholder="Доля участия" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p4Fields-osn" className="form-control" {...register(`p4akcii.${index}.osn`, { onChange: () => handleChange() })} placeholder="Основание участия" /></div>
							<div className="col-md-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP4Fields" onClick={() => removeP4Fields(index)}>-</button></div>
						</div>)})}
				<div className="container mb-3">
					<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendP4Fields({...emptyP4, num: `4.${p4Fields.length+1}`, numName: "Акции и иное"})}>+ Добавить акцию или иное</button>
				</div>

				<legend className="bg-light">5. Иные ценные бумаги</legend>
				{p5Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p5-akcii">{field.num} {field.numName}</label>
							<div className="col-md-3 mb-3"><input type="text" id="p5Fields-nameAndOrg" className="form-control" {...register(`p5inye.${index}.vid`, { onChange: () => handleChange() })} placeholder="Вид ценной бумаги" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p5Fields-address" className="form-control" {...register(`p5inye.${index}.litso`, { onChange: () => handleChange() })} placeholder="Лицо, выпустившее ценную бумагу" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p5Fields-ustKapital" className="form-control" {...register(`p5inye.${index}.nomVel`, { onChange: () => handleChange() })} placeholder="Номинальная величина обязательства (руб.)" /></div>
							<div className="col-md-1 mb-3"><input type="text" id="p5Fields-dol" className="form-control" {...register(`p5inye.${index}.kolvo`, { onChange: () => handleChange() })} placeholder="Общее количество" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p5Fields-osn" className="form-control" {...register(`p5inye.${index}.stoim`, { onChange: () => handleChange() })} placeholder="Общая стоимость (руб.)" /></div>
							<div className="col-md-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP5Fields" onClick={() => removeP5Fields(index)}>-</button></div>
						</div>)})}
				<div className="container mb-3">
					<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendP5Fields({...emptyP5, num: `5.${p5Fields.length+1}`, numName: "Иная ценная бумага"})}>+ Иную ценную бумагу</button>
				</div>
				
				<legend className="bg-light">6. Сведения о наличных денежных средствах и ином ценном имуществе</legend>
				{p6Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p6nalich">{field.num} {field.numName}</label>
							<div className="col-md-3 mb-3"><input type="text" id="p6Fields-vidNaim" className="form-control" {...register(`p6nalich.${index}.vidNaim`, { onChange: () => handleChange() })} placeholder="Вид и наименование имущества" disabled={field.num === '6.1'}/></div>
							<div className="col-md-1 mb-3"><input type="text" id="p6Fields-stoimAndVal" className="form-control" {...register(`p6nalich.${index}.stoimAndVal`, { onChange: () => handleChange() })} placeholder="Стоимость (сумма и валюта)" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p6Fields-address" className="form-control" {...register(`p6nalich.${index}.address`, { onChange: () => handleChange() })} placeholder="Место нахождения/место хранения (адрес)" /></div>
							<div className="col-md-3 mb-3"><input type="text" id="p6Fields-zalogInfo" className="form-control" {...register(`p6nalich.${index}.zalogInfo`, { onChange: () => handleChange() })} placeholder="Сведения о залогодержателе" /></div>
							<div className="col-md-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP6Fields" onClick={() => removeP6Fields(index)}>-</button></div>
						</div>)})}
				<div className="container mb-3">
				{headers.p6nalich.map((item, index) => {
						return <button type="button" className="btn btn-light btn-sm" key={index} id="phone" onClick={() => appendP6Fields({...emptyP6, num: item.num, numName: item.numName})}>+ {item.num} {item.numName}</button>
					})}
				</div>
				<div className="col-md-2 mb-3">
					<label htmlFor="date">Дата документа</label>
					<input type="date" className="form-control" id="date" {...register("date", { onChange: () => handleChange() })} />
				</div>
				</form>
			</div>

			<Tokens tokens={tokens} />

			<TinyEditorAndButtons
				docProps={docProps}
				tokens={tokens}
				templateURLName={templateURLName}
				docName={doc.name || `${person.lastName} ${person.firstName[0]}.${person.middleName[0]}. - опись имущества гражданина`}
				logValues={logValues}
			/>
		</>
	);
}

export { TemplateBankrotOpis };
