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
} from "../functions";
import { Tokens } from "./Tokens";
import { TinyEditorAndButtons } from "./TinyEditorAndButtons";
import { addTemplateActionCreator } from '../store/templateReducer';

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

	function handleTemplateStateChange(data) {
		setTemplateState((prevState) => ({ ...prevState, ...data }));
	}

	const [unusedNumbersState, setUnusedNumbersState] = useState([]);
	useEffect(() => {
		async function getNum() {
			const data = await getCurrentYearNumbers("Договор");
			const unusedNumbers = getUnusedNumbers(data).sort((a, b) => a - b);
			setUnusedNumbersState(unusedNumbers)
			console.log("getUnusedNumbers:", unusedNumbers);
			setDocProps({ ...docProps, [number]: unusedNumbers[0] });
			setValue("number", unusedNumbers[0]);
		}

		
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
		getNum();
		getTemplate()
	}, []);

	const initialDocProps = {
		totalSum: 1000,
		date: dayjs().format("YYYY-MM-DD"),
		datePayment: dayjs().add(1, 'month').format("YYYY-MM-DD"),
		number: "1",
		payVariant: "в начале",
		initialSum: "",
		intervalSum: "",
		payPeriodMultiplier: "",
		payPeriod: "",
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

	const [tokens, setTokens] = useState(
		[...createTokens(person)].concat([...addDocPropsTokens(getValues())])
	);

	console.log("tokens:", tokens);
		
	function addDocPropsTokens(values) {
		// AGREEMENT DOCPROPS-SPECIFIED TOKENS
		let docPropsTokens = []
		values.totalSum && docPropsTokens.push(["%ДОГОВОРСУММА%", values.totalSum]);
		values.totalSum && docPropsTokens.push(["%ДОГОВОРСУММАПРОПИСЬ%", deleteRub(rubles(values.totalSum))]);
		values.date && docPropsTokens.push(["%ДОГОВОРДАТА%", dayjs(values.date).format("DD.MM.YYYY")]);
		values.number && docPropsTokens.push(["%ДОГОВОРНОМЕР%", values.number]);
		values.payVariant && docPropsTokens.push(["%ДОГОВОРВИДОПЛАТЫ%", values.payVariant]);
		values.initialSum && docPropsTokens.push(["%ДОГОВОРПЕРВЫЙПЛАТЕЖ%", values.initialSum]);
		values.intervalSum && docPropsTokens.push(["%ДОГОВОРПОСЛЕДУЮЩИЙПЛАТЕЖ%", values.intervalSum]);
		values.payPeriodMultiplier && docPropsTokens.push(["%ДОГОВОРМНОЖИТЕЛЬПЕРИОДА%", values.payPeriodMultiplier]);
		values.payPeriod && docPropsTokens.push(["%ДОГОВОРПЕРИОДОПЛАТЫ%", values.payPeriod]);

		let paymentBlock = ''
		if (values.payVariant === 'при подписании') {
			paymentBlock = `сумму в размере ${values.totalSum} (${deleteRub(rubles(values.totalSum))}) рублей при подписании Договора.`
		}
		else if (values.payVariant === 'не позднее') {
			paymentBlock = [`сумму в размере ${values.totalSum} (${deleteRub(rubles(values.totalSum))}) рублей не позднее ${dayjs(values.datePayment).format("DD.MM.YYYY")}.`]
			paymentBlock.push(`Заказчик вправе досрочно исполнить свои обязательства по оплате предоставляемых по настоящему договору услуг.`)
			paymentBlock = paymentBlock.join('<br/>')
		}
		else if (values.payVariant === 'график платежей') {
			const payArr = paymentsSchedule(values.totalSum, values.initialSum, values.intervalSum, values.payPeriodMultiplier, values.payPeriod)
			console.log('payArr:', payArr)

			if (!payArr) {
				docPropsTokens.push(["%БЛОКОПЛАТЫ%", 'недостаточно данных для расчета'])
				return docPropsTokens
			}
			let payArrExt = payArr.map((element, index) => {
				if (index === 0) {
					return `- ${element[0]} (${deleteRub(rubles(element[0]))}) рублей - для внесения на депозит АС РК вознаграждения арбитражному управляющему - до ${element[1]} года;`
				}
				if (index !== 0) {return ` - ${element[0]} (${deleteRub(rubles(element[0]))}) рублей - не позднее ${element[1]} года;`}
			})
			payArrExt.unshift(`сумму в размере ${values.totalSum} (${deleteRub(rubles(values.totalSum))}) рублей в следующем порядке:`)
			payArrExt.push(`Заказчик вправе досрочно исполнить свои обязательства по оплате предоставляемых по настоящему договору услуг.`)
			paymentBlock = payArrExt.join('<br/>')	
		}

		else if (values.payVariant === 'после решения') {
			const nextDate = dayjs().add(parseInt(values.payPeriodMultiplier), values.payPeriod)
			.format("DD.MM.YYYY")
			.toString()
			paymentBlock = [`сумму в размере ${values.totalSum} (${deleteRub(rubles(values.totalSum))}) рублей не позднее ${nextDate} после получения решения суда.`] 
			paymentBlock.push(`Заказчик вправе досрочно исполнить свои обязательства по оплате предоставляемых по настоящему договору услуг.`)
			paymentBlock = paymentBlock.join('<br/>')
		}

		paymentBlock && docPropsTokens.push(["%БЛОКОПЛАТЫ%", paymentBlock])

		return docPropsTokens
	}

{/* 
'при подписании'
сумму в размере %ДОГОВОРСУММА% (%ДОГОВОРСУММАПРОПИСЬ%) рублей при подписании Договора.

'не позднее даты'
сумму в размере %ДОГОВОРСУММА% (%ДОГОВОРСУММАПРОПИСЬ%) рублей не позднее %ДАТАОПЛАТЫ%.
Заказчик вправе досрочно исполнить свои обязательства по оплате предоставляемых по настоящему договору услуг.

'график платежей'
сумму в размере %ДОГОВОРСУММА% (%ДОГОВОРСУММАПРОПИСЬ%) рублей в следующем порядке:
- 25 000 (двадцать пять тысяч) рублей - для внесения на депозит АС РК вознаграждения арбитражному управляющему - до 31.08.2022 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 30.09.2022 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 31.10.2022 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 30.11.2022 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 31.12.2022 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 31.01.2023 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 28.02.2023 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 31.03.2023 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 30.04.2023 года;
- 10 000 (десять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 31.05.2023 года;
- 5 000 (пять тысяч) рублей - в оплату услуг по настоящему договору - не позднее 30.06.2023 года.
Заказчик вправе досрочно исполнить свои обязательства по оплате предоставляемых по настоящему договору услуг.

'после решения'
сумму в размере %ДОГОВОРСУММА% (%ДОГОВОРСУММАПРОПИСЬ%) рублей не позднее %МЕСЯЦЕВ% после получения решения суда.
Заказчик вправе досрочно исполнить свои обязательства по оплате предоставляемых по настоящему договору услуг.
*/}

	async function handleChange() {

		setDocProps(getValues());
		// setTokens(createTokens({ ...person, ...getValues() }));
		const extraTokens =  addDocPropsTokens(getValues())
		setTokens([...createTokens(person)].concat([...addDocPropsTokens(getValues())]));
		// setTokens([...tokens].concat([...extraTokens]));
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

	return (
		<>
			<div className="component">
				<form>
					{/* <form onSubmit={handleSubmit(onSubmit)}> */}
					<hr className="mb-4" />
					<h3>Данные заявления</h3>
					<fieldset>
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

						</div>
						<div className="row">
							{/* Дата оплаты*/}
							{watch("payVariant") === "не позднее" &&
							<div className="col-md-2 mb-3">
								<label htmlFor="agreement-date">
									Дата оплаты
								</label>
								<input
									type="date"
									className="form-control"
									id="datePayment"
									placeholder="1960-02-29"
									{...register("datePayment", {
										// value: docProps.date,
										onChange: () => handleChange(),
										required: true,
									})}
								/>
								{errors.datePayment && (
									<span className="required-field">
										Обязательное поле
									</span>
								)}
							</div>}
							{/* Schedule data */}
							{/* totalSum = 120000, initialSum = 25000, intervalSum = 8000, payPeriod = 'month' */}
							{(watch("payVariant") === "график платежей" || watch("payVariant") === "после решения") && (
								<>
									{/* Первый платеж */}
									{watch("payVariant") === "график платежей" && <div className="col-md-2 mb-3">
										<label htmlFor="initialSum">
											Первый платеж
										</label>
										<input
											type="number"
											className="form-control"
											id="initialSum"
											{...register("initialSum", {
												// value: docProps.initialSum,
												onChange: () => handleChange(),
												required: true,
											})}
										/>
										{errors.initialSum && (
											<span className="required-field">
												Обязательное поле
											</span>
										)}
									</div>}
									{/* Последующие платежи */}
									{watch("payVariant") === "график платежей" && 
									<div className="col-md-2 mb-3">
										<label htmlFor="intervalSum">
											Последующие платежи
										</label>
										<input
											type="number"
											className="form-control"
											id="intervalSum"
											{...register("intervalSum", {
												// value: docProps.intervalSum,
												onChange: () => handleChange(),
												required: true,
											})}
										/>
										{errors.intervalSum && (
											<span className="required-field">
												Обязательное поле
											</span>
										)}
									</div>}
									{/* Периодичность */}

									<div className="col-md-3 mb-3">
										<label htmlFor="payPeriod">
											{watch("payVariant") === 'график платежей' ? 'Периодичность платежей' : 'Через'}
										</label>
										<div
											style={{
												display: "inline-flex",
											}}
										>
											<div className="col-md-4 mb-3">
												{/* Множитель периода */}
												<input
													type="number"
													className="form-control"
													id="payPeriodMultiplier"
													placeholder="1, 2, 3..."
													{...register(
														"payPeriodMultiplier",
														{
															// value: docProps
															// 	.agreement
															// 	.payPeriodMultiplier,
															onChange: () =>
																handleChange(),
															required: true,
														}
													)}
												/>
											</div>
											<div className="col-md-8 mb-3">
												<Controller
													name="payPeriod"
													control={control}
													render={({
														field: {
															onChange,
															value,
														},
													}) => (
														<select
															id="payPeriod"
															className="form-select"
															{...register(
																"payPeriod",
																{
																	// value: docProps
																	// 	.agreement
																	// 	.payPeriodMultiplier,
																	onChange:
																		() =>
																			handleChange(),
																	required: true,
																}
															)}
														>
															<option value="week">
																неделя
															</option>
															<option value="month">
																месяц
															</option>
														</select>
													)}
												/>
											</div>
										</div>
									</div>
								</>
							)}
						</div>
						<div className="row">
							{/* Сумма */}
							<div className="col-md-2 mb-3">
								<label htmlFor="totalSum">Сумма</label>
								<input
									type="number"
									className="form-control"
									id="totalSum"
									{...register("totalSum", {
										// value: docProps.totalSum,
										onChange: () => handleChange(),
									})}
								/>
								{errors.totalSum && (
									<span className="required-field">
										Обязательное поле
									</span>
								)}
							</div>
							{/* Дата создания*/}
							<div className="col-md-2 mb-3">
								<label htmlFor="agreement-date">
									Дата создания
								</label>
								<input
									type="date"
									className="form-control"
									id="date"
									placeholder="1960-02-29"
									{...register("date", {
										// value: docProps.date,
										onChange: () => handleChange(),
										required: true,
									})}
								/>
								{errors.date && (
									<span className="required-field">
										Обязательное поле
									</span>
								)}
							</div>
							{/* Номер договора */}
							<div className="col-md-2 mb-3">
								<label htmlFor="agreement-number">
									Номер договора
								</label>
								<input
									type="text"
									className="form-control"
									id="number"
									placeholder="1"
									list="freeNumbers"
									{...register("number", {
										// value: docProps.number,
										onChange: () => handleChange(),
										required: true,
									})}
								/>
								{/* <span>
									{unusedNumbersState.map((item) => {
										return <span key={item}>{item}</span>
									})}
								</span> */}
								<datalist id="freeNumbers">
									{unusedNumbersState.map((item) => {
										return <option key={item} value={item} />
									})}
								</datalist>
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
