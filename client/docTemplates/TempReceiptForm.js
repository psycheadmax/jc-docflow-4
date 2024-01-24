import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import petrovich from "petrovich";
import TempReceiptGen from "./TempReceiptGen";
import { CaseNComponent } from "../components/CaseNComponent";
import {
	getDataByIdFromURL,
	getCurrentYearPKONumbers,
	getUnusedPKONumbers,
} from "../functions";
import isEqual from 'lodash/isEqual'
import axios from "axios";
require("dotenv").config();
import { TempReceiptDoc } from "./TempReceiptDoc";
import "./TempReceiptForm.css";
import { useReactToPrint } from "react-to-print";

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

const rubles = require("rubles").rubles;
const dayjs = require("dayjs");

function TempReceiptForm() {
	const dispatch = useDispatch();
	const person = useSelector((state) => state.personReducer.person);

	const personForPetrovich = {
		first: person.firstName,
		middle: person.middleName,
		last: person.lastName,
	};

	const personGenitive = petrovich(personForPetrovich, "genitive");

	const [PKONumbers, setPKONumbers] = useState([]);

	const [receiptData, setReceiptData] = useState({
		idPerson: person._id,
		caseN: person.cases || [], // || []
		type: "ПКО", // ПКО, Договор
		description: "no description",
		date: dayjs().format("YYYY-MM-DD"),
		number: 1,
		sum: 1000,
		sumLetters: "одна тысяча",
		docProps: {
			// TODO work it, check structure
			lastNameGenitive: personGenitive.last,
			firstNameGenitive: personGenitive.first,
			middleNameGenitive: personGenitive.middle,
			reason: "оплата оставления искового заявления и представительства",
			attachment: `договор от ${dayjs().format("DD.MM.YYYY")} г.`,
			organization: 'ООО "Юридический центр"',
			mainAccountant: "Д.А. Пахмутов",
			cashier: "Д.А. Пахмутов",
		},
	});

	useEffect(() => {
        async function fetchData() {
          const data = await getDataByIdFromURL("docs");
          console.log("useEffect Data: ", data);
          if (data) {
            setReceiptData(data);
          }
        }
      
        async function initializeReceipt() {
          const numbers = await getCurrentYearPKONumbers();
          const unusedNumbers = getUnusedPKONumbers(numbers);
          setPKONumbers(unusedNumbers);
      
          // Update the receiptData with the first PKONumber
          setReceiptData(prevReceiptData => ({
            ...prevReceiptData,
            number: unusedNumbers[0] // Assuming unusedNumbers is not empty
          }));
        }
        
        fetchData();
        initializeReceipt();
      
      }, []);
      
	console.log("person in receipt", person);
	console.log("initial receiptData: ", receiptData);

	const [initialReceiptData, setInitialReceiptData] = useState(structuredClone(receiptData))

	const componentRef = useRef();

	function handlePrintWrapper(e) {
		e.preventDefault();
		handlePrint();
	}

	const handlePrint = useReactToPrint({
		content: () => componentRef.current,
	});

	function onReceiptDataChange(e) {
        const idArray = e.target.id.split("-");
        const id = idArray[0];
        const idSecond = idArray[1];
      
		console.log('isEqual', isEqual(receiptData, initialReceiptData));
		console.log('receiptData', receiptData);
		console.log('initialReceiptData', initialReceiptData);

        if (idArray.length === 1) {
          setReceiptData({
            ...receiptData,
            [e.target.id]: isNaN(e.target.value) ? e.target.value : parseInt(e.target.value, 10)
          });
        } else {
          const receiptDataClone = structuredClone(receiptData);
          receiptDataClone[id][idSecond] = e.target.value;
          setReceiptData(receiptDataClone);
        }
      }

	function deleteRub(str) {
		const one = str.replace(" рубль 00 копеек", "");
		const two = one.replace(" рубля 00 копеек", "");
		const three = two.replace(" рублей 00 копеек", "");
		return three;
	}

	function onSumChange(e) {
        setReceiptData({
            ...receiptData,
            [e.target.id]: isNaN(e.target.value) ? e.target.value : parseInt(e.target.value, 10),
            sumLetters: deleteRub(rubles(e.target.value)),
          })
	}

	function createReceipt(e) {
		e.preventDefault();
		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/docs/write`, receiptData)
			.then((receipt) => {
				alert(`ПКО ${receipt.data._id} создан`);
				// this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
			});
	}

	function saveReceipt() {
		// save changes to existing receipt
		e.preventDefault();
		axios
			.post(`${SERVER_IP}:${SERVER_PORT}/api/docs/`, receiptData)
			.then((doc) => {
				// correct the path !!!
				alert(`Документ ${doc._id} обновлен в БД`);
				//   this.props.history.push(`/person/${this.props.match.params.id}`);
			});
		// TODO doesn't  create new case to existing
	}

	function revertReceipt() {}

	function deleteReceipt() {}

	function generatePDF() {}

	/* function savePerson(e) {
        e.preventDefault();
        correction(e)
        const data = {
            id: person._id,
            ...person
        }
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/`, data).then(person => {
          alert("Person Successfully Updated!");
        //   this.props.history.push(`/person/${this.props.match.params.id}`);
        });
    } */

	return (
		<div className="component">
			<div id="pdf"></div>
			<form>
				<fieldset>
					<legend className="bg-light">ФИО</legend>
					<div className="row">
						{/* Фамилии */}
						<div className="col-md-4 mb-3">
							<label htmlFor="lastName">Фамилия</label>
							<input
								type="text"
								className="form-control"
								id="lastName"
								placeholder="Иванов"
								value={person.lastName}
								readOnly
							/>
							<div className="invalid-feedback">
								Valid last NameGenitive is required.
							</div>
						</div>
						{/* Имени */}
						<div className="col-md-3 mb-3">
							<label htmlFor="firstNameGenitive">Имя</label>
							<input
								type="text"
								className="form-control"
								id="firstName"
								placeholder="Иван"
								value={person.firstName}
								readOnly
							/>
							<div className="invalid-feedback">
								Valid first NameGenitive is required.
							</div>
						</div>
						{/* Отчества */}
						<div className="col-md-4 mb-3">
							<label htmlFor="middleNameGenitive">Отчество</label>
							<input
								type="text"
								className="form-control"
								id="middleName"
								placeholder="Иванович"
								value={person.middleName}
							/>
							<div className="invalid-feedback">
								Valid middle NameGenitive is required.
							</div>
						</div>
					</div>
				</fieldset>
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
								value={receiptData.docProps.lastNameGenitive}
								onChange={onReceiptDataChange}
								required
							/>
							<div className="invalid-feedback">
								Valid last NameGenitive is required.
							</div>
						</div>
						{/* Имени */}
						<div className="col-md-3 mb-3">
							<label htmlFor="firstNameGenitive">Имени</label>
							<input
								type="text"
								className="form-control"
								id="docProps-firstNameGenitive"
								placeholder="Иван"
								value={receiptData.docProps.firstNameGenitive}
								onChange={onReceiptDataChange}
								required
							/>
							<div className="invalid-feedback">
								Valid first NameGenitive is required.
							</div>
						</div>
						{/* Отчества */}
						<div className="col-md-4 mb-3">
							<label htmlFor="middleNameGenitive">Отчества</label>
							<input
								type="text"
								className="form-control"
								id="docProps-middleNameGenitive"
								placeholder="Иванович"
								value={receiptData.docProps.middleNameGenitive}
								onChange={onReceiptDataChange}
							/>
							<div className="invalid-feedback">
								Valid middle NameGenitive is required.
							</div>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend className="bg-light">
						Номер ПКО, дата, сумма, основание
					</legend>
					<div className="row">
						{/* Номер ПКО */}
						<div className="col-md-2 mb-3">
							<label htmlFor="PKONumber">Номер ПКО</label>
							<select
								className="form-select"
								value={receiptData.number}
								onChange={onReceiptDataChange}
                                id="number"
                                type="number"
								required
							>
								{PKONumbers.map((number) => (
									<option key={number} value={number}>
										{number}
									</option>
								))}
							</select>
							<div className="invalid-feedback">
								Valid PKO number is required.
							</div>
						</div>
						{/* Дата */}
						<div className="col-md-2 mb-3">
							<label htmlFor="PKODate">Дата ПКО</label>
							<input
								type="date"
								className="form-control"
								id="date"
								placeholder="01.01.1970"
								value={receiptData.date}
								onChange={onReceiptDataChange}
								required
							/>
							<div className="invalid-feedback">
								Valid PKO date is required.
							</div>
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
								value={receiptData.sum}
								onChange={onSumChange}
								required
							/>
							<div className="invalid-feedback">
								Valid sum is required.
							</div>
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
								value={receiptData.sumLetters}
								readOnly
							/>
							<div className="invalid-feedback">
								Valid sum is required.
							</div>
						</div>
						{/* Основание */}
						<div className="col-md-8 mb-3">
							<label htmlFor="reason">Основание</label>
							<input
								type="text"
								className="form-control"
								id="docProps-reason"
								placeholder="оплата составления искового заявления и представительства интересов в суде"
								value={receiptData.docProps.reason}
								onChange={onReceiptDataChange}
							/>
							<div className="invalid-feedback">
								Valid organization is required.
							</div>
						</div>
						{/* Приложение */}
						<div className="col-md-4 mb-3">
							<label htmlFor="attachment">Приложение</label>
							<input
								type="text"
								className="form-control"
								id="docProps-attachment"
								placeholder="договор от "
								value={receiptData.docProps.attachment}
								onChange={onReceiptDataChange}
							/>
							<div className="invalid-feedback">
								Valid organization is required.
							</div>
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
								placeholder='ООО \"Юридический центр\"'
								value={receiptData.docProps.organization}
								onChange={onReceiptDataChange}
								required
							/>
							<div className="invalid-feedback">
								Valid organization is required.
							</div>
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
								value={receiptData.docProps.mainAccountant}
								onChange={onReceiptDataChange}
								required
							/>
							<div className="invalid-feedback">
								Valid main accountant is required.
							</div>
						</div>
						{/* Кассир */}
						<div className="col-md-4 mb-3">
							<label htmlFor="cashier">Кассир</label>
							<input
								type="text"
								className="form-control"
								id="docProps-cashier"
								placeholder="Д.А. Пахмутов"
								value={receiptData.docProps.cashier}
								onChange={onReceiptDataChange}
							/>
							<div className="invalid-feedback">
								Valid cashier is required.
							</div>
						</div>
					</div>
				</fieldset>
				{/*  */}
				<button
					className="btn btn-danger btn-md btn-block"
					type="submit"
					onClick={createReceipt}
					>
					Создать новый
				</button>
				&nbsp;
				{/*  */}
				<button
					className="btn btn-danger btn-md btn-block"
					onClick={saveReceipt}
					disabled={isEqual(receiptData, initialReceiptData)}
					>
					Сохранить изменения в БД
				</button>
				&nbsp;
				{/*  */}
				<button
					className="btn btn-danger btn-md btn-block"
					onClick={revertReceipt}
					disabled={isEqual(receiptData, initialReceiptData)}
				>
					Вернуть исходный
				</button>
				&nbsp;
				{/*  */}
				<button
					className="btn btn-danger btn-md btn-block"
					onClick={deleteReceipt}
				>
					Удалить
				</button>
				&nbsp;
				{/*  */}
				<button
					className="btn btn-primary btn-md btn-block"
					onClick={handlePrintWrapper}
				>
					Печать
				</button>
				&nbsp;
				{/*  */}
				{/* <button className="btn btn-danger btn-md btn-block" onClick={generatePDF} >Удалить</button>
                &nbsp; */}
				{/*  */}
			</form>
			<div style={{ display: "none" }}>
				<TempReceiptDoc receiptData={receiptData} ref={componentRef} />
			</div>
		</div>
	);
}

export { TempReceiptForm };
