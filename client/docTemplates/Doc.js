import React from "react";
import { useSelector } from "react-redux";
import { TempReceiptForm } from "./TempReceiptForm";
import { DocWrapper } from "./DocWrapper";

function Doc() {
	const doc = useSelector(state => state.docReducer);

	return (
        <>
            {doc.type === "ПКО" ? <TempReceiptForm /> : <DocWrapper />}
        </>
    )
}

export { Doc };
