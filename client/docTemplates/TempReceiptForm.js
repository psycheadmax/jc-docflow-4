import React, { useState } from 'react'
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux'
import petrovich from 'petrovich'
import TempReceiptGen from './TempReceiptGen'
import { CaseNComponent } from '../components/CaseNComponent';
import axios from 'axios'
require('dotenv').config()

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

const rubles = require('rubles').rubles
const dayjs = require('dayjs')

function TempReceiptForm() {
    const dispatch = useDispatch()
    const person = useSelector(state => state.personReducer.person)
    /* const person = { // for dev
        firstName: 'Иван',
        lastName: 'Иванов',
        middleName: 'Иванович',
    } */

    console.log('person in receipt', person)
    
   const personForPetrovich = {
        first: person.firstName,
        middle: person.middleName,
        last: person.lastName
   }

   const personGenitive = petrovich(personForPetrovich, 'genitive')

    const [receiptData, setReceiptData] = useState({
        idPerson : person._id,
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        lastNameGenitive: personGenitive.last, 
        firstNameGenitive: personGenitive.first, 
        middleNameGenitive: personGenitive.middle, 
        cases: person.cases,
        PKODate: dayjs().format('YYYY-MM-DD'),
        PKONumber: '0001',
        reason: 'оплата оставления искового заявления и представительства', 
        attachment: `договор от ${dayjs().format('DD.MM.YYYY')} г.`,
        sumNumber: 1,
        organization: 'ООО \"Юридический центр\"',
        mainAccountant: 'Д.А. Пахмутов',
        cashier: 'Д.А. Пахмутов',
    })

    const [helpData, setHelpData] = useState({
        saveToDB: true,
    })
    
    const [propsReceived, setPropsReceived] = useState(true)

    const [dangerousData, setDangerousData] = useState('')

    // useEffect(() => {
    //     if (!propsReceived) {
    //         setPerson({
    //             ...props.person
    //         })
    //     }
    // });

    function onReceiptDataChange(e) {
        setReceiptData({
            ...receiptData,
            [e.target.id]: e.target.value
        })
    }

    function createReceipt(e) {
        e.preventDefault()
        console.log('createReceipt clicked')

        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/docs/receipt`, receiptData).then(receipt => {
            alert(`receipt with id ${receipt.data._id} Created!`);
            // this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
        })
    }

    /* function savePerson(e) {
        e.preventDefault();
        correction(e)
        const data = {
            id: person._id,
            ...person
        }
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/`, data).then(person => {
          alert("Person Successfully Updated!");
        //   this.props.history.push(`/person/${this.props.match.params.id}`);
        });
    } */

    return(
        <div className="component">
            <div id="pdf"></div>
            <form>

                <CaseNComponent idPerson={receiptData.idPerson} cases={receiptData.cases}/>

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
                        <div className="col-md-3 mb-3">
                            <label htmlFor="firstNameGenitive">Имя</label>
                            <input type="text" className="form-control" id="firstNameGenitive" placeholder="Иван" value={person.firstName} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid first NameGenitive is required.
                            </div>
                        </div>
                        {/* Отчества */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="middleNameGenitive">Отчество</label>
                            <input type="text" className="form-control" id="middleNameGenitive" placeholder="Иванович" value={person.middleName} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid middle NameGenitive is required.
                            </div>
                        </div>
                    </div>

                </fieldset>
                <fieldset>
                    <legend className="bg-light">ФИО в падеже (автоматически. измените если неправильно)</legend>
                    <div className="row">
                        {/* Фамилии */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="lastNameGenitive">Фамилии</label>
                            <input type="text" className="form-control" id="lastNameGenitive" placeholder="Иванов" value={receiptData.lastNameGenitive} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid last NameGenitive is required.
                            </div>
                        </div>
                        {/* Имени */}
                        <div className="col-md-3 mb-3">
                            <label htmlFor="firstNameGenitive">Имени</label>
                            <input type="text" className="form-control" id="firstNameGenitive" placeholder="Иван" value={receiptData.firstNameGenitive} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid first NameGenitive is required.
                            </div>
                        </div>
                        {/* Отчества */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="middleNameGenitive">Отчества</label>
                            <input type="text" className="form-control" id="middleNameGenitive" placeholder="Иванович" value={receiptData.middleNameGenitive} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid middle NameGenitive is required.
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">Номер ПКО, дата, сумма, основание</legend>
                    <div className="row">
                        {/* Номер ПКО */}
                        <div className="col-md-2 mb-3">
                            <label htmlFor="PKONumber">Номер ПКО</label>
                            <input type="text" className="form-control" id="PKONumber" placeholder="0000" value={receiptData.PKONumber} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid PKO number is required.
                            </div>
                        </div>
                        {/* Дата */}
                        <div className="col-md-2 mb-3">
                            <label htmlFor="PKODate">Дата ПКО</label>
                            <input type="date" className="form-control" id="PKODate" placeholder="01.01.1970" value={receiptData.PKODate} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid PKO date is required.
                            </div>
                        </div>
                        {/* Сумма */}
                        <div className="col-md-2 mb-3">
                            <label htmlFor="sumNumber">Cумма</label>
                            <input type="number" className="form-control" id="sumNumber" min="1" placeholder="1" value={receiptData.sumNumber} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid sum is required.
                            </div>
                        </div>
                        {/* Сумма прописью */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="sumLetters">Cумма прописью (только автоматически)</label>
                            <input type="text" className="form-control" id="sumLetters" placeholder="один рубль 00 копеек" value={rubles(receiptData.sumNumber)} readOnly />
                            <div className="invalid-feedback">
                            Valid sum is required.
                            </div>
                        </div>
                        {/* Основание */}
                        <div className="col-md-8 mb-3">
                            <label htmlFor="reason">Основание</label>
                            <input type="text" className="form-control" id="reason" placeholder='оплата составления искового заявления и представительства интересов в суде' value={receiptData.reason} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid organization is required.
                            </div>
                        </div>
                        {/* Приложение */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="attachment">Приложение</label>
                            <input type="text" className="form-control" id="attachment" placeholder='договор от ' value={receiptData.attachment} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid organization is required.
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {/* Организация */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="organization">Организация</label>
                            <input type="text" className="form-control" id="organization" placeholder='ООО \"Юридический центр\"' value={receiptData.organization} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid organization is required.
                            </div>
                        </div>
                        {/* Главный бухгалтер */}
                        <div className="col-md-4 mb-1">
                            <label htmlFor="mainAccountant">Главный бухгалтер</label>
                            <input type="text" className="form-control" id="mainAccountant" placeholder="Д.А. Пахмутов" value={receiptData.mainAccountant} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid main accountant is required.
                            </div>
                        </div>
                        {/* Кассир */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="cashier">Кассир</label>
                            <input type="text" className="form-control" id="cashier" placeholder="Д.А. Пахмутов" value={receiptData.cashier} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid cashier is required.
                            </div>
                        </div>
                    </div>
                </fieldset>
                <button className="btn btn-danger btn-lg btn-block" type="submit" onClick={createReceipt} >Create receipt</button>
            {
            /* extratData structure
                {
                    generateReceipt: true,
                    saveToDB: true,
                }
            */}
            </form>
        </div>
)}

export { TempReceiptForm }