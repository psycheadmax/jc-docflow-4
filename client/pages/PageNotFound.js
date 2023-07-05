import React from 'react';
import { Link } from 'react-router-dom';

function PageNotFound() {
    return (
        <h3>Error. Page Not Found. А сейчас можно, например, <Link to='/'>на главную.</Link></h3>
    )
}

export { PageNotFound }