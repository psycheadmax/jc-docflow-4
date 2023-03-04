import React, { useState } from 'react'
// install rubles package 

function TempReceiptForm(props) {
    console.log(props)
    /* component objectives
        - it must receive all person info
        - display form with other neccessary fields
            - checkboxes :
                log to DB?
                generate HTML receipt?
            - show cases (как будет склонено по падежу)
            - show numbers in words

        external fields: 
            1. lastNameGenitive case
            2. firstNameGenitive case
            3. middleNameGenitive case
            4. reason
            5. sum
            6. sum in letters
            7. organization
    */
    const [person, setPerson] = useState([{...props.person}])
    const [receiptData, setReceiptData] = useState([{
        date: 0,
        namesGenitive: [],
        reason: '',
        sum: 0,
        sumLetters: 'ноль рублей 00 копеек',
        organization: 'ООО \"Юридический центр\"',
        mainAccountant: 'Д.А. Пахмутов',
        cashier: 'Д.А. Пахмутов',
    }])
    /* receiptData structure
            {
                date,
                namesGenitive: [],
                reason: '',
                sum: 0,
                sumLetters: 'ноль рублей 00 копеек',
                organization: 'ООО \"Юридический центр\"',
                mainAccountant: 'Д.А. Пахмутов',
                cashier: 'Д.А. Пахмутов',
            }
        */
    const [extratData, setExtraData] = useState([{
        generateReceipt: true,
        saveToDB: true,
    }])
    /* extratData structure
        {
            generateReceipt: true,
            saveToDB: true,
        }
    */
    const [propsReceived, setPropsReceived] = useState(true)

    // useEffect(() => {
    //     if (!propsReceived) {
    //         setPerson({
    //             ...props.person
    //         })
    //     }
    // });

    function onReceiptDataChange(e) {
        // middleName field handler to autocorrect gender
        if (e.target.id === 'middleName' && e.target.value.slice(-1) === 'а') {
            this.setState({
                person: {
                    ...this.state.person,
                    [e.target.id]: e.target.value,
                    gender: 'female'
                } 
            })
        } else {
        // all other cases handler
            this.setState({
                person: {
                    ...this.state.person,
                    [e.target.id]: e.target.value,
                    gender: 'male'
                }
            })
        }
    }

    return(
        <div className="component">
            <form>
            <fieldset>
                    <legend className="bg-light">ФИО</legend>
                    <div className="row">
                        {/* Фамилии */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="lastName">Фамилия</label>
                            <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={person.lastName} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid last NameGenitive is required.
                            </div>
                        </div>
                        {/* Имени */}
                        <div className="col-md-3 mb-1">
                            <label htmlFor="firstNameGenitive">Имени</label>
                            <input type="text" className="form-control" id="firstNameGenitive" placeholder="Иван" value={person.firstName} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid first NameGenitive is required.
                            </div>
                        </div>
                        {/* Отчества */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="middleNameGenitive">Отчества</label>
                            <input type="text" className="form-control" id="middleNameGenitive" placeholder="Иванович" value={person.middleName} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid middle NameGenitive is required.
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">ФИО в падеже</legend>
                    <div className="row">
                        {/* Фамилии */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="lastNameGenitive">Фамилии</label>
                            <input type="text" className="form-control" id="lastNameGenitive" placeholder="Иванов" value={person.lastName} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid last NameGenitive is required.
                            </div>
                        </div>
                        {/* Имени */}
                        <div className="col-md-3 mb-1">
                            <label htmlFor="firstNameGenitive">Имени</label>
                            <input type="text" className="form-control" id="firstNameGenitive" placeholder="Иван" value={person.firstName} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid first NameGenitive is required.
                            </div>
                        </div>
                        {/* Отчества */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="middleNameGenitive">Отчества</label>
                            <input type="text" className="form-control" id="middleNameGenitive" placeholder="Иванович" value={person.middleName} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid middle NameGenitive is required.
                            </div>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
)}

export default TempReceiptForm