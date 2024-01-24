import axios from "axios";
import { useDispatch } from 'react-redux';
require("dotenv").config();

const SERVER_PORT = process.env["SERVER_PORT"];
const SERVER_IP = process.env["SERVER_IP"];

function getDataByIdFromURL(dataType) {
	// !!! TODO implement on direct link !!!
	console.log("getDataByIdFromURL called");
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

function getUnusedPKONumbers(arr) {
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

async function getCurrentYearPKONumbers() {
	try {
		const currentYear = new Date().getFullYear();
		const currentYearStart = new Date(currentYear, 0, 1).toISOString(); // Start of the current year
		const nextYearStart = new Date(currentYear + 1, 0, 1).toISOString(); // Start of the next year

		const filter = {
			type: "ПКО",
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
		console.error("Error retrieving PKO documents:", error);
		return null; // Or throw the error if you want handle it further up the call stack
	}
}

export {
	getDataByIdFromURL,
	createTokens,
	fromTokensToResult,
	getUnusedPKONumbers,
	getCurrentYearPKONumbers
};
