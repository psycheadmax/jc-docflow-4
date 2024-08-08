const initialState = {
    case: {
        // caseTitle: "",
		// caseDate: "",
		// caseCategory: "",
		// caseReceivedDocs: [],
		// caseFlow: [],
		// caseReminder: [],
		// comment: "",
        // caseProps: {
            // agreement: {
            //     totalSum: 100,
            //     agreementDate: "",
            //     agreementNumber: 1,
            //     payVariant: "в начале",
                // 	initialSum: Number,
                // 	intervalSum: Number,
                // 	payPeriod: String,
                //  payPeriodMultiplier: Number,
            // }
        // }
    }
}

const ADDCASE = 'ADDCASE'
const REMOVECASE = 'REMOVECASE'

export const caseReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADDCASE:
            return action.payload
        case REMOVECASE:
            return initialState
        default:
            return state
    }
}

export const addCaseActionCreator = (payload) => ({type: ADDCASE, payload})
export const removeCaseActionCreator = () => ({type: REMOVECASE})
