import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import axios from "axios";
require("dotenv").config();
import dayjs from "dayjs";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function AgreementCaseProps({ styleClass, getChildCaseProps, caseProps }) {
	const [agreementSwitch, setAgreementSwitch] = useState(false);

	/* 
	totalSum = 120000, 
	initialSum = 25000, 
	intervalSum = 8000, 
	payMultiplier = 1, 
	payPeriod = 'month'
 	*/

	const {
		register,
		handleSubmit,
		watch,
		control,
		getValues,
		reset,
		formState: { errors, isDirty, isValid },
	} = useForm({
		// defaultValues: caseProps,
		mode: "onBlur",
	});

	function handleChange() {
		getChildCaseProps({
			agreement: getValues()
		})
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
		values.agreement = getValues();
		console.log("values:", values);
		getChildCaseProps(values);
	}

	function onSubmit(data) {
		e.prventDefault();
		getCaseProps(data);
	}

	return (
		<>
			<div className="form-check form-switch">
				<input
					class="form-check-input"
					type="checkbox"
					id="agreementSwitch"
					checked={agreementSwitch}
					{...register("agreementSwitch", {
						onChange: (e) => {
							setAgreementSwitch(e.target.checked);
						},
					})}
				/>
				<label
					className={"form-check-label " + styleClass}
					htmlFor="agreementSwitch"
				>
					Данные договора
				</label>
			</div>

			{agreementSwitch && (
				<div className="component">
					<form onSubmit={handleSubmit(onSubmit)}>
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
										{...register("totalSum", {
											value: caseProps.agreement.totalSum,
											onChange: (e) => handleChange(e),
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
										id="agreementDate"
										placeholder="1960-02-29"
										onChange={(e) =>
											onChange(e, "agreementDate")
										}
										{...register("agreementDate", {
											value: caseProps.agreement.agreementDate,
											onChange: (e) => handleChange(e),
											required: true
										})}
									/>
									{errors.agreementDate && (
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
										id="agreementNumber"
										placeholder="0001"
										{...register("agreementNumber", {
											value: caseProps.agreement.agreementNumber,
											onChange: (e) => handleChange(e),
											required: true
										})}
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
											value="в начале"
											{...register("payVariant", {
												value: caseProps.agreement.payVariant,
												onChange: (e) => handleChange(e),
												required: true
											})}
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
											{...register("payVariant", {
												value: caseProps.agreement.payVariant,
												onChange: (e) => handleChange(e),
												required: true
											})}
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
											{...register("payVariant", {
												value: caseProps.agreement.payVariant,
												onChange: (e) => handleChange(e),
												required: true
											})}
										/>
									</div>
								</div>
							</div>
							<div className="row">
								{/* Schedule data */}
								{/* totalSum = 120000, initialSum = 25000, intervalSum = 8000, payPeriod = 'month' */}
								{/* Первый платеж */}
								{watch("payVariant") ===
									"график платежей" && (
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
													value: caseProps.agreement.initialSum,
													onChange: (e) => handleChange(e),
													required: true
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
													value: caseProps.agreement.intervalSum,
													onChange: (e) => handleChange(e),
													required: true
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
															"payPeriodMultiplier"
														, {
															value: caseProps.agreement.payPeriodMultiplier,
															onChange: (e) => handleChange(e),
															required: true
														})}
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
																onChange={
																	onChange
																}
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
			)}
		</>
	);
}

export { AgreementCaseProps };
