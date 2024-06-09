import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import InputMask from 'react-input-mask'
import {
	captureActionCreator,
	removeActionCreator,
	addressPhoneUpdateActionCreator,
	birthPassportUpdateActionCreator,
} from "../store/personReducer";
import { removeCaseActionCreator } from "../store/caseReducer";
import axios from "axios";
import { CheckBeforeCreate } from "../components/CheckBeforeCreate";
import { getDataByIdFromURL } from "../functions";
import dayjs from "dayjs";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function PersonCard() {
	const emptyPerson = {
		lastName: "",
		firstName: "",
		middleName: "",
		gender: "муж",
		innNumber: "",
		snilsNumber: "",
		birthDate: "",
		birthPlace: "",
		passportSerie: "",
		passportNumber: "",
		passportDate: "",
		passportPlace: "",
		passportCode: "",
		address: [],
		phone: [],
		email: "",
		comment: ""
	}
	const emptyAddress = {
		description: "", // регистрации, проживания, почтовый etc
		index: "",
		subject: "",
		district: "",
		city: "",
		settlement: "",
		street: "",
		building: "",
		corp: "",
		appartment: "",
	}
	const emptyPhone = {
		description: "", // основной, дополнительный, рабочий etc
		number: "",
	}
	
	useEffect(() => {
		async function getData() {
			const data = await getDataByIdFromURL("persons") || emptyPerson; // TODO calling now even if there no id (create instead)
			console.log("useEffect data: ", data);
			personCaseTrigger(data);
			data.birthDate = dayjs(data.birthDate).format("YYYY-MM-DD");
			data.passportDate = dayjs(data.passportDate).format("YYYY-MM-DD");
			reset(data)
		}
		getData();
	}, []);

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const personRedux = useSelector((state) => state.personReducer.person);
	
	const [person, setPerson] = useState(personRedux)

	console.log('personRedux', personRedux);

	const {
		register,
		handleSubmit,
		watch,
		control,
		reset,
		getValues,
		setValue,
		formState: { errors, isDirty, isValid },
	} = useForm({
		defaultValues: personRedux,
		mode: 'onBlur'
	});


	const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
		control,
		name: "address",
	  });
	  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
		control,
		name: "phone",
	  });

	const searchData = {
		lastName: watch('lastName'),
		firstName: watch('firstName'),
		middleName: watch('middleName'),
		innNumber: watch('innNumber'),
	};

	function personCaseTrigger(data) {
		console.log(data._id !== personRedux._id);
		if (data._id !== personRedux._id) {
			dispatch(captureActionCreator(data));
			dispatch(removeCaseActionCreator());
		} else {
			dispatch(captureActionCreator(data));
		}
	}

	function guessGender() {
		console.log(getValues('middleName'))
		if (getValues('middleName').slice(-1) === 'а') {
			setValue('gender', 'жен')
		} else {
			setValue('gender', 'муж')
		}
	}

	const onChange = (e, index) => {
		const stateClone = structuredClone(personRedux);
		const { id, value } = e.target;
		if (id.includes("-")) {
			const [parentKey, childKey] = id.split("-");
			objectToInsert = {
				...stateClone[parentKey][index],
				[childKey]: value,
			};
			stateClone[parentKey][index] = objectToInsert;
			setPerson(stateClone);
		} else {
			stateClone[id] = value;
			setPerson(stateClone);
		}
		if (id === "middleName") {
			if (value.slice(-1) === "а") {
				stateClone.gender = "жен";
				setPerson(stateClone);
			} else {
				stateClone.gender = "муж";
				setPerson(stateClone);
			}
		}
	};

	async function createPerson(data) {
		// TODO add check and modify within DB
		// TODO correction(e)
		console.log(data);
		try {
			await axios
				.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/write`, data) // TODO
				.then((item) => {
					console.log('item: ', item);
					navigate(`/persons/id${item.data._id}`);
					personCaseTrigger(item.data);
					alert(`Клиент ${item.data.lastName} ${item.data.firstName[0]}. ${item.data.middleName[0]}. создан в БД`);
					// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
				});
		} catch (error) {
			console.error(error);
		}
	}

	function onSubmit(data) {
		console.log("onSubmit data", data);
		createPerson(data)
	}

	function deletePerson(e) {
		e.preventDefault();
		const reallyDelete = confirm(
			`Действительно удалить клиента из БД?`
		);
		if (reallyDelete) {
			axios
				.post(
					`${SERVER_IP}:${SERVER_PORT}/api/persons/delete/id${personRedux._id}`
				)
				.then((data) => {
					alert(`Клиент удален из БД`);
					// this.props.history.push(`/persons/create`); // TODO
					dispatch(removeActionCreator());
				});
			navigate(`/person`);
			reset(emptyPerson)
		}
	}

	function correction(e) {
		e.preventDefault();
		const obj = structuredClone(personRedux);
		for (const id in obj) {
			if (typeof obj[id] === "string") {
				// firstLetterCapitalize
				if (
					id === "lastName" ||
					id === "firstName" ||
					id === "middleName"
				) {
					obj[id] =
						obj[id].charAt(0).toUpperCase() + obj[id].slice(1);
				}
				// trim
				obj[id] = obj[id].trim();
			}
		}
		personCaseTrigger(obj);
	}

	function receiveFromChild(obj) {
		personCaseTrigger(obj);
		obj.birthDate = dayjs(obj.birthDate).format("YYYY-MM-DD");
		obj.passportDate = dayjs(obj.passportDate).format("YYYY-MM-DD");
		reset(obj)
	}

	return (
		<div className="component">
			<form onSubmit={handleSubmit(onSubmit)}>
				<hr className="mb-4" />
				{/* ФИО */}
				<fieldset>
					<legend className="bg-light">ФИО</legend>
					<div className="row">
						{/* Фамилия */}
						<div className="col-md-4 mb-3">
							<label htmlFor="lastName">Фамилия</label>
							<input
								type="text"
								className="form-control"
								id="lastName"
								placeholder="Иванов"
								{...register("lastName", { required: true })}
							/>
							{errors.lastName && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Имя */}
						<div className="col-md-3 mb-1">
							<label htmlFor="firstName">Имя</label>
							<input
								type="text"
								className="form-control"
								id="firstName"
								placeholder="Иван"
								{...register("firstName", { required: true })}
							/>
							{errors.firstName && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
						{/* Отчество */}
						<div className="col-md-4 mb-3">
							<label htmlFor="middleName">Отчество</label>
							<input
								type="text"
								className="form-control"
								id="middleName"
								placeholder="Иванович"
								{...register("middleName", {
									onChange: () => guessGender(),
								})}
							/>
						</div>
						{/* Пол */}
						<div className="col-md-1 mb-3">
							<label htmlFor="gender">Пол</label>
							<Controller
								name="gender"
								control={control}
								render={({ field: { onChange, value } }) => (
									<select
										id="gender"
										className="form-select"
										value={value}
										onChange={onChange}
									>
										<option value="муж">муж</option>
										<option value="жен">жен</option>
									</select>
								)}
							/>
						</div>
					</div>
				</fieldset>
				{/* ПАСПОРТ */}
				<fieldset>
					<legend className="bg-light">ПАСПОРТ</legend>
					<div className="row">
						{/* Серия паспорта*/}
						<div className="col-md-1 mb-3">
							<label htmlFor="passport-serie">Серия</label>
							<InputMask
								className="form-control"
								id="passportSerie"
								placeholder="8700"
								mask="9999"
								{...register("passportSerie", { maxLength: {value: 4, message: "Максимум 4 цифры" }})}
							/>
						</div>
						{/* Номер паспорта */}
						<div className="col-md-2 mb-3">
							<label htmlFor="passport-number">Номер</label>
							<InputMask
								className="form-control"
								id="passportNumber"
								placeholder="123456"
								mask="999999"
								{...register("passportNumber")}
							/>
						</div>
						{/* Дата Рождения */}
						<div className="col-md-2 mb-3">
							<label htmlFor="birth-date">Дата рождения</label>
							<input
								type="date"
								className="form-control"
								id="birthDate"
								{...register("birthDate", {
									onChange: (e) => {
										onChange;
									},
								})}
							/>
						</div>
						{/* Место рождения */}
						<div className="col-md-6 mb-3">
							<label htmlFor="birth-place">Место рождения</label>
							<input
								type="text"
								className="form-control"
								id="birthPlace"
								placeholder="пп Москва - Воркута, вагон 5, место 23"
								{...register("birthPlace")}
							/>
						</div>
						{/* Дата выдачи паспорта */}
						<div className="col-md-2 mb-3">
							<label htmlFor="passport-date">Дата выдачи</label>
							<input
								type="date"
								className="form-control"
								id="passportDate"
								{...register("passportDate")}
							/>
						</div>
						{/* Место выдачи паспорта */}
						<div className="col-md-4 mb-3">
							<label htmlFor="passport-place">Место выдачи</label>
							<input
								type="text"
								className="form-control"
								id="passportPlace"
								placeholder="ОВД РСФСР при МВД СССР по Коми АСССР в г. Воркуте "
								{...register("passportPlace")}
							/>
						</div>
						{/* Код подразделения */}
						<div className="col-md-2 mb-3">
							<label htmlFor="passport-code">
								Код подразделения
							</label>
							<InputMask
								className="form-control"
								id="passportCode"
								placeholder="110-003"
								mask="999-999"
								{...register("passportCode")}
							/>
						</div>
					</div>
				</fieldset>
				{/* ИНН, СНИЛС */}
				<fieldset>
					<legend className="bg-light">ИНН, СНИЛС</legend>
					<div className="row">
						{/* ИНН Номер */}
						<div className="col-md-2 mb-3">
							<label htmlFor="innNumber">ИНН</label>
							<InputMask
								className="form-control"
								id="innNumber"
								placeholder="110300400500"
								mask="999999999999"
								{...register("innNumber")}
							/>
						</div>
						{/* СНИЛС Номер */}
						<div className="col-md-2 mb-3">
							<label htmlFor="snilsNumber">СНИЛС</label>
							<InputMask
								className="form-control"
								id="snilsNumber"
								placeholder="111-222-333 44"
								mask="999-999-999 99"
								{...register("snilsNumber")}
							/>
						</div>
					</div>
				</fieldset>
				{/* АДРЕСА */}
				<fieldset>
					<legend className="bg-light">АДРЕСА</legend>
					{addressFields.map((field, index) => {
						return (
							<div className="row" key={field.id}>
								<div className="col-md-2 mb-3">
									<label htmlFor="address-type">
										Тип адреса
									</label>
									{/* description */}
									<input
										type="text"
										id="address-type"
										className="form-control"
										list="descriptionList"
										{...register(`address.${index}.type`, {
											onChange: (e) => {
												onChange(e, index);
											},
										})}
										placeholder="Тип"
									/>
									<datalist id="descriptionList">
										<option value="регистрации" />
										<option value="проживания" />
										<option value="рабочий" />
									</datalist>
								</div>
								{/* Индекс */}
								<div className="col-md-2 mb-3">
									<label htmlFor="address-index">
										Индекс
									</label>
									{/* index */}
									<InputMask
										id="address-index"
										className="form-control"
										mask="999999"
										{...register(`address.${index}.index`, {
											onChange: (e) => {
												onChange(e, index);
											},
										})}
										placeholder="169900"
									/>
								</div>
								{/* Субъект */}
								<div className="col-md-2 mb-3">
									<label htmlFor="address-subject">
										Субъект
									</label>
									{/* subject */}
									<input
										type="text"
										id="address-subject"
										className="form-control"
										{...register(`address.${index}.subject`, {
											onChange: (e) => {
												onChange(e, index);
											},
										})}
										placeholder="Край, область, округ..."
									/>
								</div>
								{/* Район */}
								<div className="col-md-2 mb-3">
									<label htmlFor="address-district">
									Район
									</label>
									{/* district */}
									<input
										type="text"
										id="address-district"
										className="form-control"
										{...register(`address.${index}.district`, {
											onChange: (e) => {
												onChange(e, index);
											},
										})}
										placeholder="Район"
									/>
								</div>
								{/* Город */}
								<div className="col-md-2 mb-3">
									<label htmlFor="address-city">Город</label>
									{/* city */}
									<input
										type="text"
										id="address-city"
										className="form-control"
										{...register(`address.${index}.city`, {
											onChange: (e) => {
												onChange(e, index);
											},
										})}
										placeholder="г. Воркута"
									/>
								</div>
								{/* Населенный пункт */}
								<div className="col-md-2 mb-3">
									<label htmlFor="address-settlement">
										Населенный пункт
									</label>
									{/* settlement */}
									<input
										type="text"
										id="address-settlement"
										className="form-control"
										{...register(
											`address.${index}.settlement`,
											{
												onChange: (e) => {
													onChange(e, index);
												},
											}
										)}
										placeholder="пос. Цементнозаводский"
									/>
								</div>
								{/* Улица */}
								<div className="col-md-3 mb-3">
									<label htmlFor="address-street">
										Улица
									</label>
									{/* street */}
									<input
										type="text"
										id="address-street"
										className="form-control"
										{...register(
											`address.${index}.street`,
											{
												onChange: (e) => {
													onChange(e, index);
												},
											}
										)}
										placeholder="ул. Ватутина"
									/>
								</div>
								{/* Дом */}
								<div className="col-md-1 mb-3">
									<label htmlFor="address-building">
										Здание
									</label>
									{/* building */}
									<input
										type="text"
										id="address-building"
										className="form-control"
										{...register(
											`address.${index}.building`,
											{
												onChange: (e) => {
													onChange(e, index);
												},
											}
										)}
										placeholder="д. 3"
									/>
								</div>
								{/* Корпус */}
								<div className="col-md-1 mb-3">
									<label htmlFor="address-corp">
										Корпус
									</label>
									{/* building */}
									<input
										type="text"
										id="address-corp"
										className="form-control"
										{...register(
											`address.${index}.corp`,
											{
												onChange: (e) => {
													onChange(e, index);
												},
											}
										)}
										placeholder="корп. 3"
									/>
								</div>
								{/* Квартира */}
								<div className="col-md-1 mb-3">
									<label htmlFor="address-appartment">
										Квартира
									</label>
									{/* appartment */}
									<input
										type="text"
										id="address-appartment"
										className="form-control"
										{...register(
											`address.${index}.appartment`,
											{
												onChange: (e) => {
													onChange(e, index);
												},
											}
										)}
										placeholder="кв. 37"
									/>
								</div>
								<div className="col-md-1 mb-3">
									<button
										type="button"
										className="btn btn-outline-danger btn-sm btn-block"
										id="address"
										onClick={() => removeAddress(index)}
									>
										удалить
									</button>
								</div>
							</div>
						);
					})}
					<button
						type="button"
						className="btn btn-light btn-md btn-block"
						id="address"
						onClick={() =>
							appendAddress(emptyAddress)
						}
					>
						добавить адрес
					</button>
				</fieldset>
				{/* ТЕЛЕФОНЫ */}
				<fieldset>
					<legend className="bg-light">ТЕЛЕФОНЫ</legend>
					{phoneFields.map((field, index) => {
						return (
							<div className="row" key={field.id}>
								{/* Телефон*/}
								<div className="col-md-2 mb-3">
									<InputMask
										mask="9 (999) 999-99-99"
										// type="tel"
										id="phone-number"
										className="form-control"
										{...register(`phone.${index}.number`)}
										placeholder="Номер"
									/>
								</div>
								<div className="col-md-2 mb-3">
									<input
										type="text"
										id="phone-description"
										className="form-control"
										list="phoneList"
										{...register(
											`phone.${index}.description`,
											{
												onChange: (e) => {
													onChange(e, index);
												},
											}
										)}
										placeholder="Тип"
									/>
									<datalist id="phoneList">
										<option value="основной" />
										<option value="дополнительный" />
										<option value="рабочий" />
									</datalist>
								</div>
								<div className="col-md-1 mb-3">
									<button
										type="button"
										className="btn btn-outline-danger btn-sm btn-block"
										id="phone"
										onClick={() => removePhone(index)}
									>
										удалить
									</button>
								</div>
							</div>
						);
					})}
					<button
						type="button"
						className="btn btn-light btn-md btn-block"
						id="phone"
						onClick={() =>
							appendPhone(emptyPhone)
						}
					>
						добавить телефон
					</button>
				</fieldset>
				{/* ОСТАЛЬНОЕ */}
				<fieldset>
					<legend className="bg-light">ОСТАЛЬНОЕ</legend>
					{/* Электронная почта */}
					<div className="row">
						<div className="col-md-2 mb-3">
							<label htmlFor="email">
								Электропочта
								{/* <span className="text-muted">
									{" "}
									(необязательно)
								</span> */}
							</label>
							<input
								type="text"
								className="form-control"
								id="email"
								placeholder="you@example.com"
								{...register('email')}
							/ >
						</div>

						{/* Комментарий */}
						<div className="col-md-10 mb-3">
							<label htmlFor="comment">Комментарий</label>
							<input
								type="text"
								className="form-control"
								id="comment"
								placeholder="какой-то текст...."
								{...register('comment')}
							/>
						</div>
					</div>
				</fieldset>
				{/* КНОПКИ */}
				<div className="footer-buttons">
					{/*  */}
					<button
						className="btn btn-success btn-md btn-block"
						type="submit"
						disabled={!isDirty || !isValid}
					>
						OK
					</button>
					{/*  */}
					{!personRedux._id && (
						<button
							className="btn btn-warning btn-md btn-block"
							onClick={() => {reset(personRedux)}}
							disabled={!isValid}
						>
							Очистить
						</button>
					)}
					{/*  */}
					{personRedux._id && (
						<button
							className="btn btn-warning btn-md btn-block"
							onClick={() => {
								personRedux._id ?
								reset(personRedux) :
								reset(emptyPerson)
							}}
							disabled={!isDirty}
						>
							Отменить изменения
						</button>
					)}
					{/*  */}
					{personRedux._id && (
						<button
							className="btn btn-danger btn-md btn-block"
							onClick={deletePerson}
						>
							Удалить из БД
						</button>
					)}
				</div>
			</form>
			<CheckBeforeCreate
				receiveFromChild={receiveFromChild}
				whatToSearch={searchData}
			/>
		</div>
	);
}

export { PersonCard };
