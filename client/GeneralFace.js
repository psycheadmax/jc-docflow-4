import React from 'react'

function GeneralFace(props) {
    return (
        <div className="component">
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="firstName">First name</label>
                    <input type="text" className="form-control" id="firstName" placeholder="Иван" value={props.firstName} onChange={props.changeHandler} required />
                    <div className="invalid-feedback">
                    Valid first name is required.
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="middleName">MIddle name</label>
                    <input type="text" className="form-control" id="firstName" placeholder="Иванович" value={props.middleName} onChange={props.changeHandler} />
                    <div className="invalid-feedback">
                    Valid middle name is required.
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="lastName">Last name</label>
                    <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={props.lastName} onChange={props.changeHandler} required />
                    <div className="invalid-feedback">
                    Valid last name is required.
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="birthday">Birthday</label>
                    <input type="date" className="form-control" id="birthday" placeholder="" value={props.birthday} onChange={props.changeHandler} />
                    <div className="invalid-feedback">
                    Valid date is required.
                    </div>
                </div>
                
                
            </div>
        </div>
    )
}

// TO CREATE IDs:
// TEMPLATE 'Возражения Воркутинские ТЭЦ'
// middleName
// dateOfBirth
// addrSubject (спор)
// addrPostal (корр)
// courtDocNum
// сourt


// header
// const HEADER_TO
// const HEADER_FROM
// const HEADER_FROM_ADDR

// title
// const TITLE

// body
// const BODY = []

// ask
// const ASK = []

// attachment
// const ATT = []

export default GeneralFace