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
const fs = require('fs');
const pdf = require('pdf-parse');

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];


function TemplateBankrotSpisok() {
	// Шаблон список кредиторов и должников гражданина
	// (утв. приказом Минэкономразвития от 05.08.2015 № 530)
	const templateURLName = 'templatebankrotspisok'
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
			const query = {title: 'Шаблон список кредиторов и должников гражданина'}
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

// LAST STOP
// method to easily create db string for template - LATER
// method to get docProps from other docProps - LATER
// try pdf-parse package


	const initialDocProps = {
		prevnames: "",
    	p11kreditorsNePredprinDen: [],
    	p12kreditorsNePredprinPlat: [],
    	// p2kreditorsPredprin: [],
    	// p3dolgersNePredprin: [],
    	// p4dolgersPredprin: [],
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
	1. Сведения о кредиторах гражданина
(по денежным обязательствам и (или) обязанности по уплате обязательных платежей,
за исключением возникших в результате осуществления гражданином
предпринимательской деятельности)
	2. Сведения о кредиторах гражданина
(по денежным обязательствам и (или) обязанности по уплате обязательных платежей,
которые возникли в результате осуществления гражданином
предпринимательской деятельности)
	3. Сведения о должниках гражданина
(по денежным обязательствам и (или) обязанности по уплате обязательных платежей,
за исключением возникших в результате осуществления гражданином
предпринимательской деятельности)
	4. Сведения о должниках гражданина
(по денежным обязательствам и (или) обязанности по уплате обязательных платежей,
которые возникли в результате осуществления гражданином
предпринимательской деятельности)
	*/

	const { fields: p11Fields, append: appendP11Fields, remove: removeP11Fields } = useFieldArray({ control, name: "p11kreditorsNePredprinDen"})
	const { fields: p12Fields, append: appendP12Fields, remove: removeP12Fields } = useFieldArray({ control, name: "p12kreditorsNePredprinPlat"})

	const emptyP11 = {
		num: "",
		sodObyaz: "",
		kreditor: "",
		mestoKreditor: "",
		osnVoznik: "",
		sumVsego: "",
		sumDolg: "",
		shtrafPeni: "",
	}
	const emptyP12 = {
		num: "",
		naimPlat: "",
		nedoimka: "",
		shtrafPeni: "",
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
			const tableStart = `<table class="MsoNormalTable" style="margin-left: .35pt; border-collapse: collapse; mso-table-layout-alt: fixed; mso-padding-alt: 0cm 0cm 0cm 0cm;" border="0" width="689" cellspacing="0" cellpadding="0">
<tbody>
<tr style="mso-yfti-irow: 0; mso-yfti-firstrow: yes;">
<td style="width: 516.8pt; border: solid navy 1.0pt; mso-border-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" colspan="8" valign="top" width="689">
<p class="MsoNormal" style="text-align: center;" align="center"><a name="sub_2010"></a><strong style="mso-bidi-font-weight: normal;"><span lang="RU">I. Сведения о кредиторах гражданина</span></strong><span lang="RU"><br><strong style="mso-bidi-font-weight: normal;">(по денежным обязательствам и (или) обязанности по уплате обязательных платежей,</strong><br><strong style="mso-bidi-font-weight: normal;">за исключением возникших в результате осуществления гражданином</strong><br><strong style="mso-bidi-font-weight: normal;">предпринимательской деятельности)</strong></span></p>
</td>
</tr>
`
			const tableHeader1 = `ti-irow: 1; height: 19.85pt;">
<td style="width: 20.6pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="27">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong style="mso-bidi-font-weight: normal;"><span lang="RU">1</span></strong></p>
</td>
<td style="width: 496.2pt; border: solid navy 1.0pt; border-top: none; mso-border-top-alt: solid navy .5pt; mso-border-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" colspan="7" width="662">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong style="mso-bidi-font-weight: normal;"><span lang="RU">Денежные обязательства</span></strong></p>
</td>
</tr>
<tr style="mso-yfti-irow: 2;">
<td style="width: 20.6pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" rowspan="2" valign="top" width="27">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">№<br>п/п</span></p>
</td>
<td style="width: 84.95pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" rowspan="2" valign="top" width="113">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">Содержание обязательства<a style="mso-footnote-id: ftn2;" title="" href="#_ftn2" name="_ftnref2"><span class="MsoFootnoteReference"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 11.0pt; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA;">[2]</span><!--[endif]--></span></span></a></span></p>
</td>
<td style="width: 67.8pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" rowspan="2" valign="top" width="90">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">Кредитор<a style="mso-footnote-id: ftn3;" title="" href="#_ftn3" name="_ftnref3"><span class="MsoFootnoteReference"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 11.0pt; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA;">[3]</span><!--[endif]--></span></span></a></span></p>
</td>
<td style="width: 95.2pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" rowspan="2" valign="top" width="127">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">Место нахождения (место жительства) кредитора</span></p>
</td>
<td style="width: 70.95pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" rowspan="2" valign="top" width="95">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">Основание возникнове-</span></p>
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">ния<a style="mso-footnote-id: ftn4;" title="" href="#_ftn4" name="_ftnref4"><span class="MsoFootnoteReference"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 11.0pt; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA;">[4]</span><!--[endif]--></span></span></a></span></p>
</td>
<td style="width: 120.6pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" colspan="2" valign="top" width="161">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">Сумма обязательства</span></p>
</td>
<td style="width: 2.0cm; border: solid navy 1.0pt; border-top: none; mso-border-top-alt: solid navy .5pt; mso-border-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="76">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">Штрафы, пени и</span><span lang="EN-US" style="font-size: 11.0pt; mso-ansi-language: EN-US;">&nbsp;</span><span lang="RU" style="font-size: 11.0pt;">иные санкции</span></p>
</td>
</tr>
<tr style="mso-yfti-irow: 3;">
<td style="width: 56.8pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .75pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="76">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">всего<a style="mso-footnote-id: ftn5;" title="" href="#_ftn5" name="_ftnref5"><span class="MsoFootnoteReference"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 11.0pt; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA;">[5]</span><!--[endif]--></span></span></a></span></p>
</td>
<td style="width: 63.8pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="85">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">в том числе задолжен-</span></p>
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">ность<a style="mso-footnote-id: ftn6;" title="" href="#_ftn6" name="_ftnref6"><span class="MsoFootnoteReference"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span lang="RU" style="font-size: 11.0pt; mso-font-kerning: .5pt; mso-ansi-language: RU; mso-fareast-language: ZH-CN; mso-bidi-language: AR-SA;">[6]</span><!--[endif]--></span></span></a></span></p>
</td>
<td style="width: 2.0cm; border: solid navy 1.0pt; border-top: none; mso-border-left-alt: solid navy .75pt; mso-border-bottom-alt: solid navy .75pt; mso-border-right-alt: solid navy .75pt; padding: 0cm 0cm 0cm 0cm;" valign="top" width="76">
<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">&nbsp;</span></p>
</td>
			</tr>`
			const tableHeader2 = `<tr style="mso-yfti-irow: 7; height: 19.85pt;">
<td style="width: 28.55pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" width="38">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong style="mso-bidi-font-weight: normal;"><span lang="RU">2</span></strong></p>
</td>
<td style="width: 481.7pt; border: solid navy 1.0pt; border-top: none; mso-border-top-alt: solid navy .5pt; mso-border-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm; height: 19.85pt;" colspan="7" width="642">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><strong style="mso-bidi-font-weight: normal;"><span lang="RU">Обязательные платежи</span></strong></p>
</td>
</tr>
<tr style="mso-yfti-irow: 8;">
<td style="width: 28.55pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" valign="bottom" width="38">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">№<br>п/п</span></p>
</td>
<td style="width: 228.95pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" colspan="3" valign="top" width="305">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Наименование налога, сбора или иного обязательного платежа</span></p>
</td>
<td style="width: 132.25pt; border-top: none; border-left: solid navy 1.0pt; border-bottom: solid navy 1.0pt; border-right: none; mso-border-top-alt: solid navy .5pt; mso-border-left-alt: solid navy .5pt; mso-border-bottom-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" colspan="2" valign="top" width="176">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Недоимка</span></p>
</td>
<td style="width: 120.5pt; border: solid navy 1.0pt; border-top: none; mso-border-top-alt: solid navy .5pt; mso-border-alt: solid navy .5pt; padding: 0cm 0cm 0cm 0cm;" colspan="2" valign="top" width="161">
<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU">Штрафы, пени и</span><span lang="EN-US" style="mso-ansi-language: EN-US;">&nbsp;</span><span lang="RU">иные санкции</span></p>
</td>
			</tr>`
			const tableEnd = `</tbody>
			</table>`
			let tableMiddle1 = ``
			let tableMiddle2 = ``
			const iterations1 = values.p11kreditorsNePredprinDen.length > 3 ? values.p3banki.length : 3
			const iterations2 = values.p12kreditorsNePredprinPlat.length > 2 ? values.p3banki.length : 2
			for (let count = 0; count < iterations1; count++) {
				const row1 = `<tr style="mso-yfti-irow: 4;">
				<td style="${tdRowBorderBottom}" valign="bottom" width="27">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="RU" style="font-size: 11.0pt;">${"1." + (count + 1)}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" valign="top" width="113">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">${values.p11kreditorsNePredprinDen[count] ? values.p11kreditorsNePredprinDen[count].sodObyaz : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" valign="top" width="90">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt; color: black;">${values.p11kreditorsNePredprinDen[count] ? values.p11kreditorsNePredprinDen[count].kreditor : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" valign="top" width="127">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt; color: black;">${values.p11kreditorsNePredprinDen[count] ? values.p11kreditorsNePredprinDen[count].mestoKreditor : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" valign="top" width="95">
				<p class="MsoNormal"><span lang="RU" style="font-size: 11.0pt;">${values.p11kreditorsNePredprinDen[count] ? values.p11kreditorsNePredprinDen[count].osnVoznik : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" valign="top" width="76">
				<p class="MsoNormal" style="margin-left: 2.85pt; text-align: right;" align="right"><span lang="RU" style="font-size: 11.0pt;">${values.p11kreditorsNePredprinDen[count] ? values.p11kreditorsNePredprinDen[count].sumVsego : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" valign="bottom" width="85">
				<p class="MsoNormal" style="margin-left: 2.85pt; text-align: right;" align="right"><span lang="RU" style="font-size: 11.0pt;">${values.p11kreditorsNePredprinDen[count] ? values.p11kreditorsNePredprinDen[count].sumDolg : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" valign="top" width="76">
				<p class="MsoNormal" style="text-align: right;" align="right"><span lang="RU" style="font-size: 11.0pt;">${values.p11kreditorsNePredprinDen[count] ? values.p11kreditorsNePredprinDen[count].shtrafPeni : '-'}</span></p>
				</td>
				</tr>`;
				tableMiddle1 += row1
			}

			for (let count = 0; count < iterations2; count++) {
				const row2 = `<tr style="mso-yfti-irow: 9; height: 19.85pt;">
				<td style="${tdRowBorderBottom}" valign="bottom" width="38">
				<p class="MsoNormal" style="text-align: center; margin: 0cm 2.85pt .0001pt 2.85pt;" align="center"><span lang="RU" style="font-size: 11.0pt;">${"2." + (count + 1)}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" colspan="3" valign="bottom" width="305">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="EN-US" style="font-size: 11.0pt; mso-ansi-language: EN-US;">${values.p12kreditorsNePredprinPlat[count] ? values.p12kreditorsNePredprinPlat[count].naimPlat : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" colspan="2" valign="bottom" width="176">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="EN-US" style="font-size: 11.0pt; mso-ansi-language: EN-US;">${values.p12kreditorsNePredprinPlat[count] ? values.p12kreditorsNePredprinPlat[count].nedoimka : '-'}</span></p>
				</td>
				<td style="${tdRowBorderBottom}" colspan="2" valign="bottom" width="161">
				<p class="MsoNormal" style="text-align: center;" align="center"><span lang="EN-US" style="font-size: 11.0pt; mso-ansi-language: EN-US;">${values.p12kreditorsNePredprinPlat[count] ? values.p12kreditorsNePredprinPlat[count].shtrafPeni : '-'}</span></p>
				</td>
				</tr>`;
				tableMiddle2 += row2
			}
			return tableStart + tableHeader1 + tableMiddle1 + tableHeader2 + tableMiddle2 + tableEnd
		}

		let docPropsTokens = []
		docPropsTokens.push(["%ПРЕДЫДУЩИЕ_ФИО%", values.prevNames || '-'])
		docPropsTokens.push(["%ТАБЛИЦА1%", table1()])
		
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

	function importPdfCreditReport(e) {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (event) => {
			const buffer = reader.result
			pdf(buffer).then(function(data) {
				console.log(data.numpages); // number of pages
				console.log(data.numrender); // number of rendered pages
				console.log(data.info); // PDF info
				console.log(data.metadata);  // PDF metadata
				console.log(data.version); // PDF.js version // check https://mozilla.github.io/pdf.js/getting_started/
				console.log(data.text); // PDF text
			});
		};
		reader.readAsArrayBuffer(file)
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
				
				<legend className="bg-light">1. Сведения о кредиторах гражданина (по денежным обязательствам и (или) обязанности по уплате обязательных платежей, за исключением возникших в результате осуществления гражданином предпринимательской деятельности)</legend>
				<legend className="bg-light">Денежные обязательства</legend>
				{p11Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p11kreditorsNePredprinDen">{field.num} {field.numName}</label>
							<div className="col-sm-3 mb-3"><input type="text" id="p11Fields-num" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.num`, { onChange: () => handleChange() })} placeholder="№ п/п" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p11Fields-sodObyaz" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.sodObyaz`, { onChange: () => handleChange() })} placeholder="Содержание обязательства" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p11Fields-kreditor" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.kreditor`, { onChange: () => handleChange() })} placeholder="Кредитор" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p11Fields-mestoKreditor" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.mestoKreditor`, { onChange: () => handleChange() })} placeholder="Место нахождения (место жительства) кредитора" /></div>
							<div className="col-sm-4 mb-3"><input type="text" id="p11Fields-osnVoznik" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.osnVoznik`, { onChange: () => handleChange() })} placeholder="Основание возникновения" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p11Fields-sumVsego" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.sumVsego`, { onChange: () => handleChange() })} placeholder="Всего сумма обязательства" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p11Fields-sumDolg" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.sumDolg`, { onChange: () => handleChange() })} placeholder="В том числе задолженность по обязательствам" /></div>
							<div className="col-sm-1 mb-3"><input type="text" id="p11Fields-shtrafPeni" className="form-control" {...register(`p11kreditorsNePredprinDen.${index}.shtrafPeni`, { onChange: () => handleChange() })} placeholder="Штрафы, пени и иные санкции" /></div>
							<div className="col-sm-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP11Fields" onClick={() => removeP11Fields(index)}>-</button></div>
						</div>)})}
				<div className="container-fluid mb-3">
					<div className="col-sm-2 mb-1">
						<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendP11Fields({...emptyP11, num: `1.${p11Fields.length+1}`})}>+ Добавить счет</button>
					</div>
					<div className="col-sm-3 mb-3">
						<input className="form-control-sm" type="file" id="formFile" onChange={importBankAccReport} title='Выберите файл для импорта' />
					</div>
				</div>

				<legend className="bg-light">Обязательные платежи</legend>
				{p12Fields.map((field, index) => {
					return (
						<div className="row" key={field.id}>
							<label htmlFor="p12kreditorsNePredprinPlat">{field.num} {field.numName}</label>
							<div className="col-sm-3 mb-3"><input type="text" id="p12Fields-num" className="form-control" {...register(`p12kreditorsNePredprinPlat.${index}.num`, { onChange: () => handleChange() })} placeholder="№ п/п" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p12Fields-naimPlat" className="form-control" {...register(`p12kreditorsNePredprinPlat.${index}.naimPlat`, { onChange: () => handleChange() })} placeholder="Наименование налога, сбора или иного обязательного платежа" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p12Fields-nedoimka" className="form-control" {...register(`p12kreditorsNePredprinPlat.${index}.nedoimka`, { onChange: () => handleChange() })} placeholder="Недоимка" /></div>
							<div className="col-sm-2 mb-3"><input type="text" id="p12Fields-shtrafPeni" className="form-control" {...register(`p12kreditorsNePredprinPlat.${index}.shtrafPeni`, { onChange: () => handleChange() })} placeholder="Штрафы, пени и иные санкции" /></div>
							<div className="col-sm-1 mb-3"><button type="button" className="btn btn-outline-danger btn-sm btn-block" id="removeP12Fields" onClick={() => removeP12Fields(index)}>-</button></div>
						</div>)})}
				<div className="container-fluid mb-3">
					<div className="col-sm-2 mb-1">
						<button type="button" className="btn btn-light btn-sm" id="phone" onClick={() => appendP12Fields({...emptyP12, num: `2.${p12Fields.length+1}`})}>+ Добавить счет</button>
					</div>
					<div className="col-sm-3 mb-3">
						<input className="form-control-sm" type="file" id="formFile" onChange={importPdfCreditReport} title='Выберите файл для импорта' />
					</div>
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

export { TemplateBankrotSpisok };
