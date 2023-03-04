import React from 'react'
import { withRouter } from 'react-router-dom';
import axios from 'axios'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import CheckBeforeCreate from './CheckBeforeCreate';

const emptyPerson = {
    lastName: '',
    firstName: '',
    middleName: '',
    gender: '',
    innNumber: '',
    snilsNumber: '',
    birthDate: '', 
    birthPlace: '',
    passSerie: '',
    passNumber: '',
    passIssueDate: '',
    passIssuePlace: '',
    passCode: '',
    addrRegCity: '',
    addrRegStreet: '',
    addrRegBuilding: '',
    addrRegAppt: '',
    addrFactCity: '',
    addrFactStreet: '',
    addrFactBuilding: '',
    addrFactAppt: '',
    phone1: '',
    phone2: '',
    phone3: '',
    phone4: '',
    comment: ''
}

class PersonCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            persons: [],
            person: {...emptyPerson},
            showEditButtons: false
        };

        this.onChange = this.onChange.bind(this)
        this.revert = this.revert.bind(this)
        this.haveChanges = this.haveChanges.bind(this)
        this.createPerson = this.createPerson.bind(this)
        this.savePerson = this.savePerson.bind(this)
        this.deletePerson = this.deletePerson.bind(this)
        this.correction = this.correction.bind(this)
        this.getPersonIdFromURL = this.getPersonIdFromURL.bind(this)
        this.search = this.search.bind(this)
        this.receivePerson = this.receivePerson.bind(this)
    }

    componentDidMount() {
        this.getPersonIdFromURL()
    }

    getPersonIdFromURL() {
        const regex = new RegExp('^\/persons\/[A-Za-z0-9]+')
        const path = window.location.pathname
        if (regex.test(path)) {
            const id = window.location.pathname.slice(9)
            axios.get(`http://localhost:3333/api/persons/${id}`).then(person => {
            this.setState({
                person: {...person.data},
                showEditButtons: true
            })
        })
        }
    }

    onChange(e) {
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
        const debounceFn = debounce(this.search, 2000)
        debounceFn()
        // this.search()
    }

    search() {
        const data = {
            lastName: { $regex: this.state.person.lastName },
            firstName: { $regex: this.state.person.firstName },
            middleName: { $regex: this.state.person.middleName },
        }
        axios.post("http://localhost:3333/api/search", data).then(persons => {
            this.setState({
              persons: persons.data
            })
        });
      }

    revert() {
        this.setState({
            person: {...this.props.location.propsPerson}
        })
    }

    haveChanges() {
        if (JSON.stringify({...this.props.location.propsPerson}) === JSON.stringify(this.state.person)) {
            return false
        } else {
            return true
        }
    }

    createPerson(e) {
        // TODO add check and modify within DB
        e.preventDefault();
        this.correction(e)
        const data = {
            ...this.state.person
        }
        axios.post("http://localhost:3333/api/persons/", data).then(person => {
            alert(`Person with id ${person.data._id} Created!`);
            this.props.history.push(`/persons/${person.data._id}`);
        })
        this.setState({
            showEditButtons: true
        })
        
    }

    savePerson(e) {
        e.preventDefault();
        this.correction(e)
        const data = {
            id: this.state.person._id,
            ...this.state.person
        }
        axios.post("http://localhost:3333/api/persons/", data).then(person => {
          alert("Person Successfully Updated!");
          this.props.history.push(`/person/${this.props.match.params.id}`);
        });
    }

    deletePerson(e) {
        e.preventDefault();
        axios
          .post(`http://localhost:3333/api/persons/${this.props.match.params.id}`)
          .then(data => {
            alert(`Клиент ${this.state.person.lastName} ${this.state.person.firstName} ${this.state.person.middleName} удален`);
            this.props.history.push(`/persons/create`);
            this.setState({
                person: {...emptyPerson},
                showEditButtons: false
            })
          });
    }

    correction(e) {
        e.preventDefault()
        const obj = structuredClone(this.state.person)
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
        this.setState({
            person: {...obj}
        })
    }

    receivePerson(person) {
        this.setState({
            person: {...person}
        })
    }

    render() {
        console.log(this.state)
        return (
            <div className="component">
            <form>
                <hr className="mb-4" />
            PersonCard
                <fieldset>
                <legend className="bg-light">ФИО</legend>
                <div className="row">
                    {/* Фамилия */}
                    <div className="col-md-4 mb-3">
                        <label htmlFor="lastName">Last name</label>
                        <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={this.state.person.lastName} onChange={this.onChange} required />
                        <div className="invalid-feedback">
                        Valid last name is required.
                        </div>
                    </div>
                    {/* Имя */}
                    <div className="col-md-3 mb-1">
                        <label htmlFor="firstName">First name</label>
                        <input type="text" className="form-control" id="firstName" placeholder="Иван" value={this.state.person.firstName} onChange={this.onChange} required />
                        <div className="invalid-feedback">
                        Valid first name is required.
                        </div>
                    </div>
                    {/* Отчество */}
                    <div className="col-md-4 mb-3">
                        <label htmlFor="middleName">MIddle name</label>
                        <input type="text" className="form-control" id="middleName" placeholder="Иванович" value={this.state.person.middleName} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid middle name is required.
                        </div>
                    </div>
                    {/* Пол */}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" className="form-select" value={this.state.person.gender} onChange={this.onChange}>
                            <option value="male">М</option>
                            <option value="female">Ж</option>
                        </select>
                    </div>
                </div>
                </fieldset>
                <fieldset>
                <legend className="bg-light">ПАСПОРТ</legend>
                <div className="row">
                    {/* Серия паспорта*/}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="passSerie">Серия</label>
                        <input type="number" className="form-control" id="passSerie" placeholder="8700" value={this.state.person.passSerie} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid passport serie is required.
                        </div>
                    </div>
                    {/* Номер паспорта */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="passNumber">Номер</label>
                        <input type="number" className="form-control" id="passNumber" placeholder="123456" value={this.state.person.passNumber} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid passport number is required.
                        </div>
                    </div>
                    {/* Дата Рождения */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="birthDate">Birthday</label>
                        <input type="date" className="form-control" id="birthDate" placeholder="" value={this.state.person.birthDate} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid date is required.
                        </div>
                    </div>
                    {/* Место рождения */}
                    <div className="col-md-6 mb-3">
                        <label htmlFor="birthPlace">Birth Place</label>
                        <input type="text" className="form-control" id="birthPlace" placeholder="Иванович" value={this.state.person.birthPlace} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid middle name is required.
                        </div>
                    </div>
                    {/* Дата выдачи паспорта */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="passIssueDate">Passport issue date</label>
                        <input type="date" className="form-control" id="passIssueDate" placeholder="Иванович" value={this.state.person.passIssueDate} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid date is required.
                        </div>
                    </div>
                    {/* Место выдачи паспорта */}
                    <div className="col-md-4 mb-3">
                        <label htmlFor="passIssuePlace">Passport issue place</label>
                        <input type="text" className="form-control" id="passIssuePlace" placeholder="Иванович" value={this.state.person.passIssuePlace} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid issue place is required.
                        </div>
                    </div>
                    {/* Код подразделения */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="passCode">Passport code</label>
                        <input type="number" className="form-control" id="passCode" placeholder="110003" value={this.state.person.passCode} onChange={this.onChange} />
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
                        <label htmlFor="innNumber">INN</label>
                        <input type="number" className="form-control" id="innNumber" placeholder="110300400500" value={this.state.person.innNumber} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid number is required.
                        </div>
                    </div>
                    {/* СНИЛС Номер */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="snilsNumber">SNILS</label>
                        <input type="number" className="form-control" id="snilsNumber" placeholder="12345678" value={this.state.person.snilsNumber} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid number is required.
                        </div>
                    </div>
                </div>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">АДРЕС РЕГИСТРАЦИИ</legend>
                <div className="row">
                    {/* Место регистрации Город*/}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="addrRegCity">City</label>
                        <input type="text" className="form-control" id="addrRegCity" placeholder="Воркута" value={this.state.person.addrRegCity} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid city is required.
                        </div>
                    </div>
                    {/* Улица */}
                    <div className="col-md-3 mb-3">
                        <label htmlFor="addrRegStreet">Street</label>
                        <input type="text" className="form-control" id="addrRegStreet" placeholder="пл. им. Красной площади" value={this.state.person.addrRegStreet} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid street is required.
                        </div>
                    </div>
                    {/* Дом */}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="addrRegBuilding">Building</label>
                        <input type="text" className="form-control" id="addrRegBuilding" placeholder="123/1 А" value={this.state.person.addrRegBuilding} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid building is required.
                        </div>
                    </div>
                    {/* Квартира */}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="addrRegAppt">Appt</label>
                        <input type="text" className="form-control" id="addrRegAppt" placeholder="188" value={this.state.person.addrRegAppt} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid appartments number is required.
                        </div>
                    </div>
                </div>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">АДРЕС ФАКТИЧЕСКИЙ</legend>
                    <div className="row">
                    {/* Место проживания Город*/}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="addrFactCity">City</label>
                        <input type="text" className="form-control" id="addrFactCity" placeholder="Воркута" value={this.state.person.addrFactCity} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid city is required.
                        </div>
                    </div>
                    {/* Улица */}
                    <div className="col-md-3 mb-3">
                        <label htmlFor="addrFactStreet">Street</label>
                        <input type="text" className="form-control" id="addrFactStreet" placeholder="Ленина штрассе" value={this.state.person.addrFactStreet} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid street is required.
                        </div>
                    </div>
                    {/* Дом */}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="addrFactBuilding">Building</label>
                        <input type="text" className="form-control" id="addrFactBuilding" placeholder="123/1 А" value={this.state.person.addrFactBuilding} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid building is required.
                        </div>
                    </div>
                    {/* Квартира */}
                    <div className="col-md-1 mb-3">
                        <label htmlFor="addrFactAppt">Appt</label>
                        <input type="text" className="form-control" id="addrFactAppt" placeholder="188" value={this.state.person.addrFactAppt} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid appartments number is required.
                        </div>
                    </div>
                </div>
                </fieldset>
                <fieldset>
                    <legend className="bg-light">ТЕЛЕФОНЫ</legend>
                <div className="row">
                    {/* Телефон 1 */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="phone1">Phone 1</label>
                        <input type="tel" className="form-control" id="phone1" placeholder="89121234567" maxLength="11" value={this.state.person.phone1} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid phone number is required.
                        </div>
                    </div>
                    {/* Телефон 2 */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="phone2">Phone 2</label>
                        <input type="tel" className="form-control" id="phone2" placeholder="89222345678" maxLength="11" value={this.state.person.phone2} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid phone number is required.
                        </div>
                    </div>
                    {/* Телефон 3 */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="phone3">Phone 3</label>
                        <input type="tel" className="form-control" id="phone3" placeholder="89122345678" maxLength="11" value={this.state.person.phone3} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid phone number is required.
                        </div>
                    </div>
                    {/* Телефон 4 */}
                    <div className="col-md-2 mb-3">
                        <label htmlFor="phone4">Phone 4</label>
                        <input type="tel" className="form-control" id="phone4" placeholder="89223456789" maxLength="11" value={this.state.person.phone4} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid phone number is required.
                        </div>
                    </div>
                </div>
                </fieldset>
                {/* Комментарий */}
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <label htmlFor="comment">Comment</label>
                        <input type="text" className="form-control" id="comment" placeholder="some text...." value={this.state.person.comment} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid appartments number is required.
                        </div>
                    </div>
                </div>
                {!this.state.showEditButtons && (<button className="btn btn-danger btn-lg btn-block" type="submit" onClick={this.createPerson} >Create person</button>)}
                &nbsp;
                {this.state.showEditButtons && (<button className="btn btn-danger btn-lg btn-block" onClick={this.savePerson} >Save changes</button>)}
                &nbsp;
                {this.state.showEditButtons && (<button className="btn btn-danger btn-lg btn-block" onClick={this.revert} >Revert</button>)}
                &nbsp;
                {this.state.showEditButtons && (<button className="btn btn-danger btn-lg btn-block" onClick={this.deletePerson} >Delete</button>)}
                &nbsp;

                {/* { (this.state.persons.length) ? `Found ${this.state.persons.length} entries` : null}
                <ul className="list-group">
                {this.state.persons.map((person, index) => (
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

                <CheckBeforeCreate receivePerson={this.receivePerson} persons={this.state.persons}/>

                </form>
            </div>
        )
    }
    }

export default withRouter(PersonCard)