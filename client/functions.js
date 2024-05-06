import axios from "axios";
import { useDispatch } from "react-redux";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
// dayjs().format('DD MMMM YYYYг.'); // 01 марта 2021г.

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

function deleteRub(str) {
	if (!str) {
		return false
	}
	const one = str.replace(" рубль 00 копеек", "");
	const two = one.replace(" рубля 00 копеек", "");
	const three = two.replace(" рублей 00 копеек", "");
	return three;
}

function createTokens(data) {
	const tokensArray = [];
	// GENERAL TOKENS
	tokensArray.push(["%ОРГ%", 'ООО "Юридический центр"']);
	tokensArray.push(["%ОРГДИРЕКТОР%", "Пахмутов Дмитрий Александрович"]);
	tokensArray.push(["%ОРГТЕЛЕФОН%", "8-912-957-77-77"]);

	// PERSON TOKENS
	data.lastName && tokensArray.push(["%ФАМИЛИЯ%", data.lastName]);
	data.firstName && tokensArray.push(["%ИМЯ%", data.firstName]);
	data.middleName && tokensArray.push(["%ОТЧЕСТВО%", data.middleName]);
	data.middleName &&
		tokensArray.push([
			"%И_О_ФАМИЛИЯ%",
			`${data.firstName[0]}. ${data.middleName[0]}. ${data.lastName}`,
		]);
	data.gender && tokensArray.push(["%ПОЛ%", data.gender]);
	data.innNumber && tokensArray.push(["%ИНН%", data.innNumber]);
	data.snilsNumber && tokensArray.push(["%СНИЛС%", data.snilsNumber]);
	data.birthDate &&
		tokensArray.push([
			"%ДАТАРОЖДЕНИЯ%",
			dayjs(data.birthDate).format("DD.MM.YYYY"),
		]);
	data.birthPlace && tokensArray.push(["%МЕСТОРОЖДЕНИЯ%", data.birthPlace]);
	data.passportSerie &&
		tokensArray.push(["%ПАСПОРТСЕРИЯ%", data.passportSerie]);
	data.pasportNumber &&
		tokensArray.push(["%ПАСПОРТНОМЕР%", data.passportNumber]);
	data.passportDate &&
		tokensArray.push([
			"%ПАСПОРТДАТА%",
			dayjs(data.passportDate).format("DD.MM.YYYY"),
		]);
	data.passportPlace &&
		tokensArray.push(["%ПАСПОРТМЕСТО%", data.passportPlace]);
	data.passportCode && tokensArray.push(["%ПАСПОРТКОД%", data.passportCode]);

	data.address &&
		data.address.forEach((item) => {
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

	data.phone &&
		data.phone.forEach((item) => {
			tokensArray.push([
				"%ТЕЛЕФОН" + item.description.toUpperCase() + "%",
				item.number,
			]);
		});

	return tokensArray;
}

function fromTokensToResult(tokensArray, content, gender) {
	// tokens replace
	tokensArray.forEach((item) => {
		content = content.replaceAll(item[0], item[1]);
	});

	// console.log("gender:", gender);
	// gender dependent words replacing @был-была@
	// const regex = /^@[а-яА-Яa-zA-Z]+-[а-яА-Яa-zA-Z]+@$/g
	const regex = /@([аА-яЯ]+)-([аА-яЯ]+)@/g;
	let output = content.replace(regex, (match, part1, part2) => {
		return (gender === "male" ||
		gender === "м" ||
		gender === "муж")
		? part1
		: part2;
	});

	// (!regex.test(content) && content.includes('@')  || content.includes('%')) &&
	// alert(`Кажется в шаблоне есть несработавшие токены`)
	
	return output;
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
		result.push(1);
	}

	return result;
}

async function getCurrentYearNumbers(docType) {
	try {
		const currentYear = new Date().getFullYear();
		const currentYearStart = new Date(currentYear, 0, 1).toISOString(); // Start of the current year
		const nextYearStart = new Date(currentYear + 1, 0, 1).toISOString(); // Start of the next year

		const filter = {
			type: docType,
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
				return item.number
		});

		return numArr;
	} catch (error) {
		// handle potential errors here
		console.error("Error retrieving documents:", error);
		return null; // Or throw the error if you want handle it further up the call stack
	}
}

/* function paymentsSchedule(
	total = 120000,
	initialSum = 25000,
	intervalSum = 8000,
	payMultiplier = 1,
	payPeriod = "month"
) {

	let restSum = total - initialSum;
	let paySums = [];
	paySums.push(initialSum);

	while (restSum > 0) {
		if (restSum > intervalSum) {
			restSum = restSum - intervalSum;
			paySums.push(intervalSum);
		} else {
			paySums.push(restSum);
			break;
		}
	}

	const schedule = paySums.map((item, index) => {
		return [
			item,
			dayjs()
				.add(index + payMultiplier, payPeriod)
				.format("DD.MM.YYYY")
				.toString(),
		];
	});

	return schedule;
} */

function paymentsSchedule(
	total = 120000,
	initialSum = 25000,
	intervalSum = 8000,
	payMultiplier = 1,
	payPeriod = "month"
  ) {

	if (!total || !initialSum || !intervalSum  || !payMultiplier || !payPeriod) {
		return ['введены не все значения для расчет графика платежей']
	}
	if ((total < initialSum) || (total < intervalSum)) {
		return ['сумма не может быть меньше первого платежа или последующего платежа']
	}
	
	let restSum = total - initialSum;
	let paySums = [initialSum];
  
	const numberOfPayments = Math.ceil(restSum / intervalSum);
	const lastPayment = restSum % intervalSum || intervalSum;
  
	for (let i = 1; i <= numberOfPayments; i++) {
	  if (i === numberOfPayments) {
		paySums.push(lastPayment);
	} else {
		paySums.push(intervalSum);
	  }
	}
	
	console.log('paySums', paySums)
	const schedule = paySums.map((item, index) => {
		return [
			item,
			dayjs()
				.add((index + 1) * payMultiplier, payPeriod)
				.format("DD.MM.YYYY")
				.toString(),
		];
	});

	console.log('schedule', schedule)
  
	return schedule;
  }  

export {
	getDataByIdFromURL,
	deleteRub,
	createTokens,
	fromTokensToResult,
	getUnusedNumbers,
	getCurrentYearNumbers,
	paymentsSchedule,
};
