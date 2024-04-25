import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux'
import petrovich from 'petrovich'
import TempReceiptGen from './TempReceiptGen'
import { CaseNComponent } from '../components/CaseNComponent';
import { getDataByIdFromURL } from '../functions';
import axios from 'axios'
require('dotenv').config()
import { TempReceiptDoc } from './TempReceiptDoc'
import './TempAnyDoc.css'
import { useReactToPrint } from 'react-to-print'
// import HTMLtoDOCX from 'html-to-docx' // MAY BE IT CAUSES ERROR
import { saveAs } from 'file-saver';
import { renderToString } from 'react-dom/server'

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

const rubles = require('rubles').rubles
const dayjs = require('dayjs')

function Page(values) {
    // TODO MOVE STATES HERE
    return(
        <>
            <div className="section-header" contentEditable>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda tenetur, neque excepturi quam autem aliquam consectetur distinctio voluptates dolorum voluptatum doloribus tempora culpa quis eveniet quisquam iusto odit corrupti modi!
            </div>
            <div className="section-title" contentEditable>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            </div>
            <div className="section-main" id="editable" contentEditable onChange={values.onValueChange}>
                {values.value}
            </div>
            <div className="section-ask"contentEditable>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. 
                Explicabo deserunt et expedita? 
                Minus animi enim distinctio rerum ratione expedita quidem consectetur et labore, molestiae ab illo, soluta adipisci numquam itaque.
            </div>
            <div className="section-att" contentEditable>
                Lorem ipsum dolor sit amet
                consectetur adipisicing elit. 
                Laborum unde commodi nesciunt asperiores minus
                neque odit! Expedita laborum quas doloribus soluta? 
                Qui in voluptates dignissimos voluptate 
                exercitationem natus eveniet quibusdam.
            </div>
            <div className="section-footer" contentEditable>
                <div className="section-footer-col"contentEditable>VIII.XI.MMXXIII</div>
                <div className="section-footer-col"contentEditable>Lorem I.D.</div>
            </div>
        </>
    )
}

function TempAnyDoc() {

    const dispatch = useDispatch()
    const person = useSelector(state => state.personReducer.person)

    document.getElementById('editable').addEventListener('input', onValueChange(e), false)

    const [value1, setValue1] = useState(
        `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eaque dolores, vitae corrupti distinctio quidem fuga rem quod possimus fugiat tempore et perspiciatis corporis totam laudantium alias delectus officia. Corrupti, cum.
                Nihil odio et accusamus laudantium mollitia, earum nostrum doloribus iste ullam, voluptatibus repellendus excepturi dignissimos magnam suscipit expedita eius hic voluptatem quas repudiandae quaerat maiores error ad quo est! Quasi.
                Illum aperiam fugiat deleniti atque voluptas totam nihil in sequi eaque dolorem, dignissimos repudiandae, temporibus, voluptate natus autem. Non vel, possimus nihil soluta enim corrupti distinctio odio voluptatum assumenda! Saepe?`
    )


    function onValueChange(e) {
        console.log('fire!')
        setValue1(e.target.value)
    }

    console.log('person: ')
    console.log(person)
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

    const componentRef = useRef()

    function handlePrintWrapper(e) {
        e.preventDefault()
        handlePrint()
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current
    })

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

    function onSumChange(e) {
        setReceiptData({
            ...receiptData,
            [e.target.id]: e.target.value,
            sumLetters: deleteRub(rubles(e.target.value))
        })
    }

    
    function renderCompToString(e) {
        e.preventDefault()
        const str = renderToString(<Page value={value1} />)
        console.log(str)
    }

    return(
        <div>
            <Page value={value1} onChange={onValueChange} />
            {/*  */}
            <button className="btn btn-danger btn-md btn-block" type="submit" onClick={renderCompToString} >Стринг</button>
            &nbsp;
        </div>
    )
}

export { TempAnyDoc }