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

function OrgCard() {
	const emptyOrg = {
		shortName: '',
		fullName: '',
		innOrg: '',
		ogrnOrg: '',
		creationDateOrg: '',
		addressOrg: [],
		comment: ''
	}
	const emptyAddressOrg = {
		descriptionOrg: "", // юридический, почтовый etc
		indexOrg: "",
		subjectOrg: "",
		cityOrg: "",
		settlementOrg: "",
		streetOrg: "",
		buildingOrg: "",
		appartmentOrg: "",
	}

	const [orgState, setOrgState] = useState(emptyOrg)
	
	useEffect(() => {
		async function getData() {
			const data = await getDataByIdFromURL("orgs") || emptyOrg; // TODO calling now even if there no id (create instead)
			console.log("useEffect data: ", data);
			data.creationDateOrg = dayjs(data.creationDateOrg).format("YYYY-MM-DD");
			setOrgState(data)
			reset(data)
		}
		getData();
	}, []);

	const navigate = useNavigate();

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
		defaultValues: emptyOrg,
		mode: 'onBlur'
	});


	const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
		control,
		name: "addressOrg",
	  });

	  const searchData = {
		shortName: watch('shortName'),
		innOrg: watch('innOrg'),
	};

	async function createOrg(data) {
		console.log(data);
		try {
			await axios
				.post(`${SERVER_IP}:${SERVER_PORT}/api/orgs/write`, data) // TODO
				.then((item) => {
					console.log('item: ', item);
					navigate(`/orgs/id${item.data._id}`);
					alert(`Организация ${item.data.shortName}. создана в БД`);
					// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
				});
		} catch (error) {
			console.error(error);
		}
	}

	function onSubmit(data) {
		console.log("onSubmit data", data);
		createOrg(data)
	}

	function deleteOrg(e) {
		e.preventDefault();
		const reallyDelete = confirm(
			`Действительно удалить организацию из БД?`
		);
		if (reallyDelete) {
			axios
				.post(
					`${SERVER_IP}:${SERVER_PORT}/api/orgs/delete/id${orgState._id}`
				)
				.then((data) => {
					alert(`Организация удалена из БД`);
					// this.props.history.push(`/persons/create`); // TODO
					//dispatch(removeActionCreator()); // CORRECT
				});
			navigate(`/orgs`);
			reset(emptyOrg)
		}
	}

	function formatYYYYMMDD(obj) {
		const formattedObject = {};

		for (const key in obj) {
			if (obj[key] instanceof Date) {
				formattedObject[key] = dayjs(obj[key]).format('YYYY-MM-DD');
			} else {
				formattedObject[key] = obj[key];
			}
		}

		return formattedObject;
	}

	function receiveFromChild(obj) {
		console.log("receiveFromChild obj: ", obj);
		// TODO KNOWN ISSUE: click on CheckBeforeCreatefills form everywhere except here
		// innOrg, ogrnOrg, index fiills after useEffect calling mb try reload page. but now - fuck it!
		// obj.innOrg = String(obj.innOrg);
		// obj.ogrnOrg = parseInt(obj.ogrnOrg);
		obj.creationDateOrg = dayjs(obj.creationDateOrg).format("YYYY-MM-DD");
		setOrgState(obj);
		reset(obj)
	}

	return (
		<div className="component">
			<form onSubmit={handleSubmit(onSubmit)}>
				<hr className="mb-4" />
				{/* ФИО */}
				<fieldset>
					<legend className="bg-light">Наименование организации</legend>
					<div className="row">
						{/* Сокращенное наименование */}
						<div className="col-md-4 mb-3">
							<label htmlFor="shortName">Сокращенное</label>
							<input
								type="text"
								className="form-control"
								id="shortName"
								placeholder={`ООО "Компания"`}
								{...register("shortName", { required: true })}
							/>
							{errors.shortName && (
								<span className="required-field">
									Обязательное поле
								</span>
							)}
						</div>
					
						{/* Полное наименование */}
						<div className="col-md-8 mb-3">
							<label htmlFor="fullName">Полное</label>
							<input
								type="text"
								className="form-control"
								id="fullName"
								placeholder={`Общество с ограниченной ответственностью "Компания"`}
								{...register("fullName")}
							/>
						</div>
					</div>
				</fieldset>
				{/* ПАСПОРТ */}
				{/* ИНН, ОГРН */}
				<fieldset>
					<legend className="bg-light">ИНН, ОГРН</legend>
					<div className="row">
						{/* ИНН Номер */}
						<div className="col-md-2 mb-3">
							<label htmlFor="innOrg">ИНН</label>
							<InputMask
								className="form-control"
								id="innOrg"
								placeholder="100200300400"
								mask="999999999999"
								{...register("innOrg")}
							/>
						</div>
						{/* ОГРН Номер */}
						<div className="col-md-2 mb-3">
							<label htmlFor="ogrnOrg">ОГРН</label>
							<InputMask
								type="text"
								className="form-control"
								id="ogrnOrg"
								placeholder="1002003005000"
								mask="9999999999999"
								{...register("ogrnOrg")}
							/>
						</div>
						{/* Дата создания ЮЛ */}
						<div className="col-md-2 mb-3">
							<label htmlFor="creationDateOrg">Дата создания ЮЛ</label>
							<input
								type="date"
								className="form-control"
								id="creationDateOrg"
								{...register("creationDateOrg")}
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
									<label htmlFor="addressOrg-descriptionOrg">
										Тип адреса
									</label>
									{/* description */}
									<input
										type="text"
										id="addressOrg-type"
										className="form-control"
										list="descriptionList"
										{...register(`addressOrg.${index}.descriptionOrg`)}
										placeholder="Тип"
									/>
									<datalist id="descriptionList">
										<option value="юридический" />
										<option value="почтовый" />
									</datalist>
								</div>
								{/* Индекс */}
								<div className="col-md-2 mb-3">
									<label htmlFor="addressOrg-indexOrg">
										Индекс
									</label>
									{/* index */}
									<InputMask
										id="address-index"
										className="form-control"
										mask="999999"
										{...register(`addressOrg.${index}.indexOrg`)}
										placeholder="169900"
									/>
								</div>
								{/* Субъект */}
								<div className="col-md-2 mb-3">
									<label htmlFor="addressOrg-subjectOrg">
										Субъект
									</label>
									{/* subject */}
									<input
										type="text"
										id="addressOrg-subjectOrg"
										className="form-control"
										{...register(`addressOrg.${index}.subjectOrg`)}
										placeholder="Край, область, округ..."
									/>
								</div>
								{/* Город */}
								<div className="col-md-3 mb-3">
									<label htmlFor="addressOrg-cityOrg">Город</label>
									{/* city */}
									<input
										type="text"
										id="addressOrg-cityOrg"
										className="form-control"
										{...register(`addressOrg.${index}.cityOrg`)}
										placeholder="г. Воркута"
									/>
								</div>
								{/* Населенный пункт */}
								<div className="col-md-3 mb-3">
									<label htmlFor="addressOrg-settlementOrg">
										Населенный пункт
									</label>
									{/* settlement */}
									<input
										type="text"
										id="addressOrg-settlementOrg"
										className="form-control"
										{...register(`addressOrg.${index}.settlementOrg`)}
										placeholder="пос. Цементнозаводский"
									/>
								</div>
								{/* Улица */}
								<div className="col-md-3 mb-3">
									<label htmlFor="addressOrg-streetOrg">
										Улица
									</label>
									{/* street */}
									<input
										type="text"
										id="addressOrg-streetOrg"
										className="form-control"
										{...register(`addressOrg.${index}.streetOrg`)}
										placeholder="ул. Ватутина"
									/>
								</div>
								{/* Дом */}
								<div className="col-md-1 mb-3">
									<label htmlFor="addressOrg-buildingOrg">
										Здание
									</label>
									{/* building */}
									<input
										type="text"
										id="addressOrg-buildingOrg"
										className="form-control"
										{...register(`addressOrg.${index}.buildingOrg`)}
										placeholder="д. 3"
									/>
								</div>
								{/* Квартира */}
								<div className="col-md-1 mb-3">
									<label htmlFor="addressOrg-appartmentOrg">
										Квартира
									</label>
									{/* appartment */}
									<input
										type="text"
										id="addressOrg-appartmentOrg"
										className="form-control"
										{...register(`addressOrg.${index}.appartmentOrg`)}
										placeholder="кв. 37"
									/>
								</div>
								<div className="col-md-1 mb-3">
									<button
										type="button"
										className="btn btn-outline-danger btn-sm btn-block"
										id="addressOrg"
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
						id="addressOrg"
						onClick={() =>
							appendAddress(emptyAddressOrg)
						}
					>
						добавить адрес
					</button>
				</fieldset>
				{/* ОСТАЛЬНОЕ */}
				<fieldset>
					<legend className="bg-light">ОСТАЛЬНОЕ</legend>
					<div className="row">
						{/* Комментарий */}
						<div className="col-md-10 mb-3">
							<label htmlFor="commentOrg">Комментарий</label>
							<input
								type="text"
								className="form-control"
								id="commentOrg"
								placeholder="какой-то текст...."
								{...register('commentOrg')}
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
					{true && (
						<button
							className="btn btn-warning btn-md btn-block"
							onClick={() => {reset(emptyOrg)}}
							disabled={!isDirty}
						>
							Очистить
						</button>
					)}
					{/*  */}
					{true && (
						<button
							className="btn btn-warning btn-md btn-block"
							onClick={() => {
								reset(orgState)
							}}
							disabled={!isDirty}
						>
							Отменить изменения
						</button>
					)}
					{/*  */}
					{orgState._id && (
						<button
							className="btn btn-danger btn-md btn-block"
							onClick={deleteOrg}
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

export { OrgCard };
