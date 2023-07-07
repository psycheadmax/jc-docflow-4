import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { 
    captureActionCreator, 
    removeActionCreator, 
    addressPhoneUpdateActionCreator, 
    birthPassportUpdateActionCreator, 
    personReducer
    } from '../store/personReducer';
import axios from 'axios'
import { CheckBeforeCreate } from '../components/CheckBeforeCreate';
import dayjs from 'dayjs';
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
require('dotenv').config()

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']

function PersonCard() {
    const [showEditButtons, setShowEditButtons] = useState(false)
    const [persons, setPersons] = useState([])
    
    const dispatch = useDispatch()
    const person = useSelector(state => state.personReducer.person)

    console.log('person in state:', person)

    useEffect(() => {
        getPersonIdFromURL()
      }, []);

    function getPersonIdFromURL() { // !!! TODO implement on direct link !!!
        const regex = new RegExp('^\/persons\/[A-Za-z0-9]+')
        const path = window.location.pathname
        if (regex.test(path)) {
            const id = window.location.pathname.slice(9)
            axios.get(`${SERVER_IP}:${SERVER_PORT}/api/persons/${id}`).then(person => {
            dispatch(captureActionCreator(person.data))
        })
        setShowEditButtons(true)
        }
    }

    function onChange(e, index) {
        const idArray = e.target.id.split('-')
        const idFirst = idArray[0]
        const idSecond = idArray[1]
        if (idArray.length === 1) {
            dispatch(captureActionCreator({[e.target.id]: e.target.value}))    
        } else if (idFirst === 'passport' || idFirst === 'birth') {
            const birthPassport = [
                idFirst, idSecond, e.target.value
            ]
            dispatch(birthPassportUpdateActionCreator(birthPassport))
        } else {
            const addressOrPhone = [{
                ...person[idFirst][index],
                [idSecond]: e.target.value
            }, idFirst, index]

            dispatch(addressPhoneUpdateActionCreator(addressOrPhone))
        }

        if (e.target.id === 'middleName') {
            if (e.target.value.slice(-1) === 'а') {
                dispatch(captureActionCreator({gender: 'female'}))    
            } else {
                dispatch(captureActionCreator({gender: 'male'}))
            }
        }
        //  TODO check wether need or not debounce and throttle
        // const debounceFn = debounce(search, 2000)
        // debounceFn()
        // this.search()
    }

    function addAddress(e) {
        e.preventDefault()
        const addressArray = [...person.address]
        addressArray.push({
            description: '',
            city: '',
            street: '',
            building: '',
            appartment: '',
          })
        dispatch(captureActionCreator({address: addressArray}))
    }

    function removeAddress(e, index) {
        e.preventDefault()
        let addressArray = [...person.address]
        addressArray.splice(index, 1)
        dispatch(captureActionCreator({address: addressArray}))
    }

    function addPhone(e) {
        e.preventDefault()
        const phoneArray = [...person.phone]
        phoneArray.push({description: '', number: ''})
        dispatch(captureActionCreator({phone: phoneArray}))
    }

    function removePhone(e, index) {
        e.preventDefault()
        let phoneArray = [...person.phone]
        phoneArray.splice(index, 1)
        dispatch(captureActionCreator({phone: phoneArray}))
    }

    function revert(e) {
        e.preventDefault()
        // TODO dispatch(captureActionCreator({...personClone}))
    }

    function createPerson(e) {
        // TODO add check and modify within DB
        e.preventDefault();
        // TODO correction(e)
        const data = {...person}
        axios.post(`${SERVER_IP}:${SERVER_PORT}/api/persons/`, data).then(person => {
            alert(`Person with id ${person.data._id} Created!`);
            // this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
        })
        setShowEditButtons(true)
    }

    function savePerson(e) {
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
    }

    function deletePerson(e) {
        e.preventDefault();
        axios
          .post(`${SERVER_IP}:${SERVER_PORT}/api/persons/${this.props.match.params.id}`)
          .then(data => {
            alert(`Клиент ${person.lastName} ${person.firstName} ${person.middleName} удален`);
            // this.props.history.push(`/persons/create`); // TODO
            dispatch(removeActionCreator())
            setShowEditButtons(true)
          });
     }

    function correction(e) {
        e.preventDefault()
        const obj = structuredClone(person)
        for (const id in obj) {
            if (typeof obj[id] === 'string') {
                // firstLetterCapitalize
                if (id === 'lastName' || id === 'firstName' || id === 'middleName') {
                    obj[id] = obj[id].charAt(0).toUpperCase() + obj[id].slice(1)
                }
                // trim
                obj[id] = obj[id].trim()
            }
        }
        dispatch(captureActionCreator(obj))
    }

    function receivePerson(person) {
        dispatch(captureActionCreator(person))
    }

    function clearPerson(e) {
        e.preventDefault()
        dispatch(removeActionCreator())
    }

    return (
        <div className="component">
            <form>
                <hr className="mb-4" />
                <fieldset>
                <legend className="bg-light">ФИО</legend>
                <div className="row">
                    {/* Фамилия */}
                    <div className="col-md-4 mb-3">
                        <label htmlFor="lastName">Фамилия</label>
                        <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={person.lastName} onChange={onChange} required />
                        <div className="invalid-feedback">
                        Valid last name is required.
                        </div>
                    </div>
                    {/* Имя */}
                    <div className="col-md-3 mb-1">
                        <label htmlFor="firstName">Имя</label>
                        <input type="text" className="form-control" id="firstName" placeholder="Иван" value={person.firstName} onChange={onChange} required />
                        <div className="invalid-feedback">
                        Valid first name is required.
                        </div>
                    </div>
                    {/* Отчество */}
                    <div className="col-md-4 mb-3">
                        <label htmlFor="middleName">Отчество</label>
                        <input type="text" className="form-control" id="middleName" placeholder="Иванович" value={person.middleName} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid middle name is required.
                        </div>
                    </div>
                    {/* Пол */}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="gender">Пол</label>
                        <select id="gender" className="form-select" value={person.gender} onChange={onChange}>
                            <option value="male">муж</option>
                            <option value="female">жен</option>
                        </select>
                    </div>
                </div>
                </fieldset>
                <fieldset>
                <legend className="bg-light">ПАСПОРТ</legend>
                <div className="row">
                    {/* Серия паспорта*/}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="passport-serie">Серия</label>
                        <input type="number" className="form-control" id="passport-serie" placeholder="8700" value={person.passport.serie} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid passport serie is required.
                        </div>
                    </div>
                    {/* Номер паспорта */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="passport-number">Номер</label>
                        <input type="number" className="form-control" id="passport-number" placeholder="123456" value={person.passport.number} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid passport number is required.
                        </div>
                    </div>
                    {/* Дата Рождения */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="birth-date">Дата рождения</label>
                        <input type="date" className="form-control" id="birth-date" placeholder="" value={dayjs(person.birth.date).format('YYYY-MM-DD')} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid date is required.
                        </div>
                    </div>
                    {/* Место рождения */}
                    <div className="col-md-6 mb-3">
                        <label htmlFor="birth-place">Место рождения</label>
                        <input type="text" className="form-control" id="birth-place" placeholder="Иванович" value={person.birth.place} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid middle name is required.
                        </div>
                    </div>
                    {/* Дата выдачи паспорта */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="passport-date">Дата выдачи</label>
                        <input type="date" className="form-control" id="passport-date" placeholder="Иванович" value={dayjs(person.passport.date).format('YYYY-MM-DD')} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid date is required.
                        </div>
                    </div>
                    {/* Место выдачи паспорта */}
                    <div className="col-md-4 mb-3">
                        <label htmlFor="passport-place">Место выдачи</label>
                        <input type="text" className="form-control" id="passport-place" placeholder="Иванович" value={person.passport.place} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid issue place is required.
                        </div>
                    </div>
                    {/* Код подразделения */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="passport-code">Passport code</label>
                        <input type="text" className="form-control" id="passport-code" placeholder="110-003" value={person.passport.code} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid number is required.
                        </div>
                    </div>
                </div>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">ИНН, СНИЛС</legend>
                <div className="row">
                    {/* ИНН Номер */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="innNumber">ИНН</label>
                        <input type="number" className="form-control" id="innNumber" placeholder="110300400500" value={person.innNumber} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid number is required.
                        </div>
                    </div>
                    {/* СНИЛС Номер */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="snilsNumber">СНИЛС</label>
                        <input type="text" className="form-control" id="snilsNumber" placeholder="111-222-333 44" value={person.snilsNumber} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid number is required.
                        </div>
                    </div>
                </div>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">АДРЕСА</legend>
                {person.address.map((el, index) => {
                    return(
                        <div className="row">
                            <h3>Адрес {el.description}</h3>
                        {/* Город */}
                        <div className="col-md-2 mb-3">
                            <label htmlFor="address-city">Город</label>
                            <input type="text" className="form-control" id="address-city" placeholder="Воркута" value={el.city} onChange={(e) => onChange(e, index)} />
                            <div className="invalid-feedback">
                            Valid city is required.
                            </div>
                        </div>
                        {/* Улица */}
                        <div className="col-md-3 mb-3">
                            <label htmlFor="address-street">Улица</label>
                            <input type="text" className="form-control" id="address-street" placeholder="пл. им. Красной площади" value={el.street} onChange={(e) => onChange(e, index)} />
                            <div className="invalid-feedback">
                            Valid street is required.
                            </div>
                        </div>
                        {/* Дом */}
                        <div className="col-md-1 mb-3">
                            <label htmlFor="address-building">Здание</label>
                            <input type="text" className="form-control" id="address-building" placeholder="123/1 А" value={el.building} onChange={(e) => onChange(e, index)} />
                            <div className="invalid-feedback">
                            Valid building is required.
                            </div>
                        </div>
                        {/* Квартира */}
                        <div className="col-md-1 mb-3">
                            <label htmlFor="address-appartment">Квартира</label>
                            <input type="text" className="form-control" id="address-appartment" placeholder="188" value={el.appartment} onChange={(e) => onChange(e, index)} />
                            <div className="invalid-feedback">
                            Valid appartments number is required.
                            </div>
                        </div>
                        <div className="col-md-1 mb-3">
                            <button className="btn btn-outline-danger btn-sm btn-block" onClick={(e) => removeAddress(e, index)} >удалить</button>
                        </div>
                    </div>
                    )
                })}
                    <button className="btn btn-light btn-lg btn-block" onClick={addAddress} >добавить адрес</button>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">ТЕЛЕФОНЫ</legend>
                        {person.phone.map((el, index) => {
                                return(
                                    <div className="row" key={index}>
                                    {/* Телефон*/}
                                        <div className="col-md-2 mb-3">
                                            <input type="tel" className="form-control" id="phone-number" placeholder="89121234567" maxLength="11" value={el.number} onChange={(e) => onChange(e, index)} />
                                            <div className="invalid-feedback">
                                            Valid phone number is required.
                                            </div>
                                        </div>
                                        <div className="col-md-2 mb-3">
                                            <input type="text" className="form-control" id="phone-description" placeholder="сотовый" value={el.description} onChange={(e) => onChange(e, index)} />
                                            <div className="invalid-feedback">
                                            Valid phone number is required.
                                            </div>
                                        </div>
                                        <div className="col-md-1 mb-3">
                                            <button className="btn btn-outline-danger btn-sm btn-block" onClick={(e) => removePhone(e, index)} >удалить</button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                <button className="btn btn-light btn-lg btn-block" onClick={addPhone} >добавить телефон</button>
                </fieldset>
                {/* Комментарий */}
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <label htmlFor="comment">Комментарий</label>
                        <input type="text" className="form-control" id="comment" placeholder="какой-то текст...." value={person.comment} onChange={onChange} />
                        <div className="invalid-feedback">
                        Valid appartments number is required.
                        </div>
                    </div>
                </div>
                {/* КНОПКИ */}
                <button className="btn btn-success btn-lg btn-block" onClick={clearPerson} >Очистить</button>
                &nbsp;
                {!showEditButtons && (<button className="btn btn-success btn-lg btn-block" type="submit" onClick={createPerson} >Создать</button>)}
                &nbsp;
                {showEditButtons && (<button className="btn btn-primary btn-lg btn-block" onClick={savePerson} >Сохранить</button>)}
                &nbsp;
                {showEditButtons && (<button className="btn btn-warning btn-lg btn-block" onClick={revert} >Вернуть</button>)}
                &nbsp;
                {showEditButtons && (<button className="btn btn-danger btn-lg btn-block" onClick={deletePerson} >Удалить</button>)}
                &nbsp;

                {/* { (persons.length) ? `Found ${persons.length} entries` : null}
                <ul className="list-group">
                {persons.map((person, index) => (
                    <li className="list-group-item" key={index}>
                        <Link to={{
                        pathname: `/persons/${person._id}`,
                        propsPerson: person
                        }}>
                            {person.lastName} {person.firstName} {person.middleName}
                        </Link>
                    </li>
                ))}
                </ul> */}
            </form>
            <CheckBeforeCreate receivePerson={receivePerson} person={person}/>
        </div>
    )
}

// export default withRouter(PersonCard)
export { PersonCard }