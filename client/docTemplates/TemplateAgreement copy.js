import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
require("dotenv").config();
import dayjs from "dayjs";
import { TempAnyDoc2 } from "./TempAnyDoc2";
import { Tokens } from "./Tokens";
import { TinyEditor } from "./TinyEditor";
import { TemplateButtons } from "./TemplateButtons";
import { DocumentButtons } from "./DocumentButtons";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function TemplateAgreement() {
	const initialDocProps = {
		totalSum: 1000,
		agreementDate: dayjs().format("YYYY-MM-DD"),
		agreementNumber: "",
		payVariant: "в начале",
		initialSum: "",
		intervalSum: "",
		payPeriodMultiplier: "",
		payPeriod: "",
	};
	
	const [docProps, setDocProps] = useState(initialDocProps);

	/* 
	totalSum = 120000, 
	initialSum = 25000, 
	intervalSum = 8000, 
	payMultiplier = 1, 
	payPeriod = 'month'
 	*/

	function handleChange(e) {
		const [id, value] = e.target
		// setDocProps(...docProps, [id]: value)
		console.log('docProps in handleChange', docProps)
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

	function sendValue(e) {
		e.preventDefault();
		const values = {};
	}

	function onSubmit(data) {
		e.prventDefault();
	}

	return (
		<>
			<div className="component">
				<form>
					<hr className="mb-4" />
					<h3>Данные договора</h3>
					<fieldset>
						<legend className="bg-light">Вид оплаты</legend>
						<div className="row">
							{/* Сумма */}
							<div className="col-md-2 mb-3">
								<label htmlFor="totalSum">Сумма</label>
								<input
									type="number"
									className="form-control"
									id="totalSum"
									value={docProps.totalSum}
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
									id="agreementDate"
									placeholder="1960-02-29"
									value={docProps.agreementDate}
								/>
							</div>
							{/* Номер договора */}
							<div className="col-md-2 mb-3">
								<label htmlFor="agreement-number">
									Номер договора
								</label>
								<input
									type="text"
									className="form-control"
									id="agreementNumber"
									placeholder="0001"
									value={docProps.agreementNumber}
								/>
							</div>
						</div>
						<div className="row">
							{/* Вид оплаты */}
							<div className="col-md-2 mb-3">
								<div className="form-check">
									<label htmlFor="payVariant">
										Вся сумма в начале
									</label>
									<input
										type="radio"
										className="form-check-input"
										id="payVariant"
										value={docProps.payVariant}
									/>
								</div>
							</div>
							<div className="col-md-2 mb-3">
								<div className="form-check">
									<label htmlFor="payVariant">
										Вся сумма в конце
									</label>
									<input
										type="radio"
										className="form-check-input"
										id="payVariant"
										value="в конце"
									/>
								</div>
							</div>
							<div className="col-md-4 mb-3">
								<div className="form-check">
									<label htmlFor="payVariant">
										График платежей
									</label>
									<input
										type="radio"
										className="form-check-input"
										id="payVariant"
										value="график платежей"
									/>
								</div>
							</div>
						</div>
						<div className="row">
							{/* Schedule data */}
							{/* totalSum = 120000, initialSum = 25000, intervalSum = 8000, payPeriod = 'month' */}
							{/* Первый платеж */}
							{watch("payVariant") === "график платежей" && (
								<>
									<div className="col-md-2 mb-3">
										<label htmlFor="initialSum">
											Первый платеж
										</label>
										<input
											type="number"
											className="form-control"
											id="initialSum"
											{...register("initialSum", {
												// value: docProps.initialSum,
												onChange: (e) =>
													handleChange(e),
												required: true,
											})}
										/>
										{errors.initialSum && (
											<span className="required-field">
												Обязательное поле
											</span>
										)}
									</div>
									{/* Последующие платежи */}
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
												onChange: (e) =>
													handleChange(e),
												required: true,
											})}
										/>
										{errors.intervalSum && (
											<span className="required-field">
												Обязательное поле
											</span>
										)}
									</div>
									{/* Периодичность */}

									<div className="col-md-3 mb-3">
										<label htmlFor="payPeriod">
											Периодичность платежей
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
															onChange: (e) =>
																handleChange(e),
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
															value={value}
															onChange={onChange}
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
					</fieldset>
					{/* КНОПКИ */}
					{/* seems like no need in OK button */}
					<button
						className="btn btn-outline-success btn-sm btn-block"
						onClick={(e) => sendValue(e)}
					>
						OK
					</button>
				</form>
			</div>
			{/* inject props from form with getValues()
	Tokens receive values from REDUX */}
			<Tokens docProps={docProps} />

			{/* inject props from Tokens */}
			<TinyEditor />

			{/* inject props from Editor */}
			<TemplateButtons />

			{/* inject props from Editor */}
			<DocumentButtons />
		</>
	);
}

export { TemplateAgreement };
