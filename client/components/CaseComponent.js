import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
require("dotenv").config();
import { getDataByIdFromURL } from "../functions";
import dayjs from "dayjs";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function CaseComponent() {
	const [caseData, setCaseData] = useState({
		_id: "",
		caseN: "",
		caseDate: "",
		caseReceivedDocs: [
			{
				title: "",
				have: false,
			},
		],
		caseFlow: [
			{
				phase: "",
				date: "",
				comment: "",
			},
		],
		caseReminder: [
			{
				title: "",
				date: "",
				active: false,
				comment: "",
			},
		],
		comment: "",
		idPerson: {
			_id: "",
			lastName: "",
			firstName: "",
			middleName: "",
			gender: "",
			innNumber: "",
			snilsNumber: "",
			birthDate: "",
			birthPlace: "",
			passportSerie: "",
			passportNumber: "",
			passportDate: "",
			passportPlace: "",
			passportCode: "",
			address: [
				{
					description: "",
					city: "",
					street: "",
					building: "",
					appartment: "",
				},
			],
			phone: [
				{
					description: "",
					number: "",
				},
			],
			comment: "",
		},
	});

	const navigate = useNavigate()

	useEffect(() => {
		const getData = async () => {
			try {
				const data = await getDataByIdFromURL("cases");
				console.log("Data: ", data);

				setCaseData(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		getData();
	}, []);

	useEffect(() => {
		console.log("caseData:", caseData);
	}, [caseData]);

	function onChange(e, field) {
		e.persist();
		console.log("Event:", e);
		console.log("Field:", field);

		setCaseData((prevData) => {
			// Use the previous state to create a shallow copy of the caseData
			const updatedData = { ...prevData };

			// Split the field path into an array
			const fieldPath = field.split(".");
			console.log('fieldPath', fieldPath);
			

			// Navigate through the nested structure and update the target field
			let currentLevel = updatedData;
			for (let i = 0; i < fieldPath.length - 1; i++) {
				if (fieldPath[i].includes('-')) {
					const currentArr = fieldPath[i].split('-')
					currentLevel = currentLevel[currentArr[0]][currentArr[1]]
				} else {
					currentLevel = currentLevel[fieldPath[i]];
				}
			}

			// Handle the special case for checkboxes
			if (e.target.type === "checkbox") {
				console.log(currentLevel[fieldPath[fieldPath.length - 1]]);
				
				currentLevel[fieldPath[fieldPath.length - 1]] =
					e.target.checked;
			} else {
				currentLevel[fieldPath[fieldPath.length - 1]] = e.target.value;
			}

			console.log("Updated Data:", updatedData);

			return updatedData;
		});
	}

	const addNewArrayItem = (arrayName) => {
		setCaseData((prevData) => {
			const array = prevData[arrayName]
			array.push({})
			const newCaseData = {...prevData}

			return newCaseData;
		});
	};

	const deleteArrayItem = (arrayName, index) => {
        setCaseData((prevData) => {
            const newArray = [...prevData[arrayName]];
            newArray.splice(index, 1);
            const newCaseData = { ...prevData, [arrayName]: newArray };
            return newCaseData;
        });
    };

	const clearCase =(e) => {
		e.preventDefault()
		console.log('clear case');
	}

	const createCase =(e) => {
		// TODO add check and modify within DB
        e.preventDefault();
        // TODO correction(e)
        const data = {...caseData}
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/cases/write`, data).then(item => {
            alert(`Дело ${personShortName} создано в БД`);
            navigate(`/cases/id${item.data._id}`)
            // TODO click on the /create doesn't empty form
            // TODO buttons after creation doesn't changes
            const dataFromURL = getDataByIdFromURL('cases') 
            data._id = item.data._id
            console.log(dataFromURL._id)
            dispatch(captureActionCreator(data))
            // this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
        })
	}

	const saveCase =(e) => {
		e.preventDefault();
		console.log('saveCase');
		
        const data = {
            ...caseData
        }
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/cases/write`, data).then(item => {
          alert(`Данные ${item.caseN} обновлены в БД`);
        //   this.props.history.push(`/person/${this.props.match.params.id}`);
        });
	}

	const revert =() => {
		e.preventDefault()
        getDataByIdFromURL('cases')
	}
	
	const deleteCase = (e) => {
		e.preventDefault();
        const reallyDelete = confirm(`Действительно удалить это дело из БД?`)
        if (reallyDelete) {
            axios
              .post(`${SERVER_IP}:${SERVER_PORT}/api/cases/delete/id${caseData._id}`)
              .then(data => {
                alert(`Дело удалено из БД`);
                // this.props.history.push(`/persons/create`); // TODO
              });
              navigate(`/cases`)
            }
	}

	return (
		<>
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
									value={
										caseData.idPerson &&
										caseData.idPerson.lastName
									}
									onChange={(e) =>
										onChange(e, "idPerson.lastName")
									}
									required
								/>
								<div className="invalid-feedback">
									Valid last name is required.
								</div>
							</div>
							{/* Имя */}
							<div className="col-md-3 mb-3">
								<label htmlFor="firstName">Имя</label>
								<input
									type="text"
									className="form-control"
									id="firstName"
									placeholder="Иван"
									value={
										caseData.idPerson &&
										caseData.idPerson.firstName
									}
									onChange={(e) =>
										onChange(e, "idPerson.firstName")
									}
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
									value={
										caseData.idPerson &&
										caseData.idPerson.middleName
									}
									onChange={(e) =>
										onChange(e, "idPerson.middleName")
									}
								/>
								<div className="invalid-feedback">
									Valid middle name is required.
								</div>
							</div>
						</div>
					</fieldset>
					<fieldset>
						<legend className="bg-light">&nbsp;</legend>
						<div className="row">
							{/* Название дела */}
							<div className="col-md-6 mb-3">
								<label htmlFor="birth-place">
									Название дела
								</label>
								<input
									type="text"
									className="form-control"
									id="caseN"
									placeholder="0123 Дело о недополученных миллионах"
									value={caseData.caseN}
									onChange={(e) => onChange(e, "caseN")}
								/>
								<div className="invalid-feedback">
									Valid middle name is required.
								</div>
							</div>
							{/* Дата создания*/}
							<div className="col-md-2 mb-3">
								<label htmlFor="birth-date">
									Дата создания
								</label>
								<input
									type="date"
									className="form-control"
									id="birthDate"
									placeholder="1960-02-29"
									value={dayjs(caseData.caseDate).format(
										"YYYY-MM-DD"
									)}
									onChange={(e) => onChange(e, "caseDate")}
								/>
								<div className="invalid-feedback">
									Valid date is required.
								</div>
							</div>
							<div className="col-md-10 mb-3">
								<label htmlFor="comment">
									Комментарий
								</label>
								<input
									type="text"
									className="form-control"
									id="comment"
									placeholder="какой-то текст"
									value={caseData.comment}
									onChange={(e) => onChange(e, "comment")}
								/>
								<div className="invalid-feedback">
									Valid date is required.
								</div>
							</div>
							{/* Принятые документы начало */}
							{/* Case Received Docs */}
							<fieldset>
								<legend className="bg-light">
									Принятые документы
								</legend>
								{caseData.caseReceivedDocs.map((doc, index) => (
									<div className="row" key={index}>
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
												value={doc.title}
												onChange={(e) =>
													onChange(
														e,
														`caseReceivedDocs-${index}.title`
													)
												}
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
												checked={doc.have}
												onChange={(e) =>
													onChange(
														e,
														`caseReceivedDocs-${index}.have`
													)
												}
											/>
									</div>

								<div className="col-md-1 mb-3">
                                    {/* Delete button for caseReceivedDocs */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() =>
                                            deleteArrayItem(
                                                "caseReceivedDocs",
                                                index
                                            )
                                        }
                                    >
                                        -
                                    </button>
                                </div>

									</div>
								))}
								{/* Add more caseReceivedDocs fields dynamically */}
								<button
									type="button"
									className="btn btn-success"
									onClick={() =>
										addNewArrayItem("caseReceivedDocs")
									}
								>
									Добавить
								</button>
							</fieldset>
							{/* Принятые документы конец */}
						</div>
					</fieldset>

					{/* Case Flow */}
					<fieldset>
						<legend className="bg-light">Движение дела</legend>
						{caseData.caseFlow.map((flow, index) => (
							<div className="row" key={index}>
								{/* ... Similar structure as Case Received Docs ... */}
								<div className="col-md-4 mb-3">
									<label htmlFor={`caseFlow-${index}`}>
										Этап
									</label>
									<input
										type="text"
										className="form-control"
										id={`caseFlow-${index}`}
										placeholder="Подготовка документов"
										value={flow.title}
										onChange={(e) =>
											onChange(
												e,
												`caseFlow-${index}.phase`
											)
										}
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
										value={flow.date}
										onChange={(e) =>
											onChange(
												e,
												`caseFlow-${index}.date`
											)
										}
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
										value={flow.comment}
										onChange={(e) =>
											onChange(
												e,
												`caseFlow-${index}.comment`
											)
										}
									/>
								</div>
								<div className="col-md-1 mb-3">
                                    {/* Delete button for caseFlow */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() =>
                                            deleteArrayItem(
                                                "caseFlow",
                                                index
                                            )
                                        }
                                    >
                                        -
                                    </button>
                                </div>
								{/* ... Similar structure as Case Received Docs END... */}
							</div>
						))}
						{/* Add more caseFlow fields dynamically */}
						<button
							type="button"
							className="btn btn-success"
							onClick={() => addNewArrayItem("caseFlow")}
						>
							Добавить
						</button>
					</fieldset>

					{/* Case Reminder */}
					<fieldset>
						<legend className="bg-light">Напоминание</legend>
						{caseData.caseReminder.map((reminder, index) => (
							<div className="row" key={index}>
								{/* ... Similar structure as Case Received Docs ... */}
								<div className="col-md-4 mb-3">
									<label htmlFor={`caseReminder-${index}`}>
										Название
									</label>
									<input
										type="text"
										className="form-control"
										id={`caseReminder-${index}`}
										placeholder="Какой-то комментарий"
										value={reminder.title}
										onChange={(e) =>
											onChange(
												e,
												`caseReminder-${index}.title`
											)
										}
									/>
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
										value={reminder.date}
										onChange={(e) =>
											onChange(
												e,
												`caseReminder-${index}.date`
											)
										}
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
										checked={reminder.active}
										onChange={(e) =>
											onChange(
												e,
												`caseReminder-${index}.active`
											)
										}
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
										value={reminder.comment}
										onChange={(e) =>
											onChange(
												e,
												`caseReminder-${index}.comment`
											)
										}
									/>
								</div>
								<div className="col-md-1 mb-3">
                                    {/* Delete button for caseReceivedDocs */}
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() =>
                                            deleteArrayItem(
                                                "caseReminder",
                                                index
                                            )
                                        }
                                    >
                                        -
                                    </button>
                                </div>
								{/* ... Similar structure as Case Received Docs END... */}
							</div>
						))}
						{/* Add more caseReminder fields dynamically */}
						<button
							type="button"
							className="btn btn-success"
							onClick={() => addNewArrayItem("caseReminder")}
						>
							Добавить
						</button>
					</fieldset>

				{/* КНОПКИ */}
                {/*  */}
				&nbsp;
                <button className="btn btn-success btn-md btn-block" onClick={clearCase} >Очистить</button>
                &nbsp;
                {/* СОЗДАТЬ НОВОГО КЛИЕНТА. СОХРАНИТЬ  ВВЕДЕННЫЕ ДАННЫЕ*/}
                {!caseData._id && (<button className="btn btn-success btn-md btn-block" type="submit" onClick={createCase} >Создать новое</button>)}
                &nbsp;
                {/*  */}
                {caseData._id && (<button className="btn btn-primary btn-md btn-block" onClick={saveCase} >Сохранить изменения</button>)}
                &nbsp;
                {/*  */}
                {caseData._id && (<button className="btn btn-warning btn-md btn-block" onClick={revert} >Вернуть исходные</button>)}
                &nbsp;
                {/*  */}
                {caseData._id && (<button className="btn btn-danger btn-md btn-block" onClick={deleteCase} >Удалить из БД</button>)}
                &nbsp;
				</form>
			</div>
		</>
	);
}

export { CaseComponent };
