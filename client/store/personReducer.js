const initialState = {
    person: {
        lastName: '',
        firstName: '',
        middleName: '',
        gender: '',
        innNumber: '',
        snilsNumber: '',
        birthDate: '',
        birthPlace: '',
        passportSerie: '',
        passportNumber: '',
        passportDate: '',
        passportPlace: '',
        passportCode: '',
        address: [{
          type: '', // регистрации, проживания, почтовый etc
          subject: '',
          city: '',
          settlement: '',
          street: '',
          building: '',
          appartment: '',
        }],
        phone: [{
          description: '', // основной, дополнительный, рабочий etc
          number: ''
        }], 
        email: '',
        comment: '',
      //   cases: [{
      //     idCase: { type: Schema.ObjectId, ref: 'cases' },
      // }]
    }
}

const CAPTURE = 'CAPTURE'
const ADDRESSPHONEUPDATE = 'ADDRESSPHONEUPDATE'
const BIRTHPASSPORTUPDATE = 'BIRTHPASSPORTUPDATE'
const REMOVE = 'REMOVE'


export const personReducer = (state = initialState, action) => {
  const stateClone = structuredClone(state)
  switch (action.type) {
    case CAPTURE:
          const obj = Object.assign(
              {...state.person},
              {...action.payload}
            )
          return {person: obj}
        case ADDRESSPHONEUPDATE: 
              const dataAP = action.payload[0]
              const idFirstAP = action.payload[1]
              const indexAP = action.payload[2]

              function returnArray(arr) {
                return arr.map((item, index) => {
                  if (index !== indexAP) {
                    return item
                  }
                  return {
                    ...item,
                    ...dataAP
                  }
                })
              }
              stateClone.person[idFirstAP] = returnArray(stateClone.person[idFirstAP])
              return stateClone
        case BIRTHPASSPORTUPDATE:
          const idFirstBP = action.payload[0]
          const idSecondBP = action.payload[1]
          const valueBP = action.payload[2]
          stateClone.person[idFirstBP][idSecondBP] = valueBP
          return stateClone
        case REMOVE:
            return initialState
        default:
            return state
    }
}

export const captureActionCreator = (payload) => ({type: CAPTURE, payload})
export const addressPhoneUpdateActionCreator = (payload) => ({type: ADDRESSPHONEUPDATE, payload})
export const birthPassportUpdateActionCreator = (payload) => ({type: BIRTHPASSPORTUPDATE, payload})
export const removeActionCreator = () => ({type: REMOVE})
