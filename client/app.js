import React from 'react';

import { Routes, Route } from 'react-router-dom'

import { Layout } from './components/Layout';
import { Main } from './pages/Main';
import { PageNotFound } from './pages/PageNotFound';
import { PersonCard } from './pages/PersonCard';
import { SearchAndResults } from './pages/SearchAndResults';
import { Docs } from './pages/Docs';
import { TempReceiptForm } from './docTemplates/TempReceiptForm';

function App() {
  return(
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Main />} />
        <Route path='create' element={<PersonCard />} />
        <Route path='persons/*' element={<PersonCard />} />
        <Route path='search' element={<SearchAndResults />} />
        <Route path='docs' element={<Docs />} />
        <Route path='docs/receipt' element={<TempReceiptForm />} />
        <Route path='*' element={<PageNotFound />} />
      </Route>
    </Routes>
  )  
}

// DELETE jTHIS COMMENT LATER ust for changes to capitalize first letter

export { App }