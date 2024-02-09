import React from "react";
import { useSelector } from "react-redux";
import { TempReceiptForm } from "./TempReceiptForm";
import { TempAnyDoc2 } from "./TempAnyDoc2";

function Doc() {
	const doc = useSelector(state => state.docReducer);

	return (
        <>
            {doc.type === "ПКО" ? <TempReceiptForm /> : <TempAnyDoc2 />}
        </>
    )
}

export { Doc };
