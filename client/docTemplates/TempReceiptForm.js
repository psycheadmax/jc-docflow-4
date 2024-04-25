import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import ReactDOM from "react-dom";
import TempReceiptGen from "./TempReceiptGen";
import {
	getDataByIdFromURL,
	deleteRub,
	getCurrentYearNumbers,
	getUnusedNumbers,
} from "../functions";
import isEqual from "lodash/isEqual";
import petrovich from "petrovich";
import axios from "axios";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
import { TempReceiptDoc } from "./TempReceiptDoc";
import "./TempReceiptForm.css";
import { useReactToPrint } from "react-to-print";
import {
	addDocActionCreator,
	removeDocActionCreator,
} from "../store/docReducer";
import { useNavigate, useLocation } from "react-router-dom";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

const rubles = require("rubles").rubles;
const dayjs = require("dayjs");

function TempReceiptForm() {
	const {
		register,
		handleSubmit,
		watch,
		getValues,
		setValue,
		control,
		reset,
		resetField,
		formState: { errors, isDirty, isValid },
	} = useForm({
		defaultValues: initialReceipt,
		mode: "onBlur",
	});
	const dispatch = useDispatch();
	const person = useSelector((state) => state.personReducer.person);
	const caseName = useSelector((state) => state.caseReducer);
	const doc = useSelector((state) => state.docReducer);

	const navigate = useNavigate();
	const location = useLocation();
	const [isExisting, _] = useState(location.pathname.startsWith("/docs/id"));

	const personForPetrovich = {
		first: person.firstName,
		middle: person.middleName,
		last: person.lastName,
	};

	const personGenitive = petrovich(personForPetrovich, "genitive");

	let nums = [];

	async function getPKONumbers() {
		const numbers = await getCurrentYearNumbers('ПКО');
		const unusedNumbers = getUnusedNumbers(numbers);
		return unusedNumbers;
	}
	async function fetchData() {
		const data = await getDataByIdFromURL("docs");
		console.log("data fetched in usEffect: ", data);
		if (data) {
			data.date = dayjs(data.date).format("YYYY-MM-DD");
			reset(data);
		}
	}

	useEffect(async () => {
		nums = await getPKONumbers();
		if (isExisting) {
			fetchData();
		} else {
			reset(initialReceipt);
		}
		setValue("number", nums[0]);
	}, []);

	let currentValues = getValues();

	useEffect(() => {
		currentValues = getValues();
	});

	const initialReceipt = {
		idPerson: person._id,
		idCase: caseName._id,
		type: "ПКО", // ПКО, Договор
		description: "",
		date: dayjs().format("YYYY-MM-DD"),
		number: "",
		sum: 1000,
		sumLetters: "одна тысяча",
		docProps: {
			lastNameGenitive: personGenitive.last,
			firstNameGenitive: personGenitive.first,
			middleNameGenitive: personGenitive.middle,
			reason: "оплата оставления искового заявления и представительства",
			attachment: `договор от ${dayjs().format("DD.MM.YYYY")} г.`,
			organization: 'ООО "Юридический центр"',
			mainAccountant: "Д.А. Пахмутов",
			cashier: "Д.А. Пахмутов",
		},
	};

	function onSumChange() {
		const result = deleteRub(rubles(getValues("sum")));
		setValue("sumLetters", result);
	}

	async function saveReceipt(data) {
		let resultMsg;
		if (!location.pathname.startsWith("/docs/id")) {
			// case 'new receipt'
			delete data._id;
			const freeNumbers = await getPKONumbers();
			// check PKOnumber bf create
			if (
				!freeNumbers.includes(parseInt(data.number)) &&
				!(data.number > freeNumbers[0])
			) {
				alert(
					`Кажется №${data.number} занят.\nПопробуйте еще раз с другим номером.\n(Обновлен автоматически)`
				);
				nums = await getPKONumbers();
				setValue("number", nums[0]);
				return;
			}
			resultMsg = `ПКО №${data.number} для ${person.lastName} ${person.firstName[0]} ${person.middleName[0]}\nна ${data.sum}руб. создан`;
		} else {
			// case 'update existing'
			resultMsg = `ПКО №${data.number} для ${person.lastName} ${person.firstName[0]} ${person.middleName[0]}\nна ${data.sum}руб. обновлен`;
		}
		await axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/docs/write`, data)
			.then((result) => {
				dispatch(addDocActionCreator(result.data));
				navigate(`/docs/id${result.data._id}`);
				alert(resultMsg);
				// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
			});
	}

	async function resetHandler(e) {
		e.preventDefault();
		if (isExisting) {
			fetchData();
		} else {
			reset(initialReceipt);
			const numsAgain = await getPKONumbers();
			setValue("number", numsAgain[0]);
		}
	}

	async function deleteReceipt(e) {
		e.preventDefault();
		if (!isExisting) {
			return;
		}
		const reallyDelete = confirm(
			`Действительно удалить ПКО №${doc.number} из БД?`
		);
		if (reallyDelete) {
			await axios
				.post(
					`${SERVER_IP}:${SERVER_PORT}/api/docs/delete/id${doc._id}`
				)
				.then((data) => {
					alert(`Документ удален из БД\n(_id${data._id})`);
					// this.props.history.push(`/persons/create`); // TODO
					dispatch(removeDocActionCreator());
				});
			navigate(`/docs`);
		}
	}

	const componentRef = useRef();

	const handlePrint = useReactToPrint({
		content: () => componentRef.current,
	});

	function handlePrintWrapper(e) {
		e.preventDefault();
		handlePrint();
	}

	function onSubmit(data) {
		console.log("data to submit", data);
		saveReceipt(data);
	}

	return (
		<div className="component">
			<div id="pdf"></div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<fieldset>
					<legend className="bg-light">
						ФИО в падеже (автоматически. измените если неправильно)
					</legend>
					<div className="row">
						{/* Фамилии */}
						<div className="col-md-4 mb-3">
							<label htmlFor="lastNameGenitive">Фамилии</label>
							<input
								type="text"
								className="form-control"
								id="docProps-lastNameGenitive"
								placeholder="Иванов"
								{...register("docProps.lastNameGenitive", {
									required: true,
								})}
							/>
							{errors.docProps?.lastNameGenitive && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Имени */}
						<div className="col-md-3 mb-3">
							<label htmlFor="firstNameGenitive">Имени</label>
							<input
								type="text"
								className="form-control"
								id="docProps-firstNameGenitive"
								placeholder="Иван"
								{...register("docProps.firstNameGenitive", {
									required: true,
								})}
							/>
							{errors.docProps?.firstNameGenitive && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Отчества */}
						<div className="col-md-4 mb-3">
							<label htmlFor="middleNameGenitive">Отчества</label>
							<input
								type="text"
								className="form-control"
								id="docProps-middleNameGenitive"
								placeholder="Иванович"
								{...register("docProps.middleNameGenitive")}
							/>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend className="bg-light">
						Номер ПКО, дата, сумма, основание
					</legend>
					<div className="row">
						<div className="col-md-2 mb-3">
							<label htmlFor="PKONumber">Номер ПКО</label>
							<input
								className="form-control"
								id="number"
								type="number"
								list="freePKONumbersList"
								{...register("number", { value: nums[0] })}
							/>
							<datalist id="freePKONumbersList">
								{nums.map((item) => (
									<option key={item} value={item} />
								))}
							</datalist>
						</div>

						{/* Дата */}
						<div className="col-md-2 mb-3">
							<label htmlFor="PKODate">Дата ПКО</label>
							<input
								type="date"
								className="form-control"
								id="date"
								placeholder="01.01.1970"
								{...register("date", { required: true })}
							/>
							{errors.lastName && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Сумма */}
						<div className="col-md-2 mb-3">
							<label htmlFor="sumNumber">Cумма</label>
							<input
								type="number"
								className="form-control"
								id="sum"
								min="1"
								placeholder="1"
								{...register(
									"sum",
									{ onChange: (e) => onSumChange(e) },
									{ required: true }
								)}
							/>
							{errors.sum && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Сумма прописью */}
						<div className="col-md-6 mb-3">
							<label htmlFor="sumLetters">
								Cумма прописью (только автоматически)
							</label>
							<input
								type="text"
								className="form-control"
								id="sumLetters"
								placeholder="один рубль 00 копеек"
								readOnly
								{...register("sumLetters", { required: true })}
							/>
							{errors.sumLetters && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Основание */}
						<div className="col-md-8 mb-3">
							<label htmlFor="reason">Основание</label>
							<input
								type="text"
								className="form-control"
								id="docProps-reason"
								placeholder="оплата составления искового заявления и представительства интересов в суде"
								{...register("docProps.reason", {
									required: true,
								})}
							/>
							{errors.docProps?.reason && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Приложение */}
						<div className="col-md-4 mb-3">
							<label htmlFor="docProps.attachment">
								Приложение
							</label>
							<input
								type="text"
								className="form-control"
								id="docProps-attachment"
								placeholder="договор от "
								{...register("docProps.attachment")}
							/>
						</div>
					</div>
					<div className="row">
						{/* Организация */}
						<div className="col-md-4 mb-3">
							<label htmlFor="organization">Организация</label>
							<input
								type="text"
								className="form-control"
								id="docProps-organization"
								placeholder='ООО "Юридический центр"'
								{...register("docProps.organization", {
									required: true,
								})}
							/>
							{errors.docProps?.organization && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Главный бухгалтер */}
						<div className="col-md-4 mb-1">
							<label htmlFor="mainAccountant">
								Главный бухгалтер
							</label>
							<input
								type="text"
								className="form-control"
								id="docProps-mainAccountant"
								placeholder="Д.А. Пахмутов"
								{...register("docProps.mainAccountant", {
									required: true,
								})}
							/>
							{errors.docProps?.mainAccountant && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Кассир */}
						<div className="col-md-4 mb-3">
							<label htmlFor="cashier">Кассир</label>
							<input
								type="text"
								className="form-control"
								id="docProps-cashier"
								placeholder="Д.А. Пахмутов"
								{...register("docProps.cashier", {
									required: true,
								})}
							/>
							{errors.docProps?.cashier && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
					</div>
				</fieldset>
				{/*  */}
				<div className="footer-buttons">
					{/*  */}
					<button
						className="btn btn-success btn-md btn-block"
						type="submit"
						// disabled={!isDirty || !isValid}
					>
						OK
					</button>
					<button
						className="btn btn-warning btn-md btn-block"
						onClick={(e) => resetHandler(e)}
					>
						Вернуть исходный
					</button>
					{/*  */}
					<button
						className="btn btn-danger btn-md btn-block"
						onClick={deleteReceipt}
					>
						Удалить
					</button>
					{/*  */}
					<button
						className="btn btn-primary btn-md btn-block"
						onClick={handlePrintWrapper}
					>
						Печать
					</button>
				</div>
				{/*  */}
				{/* <button className="btn btn-danger btn-md btn-block" onClick={generatePDF} >Удалить</button>
                &nbsp; */}
				{/*  */}
			</form>
			<div style={{ display: "none" }}>
				{(Object.keys(currentValues).length) ? (
					<TempReceiptDoc
						receiptData={currentValues}
						ref={componentRef}
					/>
				) : null}
			</div>
		</div>
	);
}

export { TempReceiptForm };
