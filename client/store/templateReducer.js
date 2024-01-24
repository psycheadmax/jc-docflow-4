const initialState = {
    template: {}
}

const ADDTEMPLATE = 'ADDTEMPLATE'
const REMOVETEMPLATE = 'REMOVETEMPLATE'

export const templateReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADDTEMPLATE:
            return action.payload
        case REMOVETEMPLATE:
            return initialState
        default:
            return state
    }
}

export const addTemplateActionCreator = (payload) => ({type: ADDTEMPLATE, payload})
export const removeTemplateActionCreator = () => ({type: REMOVETEMPLATE})
