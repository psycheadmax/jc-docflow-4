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
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function PersonCard() {
	const [persons, setPersons] = useState([]);

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const person = useSelector((state) => state.personReducer.person);
    const [unmodified, setUnmodified] = useState(true)
    
	let personShortName = `${person.lastName} ${person.firstName[0]}. ${person.firstName[0]}.`

	const personNames = {
		lastName: person.lastName,
		firstName: person.firstName,
		middleName: person.middleName,
	};

	console.log("person in state:", person);

	function personCaseTrigger(data) {
		if (data._id !== person._id) {
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
		}
		getData();
        const initialPersonData = structuredClone(person)
	}, []);


	function onChange(e, index) {
		const idArray = e.target.id.split("-");
		const idFirst = idArray[0];
		const idSecond = idArray[1];
		if (idArray.length === 1) {
			personCaseTrigger({ [e.target.id]: e.target.value });
		} else {
			const addressOrPhone = [
				{
					...person[idFirst][index],
					[idSecond]: e.target.value,
				},
				idFirst,
				index,
			];
			dispatch(addressPhoneUpdateActionCreator(addressOrPhone));
		}

		if (e.target.id === "middleName") {
			if (e.target.value.slice(-1) === "а") {
				personCaseTrigger({ gender: "female" });
			} else {
				personCaseTrigger({ gender: "male" });
			}
		}
        setUnmodified(false)
	}

	function addAddress(e) {
		e.preventDefault();
		const addressArray = [...person.address];
		addressArray.push({
			type: "",
			subject: "",
			city: "",
			settlement: "",
			street: "",
			building: "",
			appartment: "",
		});
		personCaseTrigger({ address: addressArray });
	}

	function removeAddress(e, index) {
		e.preventDefault();
		let addressArray = [...person.address];
		addressArray.splice(index, 1);
		personCaseTrigger({ address: addressArray });
	}

	function addPhone(e) {
		e.preventDefault();
		const phoneArray = [...person.phone];
		phoneArray.push({ description: "", number: "" });
		personCaseTrigger({ phone: phoneArray });
	}

	function removePhone(e, index) {
		e.preventDefault();
		let phoneArray = [...person.phone];
		phoneArray.splice(index, 1);
		personCaseTrigger({ phone: phoneArray });
	}

	function revert(e) {
		e.preventDefault();
		getDataByIdFromURL("persons");
		// getPersonIdFromURL()
		// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
		// TODO personCaseTrigger({...personClone}))
	}

	function createPerson(e) {
		// TODO add check and modify within DB
		e.preventDefault();
		// TODO correction(e)
		const data = { ...person };
		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/write`, data)
			.then((item) => {
				alert(`Клиент ${personShortName} создан в БД`);
				navigate(`/persons/id${item.data._id}`);
				// TODO click on the /create doesn't empty form
				// TODO buttons after creation doesn't changes
				const dataFromURL = getDataByIdFromURL("persons");
				data._id = item.data._id;
				console.log(dataFromURL._id);
				personCaseTrigger(data);
				// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
			});
	}

	function savePerson(e) {
		e.preventDefault();
		correction(e);
		const data = {
			...person,
		};
		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/write`, data)
			.then((person) => {
				alert(`Данные ${personShortName} обновлены в БД`);
				//   this.props.history.push(`/person/${this.props.match.params.id}`);
			});
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
								<option value="male">муж</option>
								<option value="female">жен</option>
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
							<input
								type="date"
								className="form-control"
								id="birthDate"
								placeholder="1960-02-29"
								// value={dayjs(person.birthDate).format("DD-MM-YYYY")}
								value={dayjs(person.birthDate).format('YYYY-MM-DD')}
								onBlur={onChange}
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
							<input
								type="date"
								className="form-control"
								id="passportDate"
								min="1900-01-01"
								value={dayjs(person.passportDate).format('yyyy-MM-dd')}
								onBlur={onChange}
							/>
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
									<label htmlFor="address-type">Тип адреса</label>
									<input
										type="text"
										className="form-control"
                                        list="typeList"
										id="address-type"
										placeholder="регистрации"
										value={el.type}
										onChange={(e) => onChange(e, index)}
									/>
                                        <datalist id="typeList">
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
										onClick={(e) => removeAddress(e, index)}
									>
										удалить
									</button>
								</div>
							</div>
						);
					})}
					<button
						className="btn btn-light btn-md btn-block"
						onClick={addAddress}
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
										onClick={(e) => removePhone(e, index)}
									>
										удалить
									</button>
								</div>
							</div>
						);
					})}
					<button
						className="btn btn-light btn-md btn-block"
						onClick={addPhone}
					>
						добавить телефон
					</button>
				</fieldset>
				{/* АДРЕСА */}
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
				&nbsp;
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
				&nbsp;
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
				&nbsp;
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
				&nbsp;
				{/*  */}
				{person._id && (
					<button
						className="btn btn-danger btn-md btn-block"
						onClick={deletePerson}
					>
						Удалить из БД
					</button>
				)}
				&nbsp;
			</form>
			<CheckBeforeCreate
				receivePerson={receivePerson}
				person={personNames}
			/>
		</div>
	);
}

export { PersonCard };
