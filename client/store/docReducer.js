const initialState = {
    doc: {}
}

const ADDDOC = 'ADDDOC'
const REMOVEDOC = 'REMOVEDOC'

export const docReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADDDOC:
            return action.payload
        case REMOVEDOC:
            return initialState
        default:
            return state
    }
}

export const addDocActionCreator = (payload) => ({type: ADDDOC, payload})
export const removeDocActionCreator = () => ({type: REMOVEDOC})
