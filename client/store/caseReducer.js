const initialState = {
    case: {}
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
