import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import ReactInputDateMask from 'react-input-date-mask';
require("dotenv").config();

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function PersonCard() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [person, setPerson] = useState({
		lastName: "",
		firstName: "",
		middleName: "",
		gender: "",
		innNumber: "",
		snilsNumber: "",
		// birthDate: dayjs('2000-01-01').format('DD.MM.YYYY'),
		birthDate: "",
		birthPlace: "",
		passportSerie: "",
		passportNumber: "",
		passportDate: "",
		passportPlace: "",
		passportCode: "",
		address: [
			{
				description: "", // регистрации, проживания, почтовый etc
				index: "",
				subject: "",
				city: "",
				settlement: "",
				street: "",
				building: "",
				appartment: "",
			},
		],
		phone: [
			{
				description: "", // основной, дополнительный, рабочий etc
				number: "",
			},
		],
		email: "",
		comment: "",
		//   cases: [{
		//     idCase: { type: Schema.ObjectId, ref: 'cases' },
		// }]
	});
	const personRedux = useSelector((state) => state.personReducer.person);
	const [unmodified, setUnmodified] = useState(true);

	let personShortName = `${person.lastName} ${person.firstName[0]}. ${person.firstName[0]}.`;

	const personNames = {
		lastName: person.lastName,
		firstName: person.firstName,
		middleName: person.middleName,
	};

	console.log("person in state:", person);

	function personCaseTrigger(data) {
		console.log(data._id !== personRedux._id);
		if (data._id !== personRedux._id) {
			dispatch(captureActionCreator(data));
			dispatch(removeCaseActionCreator());
		} else {
			dispatch(captureActionCreator(data));
		}
	}

	useEffect(() => {
		async function getData() {
			const data = await getDataByIdFromURL("persons"); // TODO calling now even if there no id (create instead)
			console.log("useEffect data: ", data);
			personCaseTrigger(data);
			setPerson(data);
		}
		getData();
	}, []);
	
	const onChange = (e, index) => {
		const stateClone = structuredClone(person);
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
		setUnmodified(false);

	};

	function addAddressPhone(e) {
		e.preventDefault();
		const stateClone = structuredClone(person);
		const { id } = e.target;
		if (id === "phone") {
			stateClone[id].push({
				description: "",
				number: "",
			});
		} else {
			stateClone[id].push({
				description: "",
				subject: "",
				city: "",
				settlement: "",
				street: "",
				building: "",
				appartment: "",
			});
		}
		setPerson(stateClone);
	}

	function removeAddressPhone(e, index) {
		e.preventDefault();
		const { id } = e.target;
		const stateClone = structuredClone(person);
		stateClone[id].splice(index, 1);
		setPerson(stateClone);
	}

	function revert(e) {
		e.preventDefault();
		setPerson(personRedux);
		// getPersonIdFromURL()
		// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
		// TODO personCaseTrigger({...personClone}))
	}

	async function createPerson(e) {
		// TODO add check and modify within DB
		e.preventDefault();
		// TODO correction(e)
		const data = { ...person };
		console.log(data);
		try {
			await axios
				.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/write`, person)
				.then((item) => {
					console.log(item);
					navigate(`/persons/id${item.data._id}`);
					// TODO click on the /create doesn't empty form
					// TODO buttons after creation doesn't changes
					const dataFromURL = getDataByIdFromURL("persons");
					data._id = item.data._id;
					console.log(dataFromURL._id);
					setPerson(item.data);
					personCaseTrigger(item.data);
					alert(`Клиент ${personShortName} создан в БД`);
					// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
				});
		} catch (error) {
			console.error(error);
		}
	}

	async function savePerson(e) {
		e.preventDefault();
		correction(e);
		const data = {
			...person,
		};
		try {
			await axios
				.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/write`, person)
				.then((person) => {
					alert(`Данные ${personShortName} обновлены в БД`);
					//   this.props.history.push(`/person/${this.props.match.params.id}`);
				});
			personCaseTrigger(person);
		} catch (error) {
			console.error(error);
		}
	}

	function deletePerson(e) {
		e.preventDefault();
		const reallyDelete = confirm(
			`Действительно удалить ${personShortName} из БД?`
		);
		if (reallyDelete) {
			axios
				.post(
					`${SERVER_IP}:${SERVER_PORT}/api/persons/delete/id${person._id}`
				)
				.then((data) => {
					alert(`${personShortName} удален из БД`);
					// this.props.history.push(`/persons/create`); // TODO
					dispatch(removeActionCreator());
				});
			navigate(`/person`);
		}
	}

	function correction(e) {
		e.preventDefault();
		const obj = structuredClone(person);
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

	function receivePerson(person) {
		personCaseTrigger(person);
	}

	function clearPerson(e) {
		e.preventDefault();
		dispatch(removeActionCreator());
		navigate(`/person`);
	}

	return (
		<div className="component">
			<form>
				<hr className="mb-4" />
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
								value={person.lastName}
								onChange={onChange}
								required
							/>
							<div className="invalid-feedback">
								Valid last name is required.
							</div>
						</div>
						{/* Имя */}
						<div className="col-md-3 mb-1">
							<label htmlFor="firstName">Имя</label>
							<input
								type="text"
								className="form-control"
								id="firstName"
								placeholder="Иван"
								value={person.firstName}
								onChange={onChange}
								required
							/>
							<div className="invalid-feedback">
								Valid first name is required.
							</div>
						</div>
						{/* Отчество */}
						<div className="col-md-4 mb-3">
							<label htmlFor="middleName">Отчество</label>
							<input
								type="text"
								className="form-control"
								id="middleName"
								placeholder="Иванович"
								value={person.middleName}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid middle name is required.
							</div>
						</div>
						{/* Пол */}
						<div className="col-md-1 mb-3">
							<label htmlFor="gender">Пол</label>
							<select
								id="gender"
								className="form-select"
								value={person.gender}
								onChange={onChange}
							>
								<option value="муж">муж</option>
								<option value="жен">жен</option>
							</select>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend className="bg-light">ПАСПОРТ</legend>
					<div className="row">
						{/* Серия паспорта*/}
						<div className="col-md-1 mb-3">
							<label htmlFor="passport-serie">Серия</label>
							<input
								type="number"
								className="form-control"
								id="passportSerie"
								placeholder="8700"
								value={person.passportSerie}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid passport serie is required.
							</div>
						</div>
						{/* Номер паспорта */}
						<div className="col-md-2 mb-3">
							<label htmlFor="passport-number">Номер</label>
							<input
								type="number"
								className="form-control"
								id="passportNumber"
								placeholder="123456"
								value={person.passportNumber}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid passport number is required.
							</div>
						</div>
						{/* Дата Рождения */}
						<div className="col-md-2 mb-3">
							<label htmlFor="birth-date">Дата рождения</label>
							<ReactInputDateMask
								mask="dd.mm.yyyy"
								showMaskOnFocus={true}
								className="form-control"
								value={person.birthDate}
								onChange={onChange}
								showMaskOnHover={true}
								id="birthDate"
							/>
							<div className="invalid-feedback">
								Valid date is required.
							</div>
						</div>
						{/* Место рождения */}
						<div className="col-md-6 mb-3">
							<label htmlFor="birth-place">Место рождения</label>
							<input
								type="text"
								className="form-control"
								id="birthPlace"
								placeholder="пп Москва - Воркута, вагон 5, место 23"
								value={person.birthPlace}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid middle name is required.
							</div>
						</div>
						{/* Дата выдачи паспорта */}
						<div className="col-md-2 mb-3">
							<label htmlFor="passport-date">Дата выдачи</label>
							<ReactInputDateMask
								mask="dd.mm.yyyy"
								showMaskOnFocus={true}
								className="form-control"
								value={person.passportDate}
								onChange={onChange}
								showMaskOnHover={true}
								id="passportDate"
							/>
							{/* <input
								type="date"
								className="form-control"
								id="passportDate"
								min="1900-01-01"
								value={dayjs(person.passportDate).format(
									"yyyy-MM-dd"
								)}
								onBlur={onChange}
							/> */}
							<div className="invalid-feedback">
								Valid date is required.
							</div>
						</div>
						{/* Место выдачи паспорта */}
						<div className="col-md-4 mb-3">
							<label htmlFor="passport-place">Место выдачи</label>
							<input
								type="text"
								className="form-control"
								id="passportPlace"
								placeholder="ОВД РСФСР при МВД СССР по Коми АСССР в г. Воркуте "
								value={person.passportPlace}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid issue place is required.
							</div>
						</div>
						{/* Код подразделения */}
						<div className="col-md-2 mb-3">
							<label htmlFor="passport-code">
								Код подразделения
							</label>
							<input
								type="text"
								className="form-control"
								id="passportCode"
								placeholder="110-003"
								value={person.passportCode}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid number is required.
							</div>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend className="bg-light">ИНН, СНИЛС</legend>
					<div className="row">
						{/* ИНН Номер */}
						<div className="col-md-2 mb-3">
							<label htmlFor="innNumber">ИНН</label>
							<input
								type="number"
								className="form-control"
								id="innNumber"
								placeholder="110300400500"
								value={person.innNumber}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid number is required.
							</div>
						</div>
						{/* СНИЛС Номер */}
						<div className="col-md-2 mb-3">
							<label htmlFor="snilsNumber">СНИЛС</label>
							<input
								type="text"
								className="form-control"
								id="snilsNumber"
								placeholder="111-222-333 44"
								value={person.snilsNumber}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid number is required.
							</div>
						</div>
					</div>
				</fieldset>
				{/* АДРЕСА */}
				<fieldset>
					<legend className="bg-light">АДРЕСА</legend>
					{person.address.map((el, index) => {
						return (
							<div className="row" key={index}>
								<div className="col-md-2 mb-3">
									<label htmlFor="address-type">
										Тип адреса
									</label>
									<input
										type="text"
										className="form-control"
										list="descriptionList"
										id="address-description"
										placeholder="регистрации"
										value={el.description}
										onChange={(e) => onChange(e, index)}
									/>
									<datalist id="descriptionList">
										<option value="регистрации" />
										<option value="проживания" />
										<option value="рабочий" />
									</datalist>
									<div className="invalid-feedback">
										Valid index is required.
									</div>
								</div>
								{/* Индекс */}
								<div className="col-md-2 mb-3">
									<label htmlFor="address-city">Индекс</label>
									<input
										type="number"
										className="form-control"
										id="address-index"
										placeholder="169900"
										value={el.index}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid index is required.
									</div>
								</div>
								{/* Субъект */}
								<div className="col-md-2 mb-3">
									<label htmlFor="address-subject">
										Субъект (край, область, округ...)
									</label>
									<input
										type="text"
										className="form-control"
										id="address-subject"
										placeholder="Республика Коми"
										value={el.subject}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid subject is required.
									</div>
								</div>
								{/* Город */}
								<div className="col-md-3 mb-3">
									<label htmlFor="address-city">Город</label>
									<input
										type="text"
										className="form-control"
										id="address-city"
										placeholder="г. Воркута"
										value={el.city}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid city is required.
									</div>
								</div>
								{/* Населенный пункт */}
								<div className="col-md-3 mb-3">
									<label htmlFor="address-city">
										Населенный пункт
									</label>
									<input
										type="text"
										className="form-control"
										id="address-settlement"
										placeholder="пос. Цементнозаводский"
										value={el.settlement}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid lcation is required.
									</div>
								</div>
								{/* Улица */}
								<div className="col-md-3 mb-3">
									<label htmlFor="address-street">
										Улица
									</label>
									<input
										type="text"
										className="form-control"
										id="address-street"
										placeholder="ул. Ватутина"
										value={el.street}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid street is required.
									</div>
								</div>
								{/* Дом */}
								<div className="col-md-1 mb-3">
									<label htmlFor="address-building">
										Здание
									</label>
									<input
										type="text"
										className="form-control"
										id="address-building"
										placeholder="123/1 А"
										value={el.building}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid building is required.
									</div>
								</div>
								{/* Квартира */}
								<div className="col-md-1 mb-3">
									<label htmlFor="address-appartment">
										Квартира
									</label>
									<input
										type="text"
										className="form-control"
										id="address-appartment"
										placeholder="188"
										value={el.appartment}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid appartments number is required.
									</div>
								</div>
								<div className="col-md-1 mb-3">
									<button
										className="btn btn-outline-danger btn-sm btn-block"
										id="address"
										onClick={(e) =>
											removeAddressPhone(e, index)
										}
									>
										удалить
									</button>
								</div>
							</div>
						);
					})}
					<button
						className="btn btn-light btn-md btn-block"
						onClick={addAddressPhone}
						id="address"
					>
						добавить адрес
					</button>
				</fieldset>
				{/* ТЕЛЕФОНЫ */}
				<fieldset>
					<legend className="bg-light">ТЕЛЕФОНЫ</legend>
					{person.phone.map((el, index) => {
						return (
							<div className="row" key={index}>
								{/* Телефон*/}
								<div className="col-md-2 mb-3">
									<input
										type="tel"
										className="form-control"
										id="phone-number"
										placeholder="89121234567"
										maxLength="11"
										value={el.number}
										onChange={(e) => onChange(e, index)}
									/>
									<div className="invalid-feedback">
										Valid phone number is required.
									</div>
								</div>
								<div className="col-md-2 mb-3">
									<input
										type="text"
										className="form-control"
										id="phone-description"
										placeholder="сотовый"
										list="phoneList"
										value={el.description}
										onChange={(e) => onChange(e, index)}
									/>
									<datalist id="phoneList">
										<option value="основной" />
										<option value="дополнительный" />
										<option value="рабочий" />
									</datalist>
									<div className="invalid-feedback">
										Valid phone number is required.
									</div>
								</div>
								<div className="col-md-1 mb-3">
									<button
										className="btn btn-outline-danger btn-sm btn-block"
										id="phone"
										onClick={(e) =>
											removeAddressPhone(e, index)
										}
									>
										удалить
									</button>
								</div>
							</div>
						);
					})}
					<button
						className="btn btn-light btn-md btn-block"
						onClick={addAddressPhone}
						id="phone"
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
								<span className="text-muted">
									{" "}
									(необязательно)
								</span>
							</label>
							<input
								type="email"
								className="form-control"
								id="email"
								placeholder="you@example.com"
								value={person.email}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Please enter a valid email address for shipping
								updates.
							</div>
						</div>

						{/* Комментарий */}
						<div className="col-md-10 mb-3">
							<label htmlFor="comment">Комментарий</label>
							<input
								type="text"
								className="form-control"
								id="comment"
								placeholder="какой-то текст...."
								value={person.comment}
								onChange={onChange}
							/>
							<div className="invalid-feedback">
								Valid appartments number is required.
							</div>
						</div>
					</div>
				</fieldset>
				{/* КНОПКИ */}
				<div className="footer-buttons">
					{/*  */}
					{!person._id && (
						<button
							className="btn btn-success btn-md btn-block"
							onClick={clearPerson}
							disabled={unmodified}
						>
							Очистить
						</button>
					)}
					{/*  */}
					{person._id && (
						<button
							className="btn btn-warning btn-md btn-block"
							onClick={revert}
							disabled={unmodified}
						>
							Вернуть исходные
						</button>
					)}
					{/* СОЗДАТЬ НОВОГО КЛИЕНТА. СОХРАНИТЬ  ВВЕДЕННЫЕ ДАННЫЕ*/}
					{!person._id && (
						<button
							className="btn btn-success btn-md btn-block"
							type="submit"
							onClick={createPerson}
							disabled={unmodified && !person.lastName}
						>
							Создать нового
						</button>
					)}
					{/*  */}
					{person._id && (
						<button
							className="btn btn-primary btn-md btn-block"
							onClick={savePerson}
							disabled={unmodified}
						>
							Сохранить изменения
						</button>
					)}
					{/*  */}
					{person._id && (
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
				receivePerson={receivePerson}
				person={personNames}
			/>
		</div>
	);
}

export { PersonCard };
