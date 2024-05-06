import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
	addTemplateActionCreator,
	removeTemplateActionCreator,
} from "../store/templateReducer";
import {
	addDocActionCreator,
	removeDocActionCreator,
} from "../store/docReducer";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../components/Modal";

import htmlDocx from "html-docx-js";
import { saveAs } from "file-saver";

import {
	createTokens,
	fromTokensToResult,
	getDataByIdFromURL,
	paymentsSchedule,
} from "../functions";


const dayjs = require("dayjs");

function Tokens({ tokens }) {
	const [modalActive, setModalActive] = useState(false);
	return (
		<>
			<div className="col-md-12 mb-3">
				<button
					className="btn btn-outline-primary btn-md btn-block btn-sm"
					onClick={() => setModalActive(true)}
				>
					Доступные токены
				</button>
			</div>
			<Modal active={modalActive} setActive={setModalActive}>
				{/* TOKENS */}
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						justifyContent: "space-evenly",
					}}
				>
					{tokens.map(
						(element, index) =>
							element[1] && (
								<div
									key={index}
									style={{
										border: "1px solid gray",
										paddingLeft: "2px",
										paddingRight: "2px",
									}}
								>
									<span className="span-token" title={element[1]}>{element[0]}</span>
								</div>
							)
					)}
				</div>
				{/* TOKENS END */}
			</Modal>
		</>
	);
}

export { Tokens };
