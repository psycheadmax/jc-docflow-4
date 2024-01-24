import React from 'react';
import { Link, Redirect } from 'react-router-dom';

function Main() {
    return (
        <>
            <h1>Это Главная страница. Пока непонятно что здесь будет.</h1>
            {/* <Redirect to="/search"/> TODO doesn't work */}
        </>
    )
}

export { Main }