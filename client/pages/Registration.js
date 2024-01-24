import React, { useState } from 'react';
import axios from 'axios'

require('dotenv').config()

const SERVER_PORT = process.env['SERVER_PORT']
const SERVER_IP = process.env['SERVER_IP']
const SECRET_KEY = process.env['SECRET_KEY']

function Registration() {

    const [inputData, setInputData] = useState({
        username: '',
        password: ''
    })
    
    function onChange(e) {
        setInputData({
            ...inputData,
            [e.target.id]: e.target.value
        })
        console.log('input: ', inputData)
    }

    function onSubmit(e) {
        e.preventDefault()
        console.log(`axios post: ${SERVER_IP}:${SERVER_PORT}/registration`)

        axios.post(`${SERVER_IP}:${SERVER_PORT}/registration`, inputData).then(data => {
            alert(`Пользователь ${inputData.username} зарегистрирован`);
            console.log(data)
            // this.props.history.push(`/persons/${person.data._id}`); // TODO WHAT IS IT???
        })
    }

    return (
        <div>
            <main className="form-signin w-100 m-auto">
            <h1>Страница регистрации</h1>
            <form>
                {/* <img className="mb-4" src="/docs/5.2/assets/brand/bootstrap-logo.svg" alt="Some picture" width="72" height="57" /> */}
                <h1 className="h3 mb-3 fw-normal">Пожалуйста, зарегистрируйтесь</h1>

                <div className="form-floating">
                <input type="text" className="form-control" id="username" placeholder="username" onChange={onChange} value={inputData.username} />
                <label htmlFor="username">Username</label>
                </div>
                <div className="form-floating">
                <input type="password" className="form-control" id="password" placeholder="Password" onChange={onChange} value={inputData.password} />
                <label htmlFor="password">Password</label>
                </div>

                {/* <div className="checkbox mb-3">
                <label>
                    <input type="checkbox" value="remember-me" /> Запомнить меня
                </label>
                </div> */}
                <button className="w-100 btn btn-md btn-primary" type="submit" onClick={onSubmit}>Зерегистрироваться</button>
                {/* <p className="mt-5 mb-3 text-muted">&copy; 2017–2022</p> */}
            </form>
            </main>
        </div>
    )
}

export { Registration }