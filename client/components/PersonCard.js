import React from 'react'
import { withRouter } from 'react-router-dom';
import axios from 'axios'

class PersonCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          person: {...props.location.propsPerson},
          haveChanges: false
        };

        this.onChange = this.onChange.bind(this)
        this.revert = this.revert.bind(this)
        this.haveChanges = this.haveChanges.bind(this)
        this.createPerson = this.createPerson.bind(this)
        this.savePerson = this.savePerson.bind(this)
        this.deletePerson = this.deletePerson.bind(this)
    }

    componentDidMount() {
    }

    onChange(e) {
        this.setState({
          person: {
            ...this.state.person,
            [e.target.id]: e.target.value
        }
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

    createPerson() {
        // TODO add check and modify within DB
        const data = {
            lastName: this.state.person.lastName,
            firstName: this.state.person.firstName,
            middleName: this.state.person.middleName,
            //   birth: Date, 
            // gender: state.lastName
        }
        axios.post("http://localhost:3333/api/persons/", data).then(person => {
          console.log(person)
        })
    }

    savePerson() {
        const data = {
            id: this.state.person._id,
            lastName: this.state.person.lastName,
            firstName: this.state.person.firstName,
            middleName: this.state.person.middleName,
            //   birth: Date, 
            // gender: state.lastName
        }
        axios.post("http://localhost:3333/api/persons/", data).then(person => {
          alert("Person Successfully Updated!");
          this.props.history.push(`/person/${this.props.match.params.id}`);
        });
    }

    deletePerson() {
        // e.preventDefault(); //(DON'T KNOW WHY)
        axios
          .post(`http://localhost:3333/api/persons/${this.props.match.params.id}`)
          .then(person => {
            alert("Person Deleted!");
            this.props.history.push("/"); //(DON'T KNOW WHY)
          });
    }



    render() {
        const haveProps = this.props.location.propsPerson
        return (
            <div className="component">
                <hr className="mb-4" />
            PersonCard
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="firstName">First name</label>
                        <input type="text" className="form-control" id="firstName" placeholder="Иван" value={this.state.person.firstName} onChange={this.onChange} required />
                        <div className="invalid-feedback">
                        Valid first name is required.
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="middleName">MIddle name</label>
                        <input type="text" className="form-control" id="middleName" placeholder="Иванович" value={this.state.person.middleName} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid middle name is required.
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="lastName">Last name</label>
                        <input type="text" className="form-control" id="lastName" placeholder="Иванов" value={this.state.person.lastName} onChange={this.onChange} required />
                        <div className="invalid-feedback">
                        Valid last name is required.
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="birthday">Birthday</label>
                        <input type="date" className="form-control" id="birthday" placeholder="" value={this.state.person.birthday} onChange={this.onChange} />
                        <div className="invalid-feedback">
                        Valid date is required.
                        </div>
                    </div>
                </div>
                {!haveProps && (<button className="btn btn-danger btn-lg btn-block" onClick={this.createPerson} >Create person</button>)}
                &nbsp;
                {haveProps && (<button className="btn btn-danger btn-lg btn-block" onClick={this.savePerson} >Save changes</button>)}
                &nbsp;
                {haveProps && (<button className="btn btn-danger btn-lg btn-block" onClick={this.revert} >Revert</button>)}
                &nbsp;
                {haveProps && (<button className="btn btn-danger btn-lg btn-block" onClick={this.deletePerson} >Delete</button>)}
                {/* <button className="btn btn-primary btn-lg btn-block" type="submit" onClick={this.docGenerator} >OK</button> NEED tomove to document generator component*/}
            </div>
        )
    }
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

export default withRouter(PersonCard)