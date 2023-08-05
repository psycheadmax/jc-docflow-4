import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux'
import petrovich from 'petrovich'
import TempReceiptGen from './TempReceiptGen'
import { CaseNComponent } from '../components/CaseNComponent';
import { getDataByIdFromURL } from '../functions';
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

    const personForPetrovich = {
         first: person.firstName,
         middle: person.middleName,
         last: person.lastName
    }
 
    const personGenitive = petrovich(personForPetrovich, 'genitive')

    const [receiptData, setReceiptData] = useState({
            idPerson : person._id,
            caseN: person.cases || [], // || []
            type: 'pko', // ПКО, Договор
            description: 'no description',
            date: dayjs().format('YYYY-MM-DD'),
            number: 1,
            sum: 1,
            // sumLetters: rubles(sum),
            // all beyond is AnyDocument-specific
            docProps: {
                    lastNameGenitive: personGenitive.last,
                    firstNameGenitive: personGenitive.first,
                    middleNameGenitive: personGenitive.middle,
                    reason: 'оплата оставления искового заявления и представительства',
                    attachment: `договор от ${dayjs().format('DD.MM.YYYY')} г.`,
                    organization: 'ООО \"Юридический центр\"',
                    mainAccountant: 'Д.А. Пахмутов',
                    cashier: 'Д.А. Пахмутов'
            },
        } ,
    )

      useEffect(() => {
        async function getData() {
            const data = await getDataByIdFromURL('docs')
            console.log('useEffect data: ',data)
            if (data) { setReceiptData(data) }
        }
        getData()
      }, []);

    console.log('person in receipt', person)
    
    /* 
        old data
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
 */

    console.log('initial receiptData: ', receiptData)

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
        const idArray = e.target.id.split('-')
        const idFirst = idArray[0]
        const idSecond = idArray[1]
        if (idArray.length === 1) {
            setReceiptData({
                ...receiptData,
                [e.target.id]: e.target.value
            })
        } else {
            const receiptDataClone = structuredClone(receiptData)
            receiptDataClone[idFirst][idSecond] = e.target.value
            setReceiptData(receiptDataClone)
        }
        console.log('current receiptData: ', receiptData)
    }

    function createReceipt(e) {
        e.preventDefault()
        console.log('createReceipt clicked')
        console.log(`axios post: ${SERVER_IP}:${SERVER_PORT}/api/docs/receipt`)

        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/docs/receipt`, receiptData).then(receipt => {
            alert(`ПКО ${receipt.data._id} создан`);
            // this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
        })
    }

    function saveReceipt() {
        e.preventDefault()
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/docs/`, receiptData).then(doc => { // correct the path !!!
          alert(`Документ ${doc._id} обновлен в БД`);
        //   this.props.history.push(`/person/${this.props.match.params.id}`);
        });
    }

    function revertReceipt() {

    }

    function deleteReceipt() {

    }

    function generatePDF() {

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

                <CaseNComponent idPerson={receiptData.idPerson} cases={receiptData.caseN}/>

                <fieldset>
                    <legend className="bg-light">ФИО</legend>
                    <div className="row">
                        {/* Фамилии */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="lastName">Фамилия</label>
                            <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={person.lastName} readOnly />
                            <div className="invalid-feedback">
                            Valid last NameGenitive is required.
                            </div>
                        </div>
                        {/* Имени */}
                        <div className="col-md-3 mb-3">
                            <label htmlFor="firstNameGenitive">Имя</label>
                            <input type="text" className="form-control" id="firstName" placeholder="Иван" value={person.firstName} readOnly />
                            <div className="invalid-feedback">
                            Valid first NameGenitive is required.
                            </div>
                        </div>
                        {/* Отчества */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="middleNameGenitive">Отчество</label>
                            <input type="text" className="form-control" id="middleName" placeholder="Иванович" value={person.middleName} />
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
                            <input type="text" className="form-control" id="docProps-lastNameGenitive" placeholder="Иванов" value={receiptData.docProps.lastNameGenitive} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid last NameGenitive is required.
                            </div>
                        </div>
                        {/* Имени */}
                        <div className="col-md-3 mb-3">
                            <label htmlFor="firstNameGenitive">Имени</label>
                            <input type="text" className="form-control" id="docProps-firstNameGenitive" placeholder="Иван" value={receiptData.docProps.firstNameGenitive} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid first NameGenitive is required.
                            </div>
                        </div>
                        {/* Отчества */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="middleNameGenitive">Отчества</label>
                            <input type="text" className="form-control" id="docProps-middleNameGenitive" placeholder="Иванович" value={receiptData.docProps.middleNameGenitive} onChange={onReceiptDataChange} />
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
                            <input type="text" className="form-control" id="number" placeholder="0000" value={receiptData.number} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid PKO number is required.
                            </div>
                        </div>
                        {/* Дата */}
                        <div className="col-md-2 mb-3">
                            <label htmlFor="PKODate">Дата ПКО</label>
                            <input type="date" className="form-control" id="date" placeholder="01.01.1970" value={receiptData.date} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid PKO date is required.
                            </div>
                        </div>
                        {/* Сумма */}
                        <div className="col-md-2 mb-3">
                            <label htmlFor="sumNumber">Cумма</label>
                            <input type="number" className="form-control" id="sum" min="1" placeholder="1" value={receiptData.sum} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid sum is required.
                            </div>
                        </div>
                        {/* Сумма прописью */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="sumLetters">Cумма прописью (только автоматически)</label>
                            <input type="text" className="form-control" id="sumLetters" placeholder="один рубль 00 копеек" value={rubles(receiptData.sum)} readOnly />
                            <div className="invalid-feedback">
                            Valid sum is required.
                            </div>
                        </div>
                        {/* Основание */}
                        <div className="col-md-8 mb-3">
                            <label htmlFor="reason">Основание</label>
                            <input type="text" className="form-control" id="docProps-reason" placeholder='оплата составления искового заявления и представительства интересов в суде' value={receiptData.docProps.reason} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid organization is required.
                            </div>
                        </div>
                        {/* Приложение */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="attachment">Приложение</label>
                            <input type="text" className="form-control" id="docProps-attachment" placeholder='договор от ' value={receiptData.docProps.attachment} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid organization is required.
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {/* Организация */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="organization">Организация</label>
                            <input type="text" className="form-control" id="docProps-organization" placeholder='ООО \"Юридический центр\"' value={receiptData.docProps.organization} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid organization is required.
                            </div>
                        </div>
                        {/* Главный бухгалтер */}
                        <div className="col-md-4 mb-1">
                            <label htmlFor="mainAccountant">Главный бухгалтер</label>
                            <input type="text" className="form-control" id="docProps-mainAccountant" placeholder="Д.А. Пахмутов" value={receiptData.docProps.mainAccountant} onChange={onReceiptDataChange} required />
                            <div className="invalid-feedback">
                            Valid main accountant is required.
                            </div>
                        </div>
                        {/* Кассир */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="cashier">Кассир</label>
                            <input type="text" className="form-control" id="docProps-cashier" placeholder="Д.А. Пахмутов" value={receiptData.docProps.cashier} onChange={onReceiptDataChange} />
                            <div className="invalid-feedback">
                            Valid cashier is required.
                            </div>
                        </div>
                    </div>
                </fieldset>
                {/*  */}
                <button className="btn btn-danger btn-lg btn-block" type="submit" onClick={createReceipt} >Создать новый</button>
                &nbsp;
                {/*  */}
                <button className="btn btn-danger btn-lg btn-block" onClick={saveReceipt} >Сохранить изменения в БД</button>
                &nbsp;
                {/*  */}
                <button className="btn btn-danger btn-lg btn-block" onClick={revertReceipt} >Вернуть исходный</button>
                &nbsp;
                {/*  */}
                <button className="btn btn-danger btn-lg btn-block" onClick={deleteReceipt} >Удалить</button>
                &nbsp;
                {/*  */}
                {/* <button className="btn btn-danger btn-lg btn-block" onClick={generatePDF} >Удалить</button>
                &nbsp; */}
                {/*  */}
            </form>
        </div>
)}

export { TempReceiptForm }