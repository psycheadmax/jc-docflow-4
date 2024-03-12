import axios from "axios";
import { useDispatch } from 'react-redux';
require("dotenv").config();

const dayjs = require("dayjs");

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function getDataByIdFromURL(dataType) {
	// !!! TODO implement on direct link !!!
	const regex = new RegExp("^/" + dataType + "/id[A-Za-z0-9]+");
	const path = window.location.pathname;
	const pathArray = path.split("/");
	const id = pathArray[pathArray.length - 1];
	if (regex.test(path)) {
		console.log(path, "passed");
		return new Promise((resolve, reject) => {
			console.log(
				`from Promise: ${SERVER_IP}:${SERVER_PORT}/api/${dataType}/${id}`
			);
			axios
				.get(`${SERVER_IP}:${SERVER_PORT}/api/${dataType}/${id}`)
				.then((item) => {
					console.log(item.data);
					resolve(item.data);
				});
		});
	}
}

function createTokens(person) {
	console.log("person from createTokens: ");
	console.log(person);
	let tokensArray = [
		["%ФАМИЛИЯ%", person.lastName],
		["%ИМЯ%", person.firstName],
		["%ОТЧЕСТВО%", person.middleName],
		["%ПОЛ%", person.gender],
		["%ИНН%", person.innNumber],
		["%СНИЛС%", person.snilsNumber],
		["%ДАТАРОЖДЕНИЯ%", person.birthDate],
		["%МЕСТОРОЖДЕНИЯ%", person.birthPlace],
		["%ПАСПОРТСЕРИЯ%", person.passportSerie],
		["%ПАСПОРТНОМЕР%", person.passportNumber],
		["%ПАСПОРТДАТА%", person.passportDate],
		["%ПАСПОРТМЕСТО%", person.passportPlace],
		["%ПАСПОРТКОД%", person.passportCode],
	];

	person.address.forEach((item) => {
		tokensArray.push([
			"%АДРЕСИНДЕКС" + item.description.toUpperCase() + "%",
			item.index,
		]);
		tokensArray.push([
			"%АДРЕССУБЪЕКТ" + item.description.toUpperCase() + "%",
			item.subject,
		]);
		tokensArray.push([
			"%АДРЕСГОРОД" + item.description.toUpperCase() + "%",
			item.city,
		]);
		tokensArray.push([
			"%АДРЕСНАСПУНКТ" + item.description.toUpperCase() + "%",
			item.settlement,
		]);
		tokensArray.push([
			"%АДРЕСУЛИЦА" + item.description.toUpperCase() + "%",
			item.street,
		]);
		tokensArray.push([
			"%АДРЕСДОМ" + item.description.toUpperCase() + "%",
			item.building,
		]);
		tokensArray.push([
			"%АДРЕСКВАРТИРА" + item.description.toUpperCase() + "%",
			item.appartment,
		]);
	});

	person.phone.forEach((item) => {
		tokensArray.push([
			"%ТЕЛЕФОН" + item.description.toUpperCase() + "%",
			item.number,
		]);
	});

	return tokensArray;
}

function fromTokensToResult(tokensArray, content) {
	tokensArray.forEach((item) => {
		content = content.replaceAll(item[0], item[1]);
	});

	return content;
}

function getUnusedNumbers(arr) {
    let uniqueArr = Array.from(new Set(arr)); // Remove duplicates
    let result = [];
    uniqueArr.sort((a, b) => a - b); // Sort the array in ascending order
    for (let i = 0; i < uniqueArr.length - 1; i++) {
      let diff = uniqueArr[i + 1] - uniqueArr[i];
      if (diff > 1) {
        for (let j = 1; j < diff; j++) {
          result.push(uniqueArr[i] + j);
        }
      }
    }
    
    if (uniqueArr.length > 0) {
      let max = Math.max(...uniqueArr);
    //   result.push(max + 1);
      result.unshift(max + 1);
    } else {
        result.push(1)
    }
    
    return result;
  }

async function getCurrentYearNumbers(docTtype) {
	try {
		const currentYear = new Date().getFullYear();
		const currentYearStart = new Date(currentYear, 0, 1).toISOString(); // Start of the current year
		const nextYearStart = new Date(currentYear + 1, 0, 1).toISOString(); // Start of the next year

		const filter = {
			type: "docType",
			date: {
				$gte: currentYearStart, // Greater than or equal to the start of the current year
				$lt: nextYearStart, // Less than the start of the next year
			},
		};

		const response = await axios.post(
			`${SERVER_IP}:${SERVER_PORT}/api/docs/search`,
			filter
		);

		const numArr = response.data.map((item) => {
			return item.number;
		});

		return numArr;
	} catch (error) {
		// handle potential errors here
		console.error("Error retrieving documents:", error);
		return null; // Or throw the error if you want handle it further up the call stack
	}
}

function paymentsSchedule(total = 120000, initialSum = 25000, intervalSum = 8000, payMultiplier = 1, payPeriod = 'month') {
	// const total = 120000
	// const initialSum = 25000
	// const intervalSum = 8000
	// const payPeriod = 'month' // variants are: week, 2 weeks, 3 weeks, month, 2 months, 3 months

	const initialPaySums = [25000, 12000, 11000] // first paySums. others will be calculated automatically

	// result must be array of 2-element arrays where first is a sum, second is date
	
	//const paymentDates = // exact dates of the payments

	let restSum = total - initialSum
	let  paySums = []
	paySums.push(initialSum)
	
	while (restSum > 0) {
	  if (restSum > intervalSum) {
	    	restSum = restSum - intervalSum
		  	paySums.push(intervalSum)  
	  } else {
	    paySums.push(restSum)
	    break
	  }
	}
	
	const schedule = paySums.map((item, index) => {
		return [item, dayjs().add(index+payMultiplier, payPeriod).format('DD.MM.YYYY').toString()]
	})

	console.log('schedule', schedule)
}

export {
	getDataByIdFromURL,
	createTokens,
	fromTokensToResult,
	getUnusedNumbers,
	getCurrentYearNumbers,
	paymentsSchedule
};
