import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
require("dotenv").config();
import { getDataByIdFromURL } from "../functions";
import dayjs from "dayjs";
import {
	addCaseActionCreator,
	removeCaseActionCreator,
} from "../store/caseReducer";
import { getCurrentYearNumbers, getUnusedNumbers } from '../functions';
import { AgreementCaseProps } from "./caseProps/agreementCaseProps";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function CaseComponent() {
	/* 
	HOWTO create new doc data in case (caseProps)
	1. copy and rename one of the components in caseProps directory
	2. import it here
	3. place it in <div className="case-props-switchers"> in appropriate case category
	4. in caseProps component edit the handleChange() to send props in appropriate object
	5. edit form (inputs, switchers etc...)
	6. the end(?)
	*/
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const location = useLocation();

	const person = useSelector((state) => state.personReducer.person);
	const caseRedux = useSelector((state) => state.caseReducer);
	
	const initialCaseProps = {
		petition: { // for example
			date: "12-02-2023",
			otvetchik: "Ivanoff A.O.",
		},
		agreement: {
			totalSum: 0,
			agreementDate: dayjs().format("YYYY-MM-DD"),
			payVariant: "в начале",
			// 	initialSum: Number,
			// 	intervalSum: Number,
			// 	payPeriod: String,
			//  payPeriodMultiplier: Number,
		},
	};
	
	console.log('caseRedux.caseProps: ', caseRedux.caseProps)
	const [caseProps, setCaseProps] = useState(caseRedux.caseProps || initialCaseProps);
	/* 
	1. think about agreementCaseProps structure
	
	
	*/
	
	
	async function getData(e) {
		const data = (await getDataByIdFromURL("cases")) || emptyCase; // TODO calling now even if there no id (create instead)
		console.log("useEffect data: ", data);
		dispatch(removeCaseActionCreator())
		dispatch(addCaseActionCreator(data)) 
		data.caseDate = dayjs(data.caseDate).format("YYYY-MM-DD");
		reset(data);
	}
	
	useEffect(() => {
		getData();
	}, []);

	// get all keys from caseProps to an array to highlight components with content
	console.log(caseRedux)
	const casePropsKeys = Object.keys(caseRedux.caseProps || []);
	// LAST STOP 
	// caseProps. what is it? recomended values or object for generate docs
	// for example, agreement number where it must be specified? in caseProps or in docProps?
	// DESICION
	// remove caseProps
	// divide TempAnyDoc2 to editor and form. move caseProps to docProps or kind of. 
	// so related docs will look for props in each other
	console.log(casePropsKeys)
	
	const emptyCase = {
		// _id: "",
		caseTitle: "",
		caseDate: dayjs().format("YYYY-MM-DD"),
		caseCategory: "",
		caseReceivedDocs: [],
		caseFlow: [],
		caseReminder: [],
		comment: "",
		// idPerson: person._id,
	};
	const emptyDocs = {
		title: "",
		have: false,
	};
	const emptyFlow = {
		phase: "",
		date: dayjs().format("YYYY-MM-DD"),
		comment: "",
	};
	const emptyReminder = {
		title: "",
		date: dayjs().format("YYYY-MM-DD"),
		active: false,
		comment: "",
	};

	const {
		register,
		handleSubmit,
		watch,
		control,
		reset,
		formState: { errors, isDirty, isValid },
	} = useForm({
		defaultValues: emptyCase,
		mode: "onBlur",
	});

	const {
		fields: caseReceivedDocsFields,
		append: appendCaseReceivedDocs,
		remove: removeCaseReceivedDocs,
	} = useFieldArray({
		control,
		name: "caseReceivedDocs",
	});
	const {
		fields: caseFlowFields,
		append: appendCaseFlow,
		remove: removeCaseFlow,
	} = useFieldArray({
		control,
		name: "caseFlow",
	});
	const {
		fields: caseReminderFields,
		append: appendCaseReminder,
		remove: removeCaseReminder,
	} = useFieldArray({
		control,
		name: "caseReminder",
	});

	const getChildCaseProps = (data) => {
		const casePropsClone = structuredClone(caseProps);
		setCaseProps(Object.assign(casePropsClone, data));
	};

	const saveCase = async (data) => {
		const whatToFind = {
			idPerson: person._id,
			caseTitle: watch("caseTitle"),
		};
		const check = await axios.post(
			`${SERVER_IP}:${SERVER_PORT}/api/cases/search`,
			whatToFind
		);
		if (check.data.length) {
			const message = `У ${person.lastName} ${person.firstName[0]}. ${
				person.middleName[0]
			}. уже есть ${watch("caseTitle")}. Сохранить изменения?`;
			if (!confirm(message)) {
				return;
			}
			// alert(message);
			// return;
		}

		data.idPerson = person._id;

		// TODO send to redux but doesn't load case after clicking

		const result = await axios.post(
			`${SERVER_IP}:${SERVER_PORT}/api/cases/write`,
			data
		);
		// dispatch(removeCaseActionCreator());
		dispatch(addCaseActionCreator(result.data));
		console.log('dispatched case data:', result.data)
		navigate(`/cases/id${result.data._id}`);
		// const dataFromURL = getDataByIdFromURL("cases");
		alert(`Данные ${result.data.caseTitle} записаны в БД`);
		// data._id = item.data._id;
		// console.log(dataFromURL._id);
		// dispatch(captureActionCreator(data));
		// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
	};

	const deleteCase = (e) => {
		e.preventDefault();
		const reallyDelete = confirm(`Действительно удалить это дело из БД?`);
		if (reallyDelete) {
			alert(`Sorry. We can't delete cases yet.`);
			// axios
			// 	.post(
			// 		`${SERVER_IP}:${SERVER_PORT}/api/cases/delete/id${caseData._id}`
			// 	)
			// 	.then((data) => {
			// 		alert(`Дело ${data._id} удалено из БД`);
			// 		// this.props.history.push(`/persons/create`); // TODO
			// 	});
			// navigate(`/cases`);
		}
	};

	function onSubmit(data) {
		const dataClone = data;
		dataClone.caseProps = caseProps;
		console.log("onSubmit data", dataClone);
		saveCase(data);
	}

	return (
		<div className="component">
			<form onSubmit={handleSubmit(onSubmit)}>
				<hr className="mb-4" />
				<fieldset>
					<legend className="bg-light">Основное</legend>
					<div className="row">
						{/* Название дела */}
						<div className="col-md-6 mb-3">
							<label htmlFor="birth-place">Название дела</label>
							<input
								type="text"
								className="form-control"
								id="caseTitle"
								placeholder="0123 Дело о недополученных миллионах"
								{...register("caseTitle", {
									required: true,
								})}
							/>
							{errors.caseTitle && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						<div className="col-md-3 mb-3">
							<label htmlFor="birth-place">Категория дела</label>
							<input
								type="text"
								className="form-control"
								id="caseCategory"
								placeholder="банкротство"
								{...register("caseCategory")}
							/>
						</div>
						{/* Дата создания*/}
						<div className="col-md-2 mb-3">
							<label htmlFor="case-date">Дата создания</label>
							<input
								type="date"
								className="form-control"
								id="caseDate"
								placeholder="1960-02-29"
								onChange={(e) => onChange(e, "caseDate")}
								{...register("caseDate", {
									required: true,
								})}
							/>
							{errors.caseDate && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						<div className="col-md-10 mb-3">
							<label htmlFor="comment">Комментарий</label>
							<input
								type="text"
								className="form-control"
								id="comment"
								placeholder="какой-то текст"
								{...register("comment")}
							/>
						</div>
						{/* Case Received Docs */}
						<fieldset>
							<legend className="bg-light">
								Принятые документы
							</legend>
							{caseReceivedDocsFields.map((field, index) => (
								<div className="row" key={field.id}>
									<div className="col-md-4 mb-3">
										<label
											htmlFor={`receivedDocsTitle-${index}`}
										>
											Название документа
										</label>
										<input
											type="text"
											className="form-control"
											id={`receivedDocsTitle-${index}`}
											placeholder="Копии квитанций ЖКУ"
											{...register(
												`caseReceivedDocs.${index}.title`,
												{
													onChange: (e) => {
														onChange(e, index);
													},
												}
											)}
										/>
									</div>
									<div className="form-check col-md-1 mb-3">
										<label
											className="form-check-label"
											htmlFor={`receivedDocsHave-${index}`}
										>
											Наличие
										</label>
										<input
											className="form-check-input"
											type="checkbox"
											id={`receivedDocsHave-${index}`}
											{...register(
												`caseReceivedDocs.${index}.have`
											)}
										/>
									</div>

									<div className="col-md-1 mb-3">
										<button
											type="button"
											className="btn btn-outline-danger btn-sm"
											id="caseReceivedDocs"
											onClick={() =>
												removeCaseReceivedDocs(index)
											}
										>
											-
										</button>
									</div>
								</div>
							))}
							<button
								type="button"
								className="btn btn-success btn-sm"
								id="caseReceivedDocs"
								onClick={() =>
									appendCaseReceivedDocs(emptyDocs)
								}
							>
								Добавить
							</button>
						</fieldset>
					</div>
				</fieldset>
				{/* Case Flow */}
				<fieldset>
					<legend className="bg-light">Движение дела</legend>
					{caseFlowFields.map((field, index) => (
						<div className="row" key={field.id}>
							<div className="col-md-4 mb-3">
								<label htmlFor={`caseFlow-${index}`}>
									Этап
								</label>
								<input
									type="text"
									className="form-control"
									id={`caseFlow-${index}`}
									placeholder="Подготовка документов"
									{...register(`caseFlow.${index}.phase`)}
								/>
							</div>
							<div className="col-md-2 mb-3">
								<label htmlFor={`caseFlow-${index}`}>
									Дата
								</label>
								<input
									type="date"
									className="form-control"
									id={`caseFlow-${index}`}
									placeholder="2023-11-21"
									{...register(`caseFlow.${index}.date`)}
								/>
							</div>
							<div className="col-md-4 mb-3">
								<label htmlFor={`caseFlow-${index}`}>
									Комментарий
								</label>
								<input
									type="text"
									className="form-control"
									id={`caseFlow-${index}`}
									placeholder="Какой-то комментарий"
									{...register(`caseFlow.${index}.comment`)}
								/>
							</div>
							<div className="col-md-1 mb-3">
								{/* Delete button for caseFlow */}
								<button
									type="button"
									className="btn btn-outline-danger btn-sm"
									onClick={() => removeCaseFlow(index)}
								>
									-
								</button>
							</div>
						</div>
					))}
					<button
						type="button"
						className="btn btn-success btn-sm"
						onClick={() => appendCaseFlow(emptyFlow)}
					>
						Добавить
					</button>
				</fieldset>
				{/* Case Reminder */}
				<fieldset>
					<legend className="bg-light">Напоминание</legend>
					{caseReminderFields.map((field, index) => {
						return (
							<div className="row" key={field.id}>
								<div className="col-md-4 mb-3">
									<label htmlFor={`caseReminder-${index}`}>
										Название
									</label>
									<input
										type="text"
										className="form-control"
										id={`caseReminder-${index}`}
										placeholder="Подать документы"
										{...register(
											`caseReminder.${index}.title`
										)}
									/>
									{/* <span className="required-field">
										Обязательное поле
									</span> */}
									{/* // TODO leave or remove? */}
								</div>
								<div className="col-md-2 mb-3">
									<label htmlFor={`caseReminder-${index}`}>
										Дата
									</label>
									<input
										type="date"
										className="form-control"
										id={`caseReminder-${index}`}
										placeholder="2020-11-20"
										{...register(
											`caseReminder.${index}.date`
										)}
									/>
								</div>

								<div className="form-check col-md-1 mb-3">
									<label
										className="form-check-label"
										htmlFor={`caseReminderActive-${index}`}
									>
										Активно
									</label>
									<input
										className="form-check-input"
										type="checkbox"
										id={`caseReminderActive-${index}`}
										{...register(
											`caseReminder.${index}.active`
										)}
									/>
								</div>

								<div className="col-md-4 mb-3">
									<label htmlFor={`caseReminder-${index}`}>
										Комментарий
									</label>
									<input
										type="text"
										className="form-control"
										id={`caseReminder-${index}`}
										placeholder="Какой-то комментарий"
										{...register(
											`caseReminder.${index}.comment`
										)}
									/>
								</div>
								<div className="col-md-1 mb-3">
									<button
										type="button"
										className="btn btn-outline-danger btn-sm"
										onClick={() =>
											removeCaseReminder(index)
										}
									>
										-
									</button>
								</div>
							</div>
						);
					})}
					<button
						type="button"
						className="btn btn-success btn-sm"
						onClick={() => appendCaseReminder(emptyReminder)}
					>
						Добавить
					</button>
				</fieldset>
				{/* HERE WE LOAD BUTTONS AND COMPONENTS DEPENDING ON CATEGORY */}
				{/* HERE WILL BE LISTED ALL COMPONENTS */}
				{/* MB MOVE IT FURTHER TO DB*/}
				{location.pathname.startsWith("/cases/id") ? (
					<div className="case-props-switchers">
						{/* Договор */}
						{/*
						 TODO 
						 HERE MUST BE DEFINED ALL COMPONENTS
						 THAT MUST BE LOADED DEPENDING ON CASE CATEGORY
						*/}
						<AgreementCaseProps
							styleClass={
								casePropsKeys.includes("agreement")
									? "case-props-exist"
									: "case-props-no"
							}
							getChildCaseProps={getChildCaseProps}
							caseProps={caseProps}
						/>
					</div>
				) : (
					<div className="case-props-unavailable">
						Сохраните дело, чтобы добавить данные договора и другим
						документам этой категории
					</div>
				)}
				{/* КНОПКИ */}
				<div className="footer-buttons">
					{/*  */}
					<button
						className="btn btn-success btn-md btn-block"
						type="submit"
						// disabled={!isDirty || !isValid} TODO fix isDirty so editing caseProps setting isDirty to true
						disabled={!isValid}
					>
						OK
					</button>
					{/*  */}
					{/*
					TODO "вернуть исходные" doesn't work
					remove "Очистить"
					*/}
					{!caseRedux._id && (
						<button
							className="btn btn-success btn-md btn-block"
							onClick={() => reset(caseRedux)}
						>
							Очистить
						</button>
					)}
					{/*  */}
					{caseRedux._id && (
						<button
							className="btn btn-warning btn-md btn-block"
							onClick={(e) => getData(e)}
						>
							Вернуть исходные
						</button>
					)}
					{/*  */}
					<button
						className="btn btn-danger btn-md btn-block"
						onClick={deleteCase}
						disabled // TODO consider how it might work with existing docs in db
					>
						Удалить из БД
					</button>
				</div>
			</form>
		</div>
	);
}

export { CaseComponent };
