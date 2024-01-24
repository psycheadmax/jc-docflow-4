import React from 'react';

import { Routes, Route } from 'react-router-dom'

import { Layout } from './components/Layout';
import { Main } from './pages/Main';
import { PageNotFound } from './pages/PageNotFound';
import { PersonCard } from './pages/PersonCard';
import { Cases } from './pages/Cases'
import { CaseComponent } from './components/CaseComponent';
import { SearchAndResults } from './pages/SearchAndResults';
import { Doctemplates } from './pages/Doctemplates';
import { Docs } from './pages/Docs';
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';
import { TempReceiptForm } from './doctemplates/TempReceiptForm';
import { TempAnyDoc } from './doctemplates/TempAnyDoc';
import { TempAnyDoc2 } from './doctemplates/TempAnyDoc2';

function App() {
  return(
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Main />} />
        <Route path='create' element={<PersonCard />} />
        <Route path='login' element={<Login />} />
        <Route path='registration' element={<Registration />} />
        <Route path='persons/*' element={<PersonCard />} />
        <Route path='cases' element={<Cases />} />
        <Route path='cases/*' element={<CaseComponent />} />
        <Route path='search' element={<SearchAndResults />} />
        <Route path='doctemplates' element={<Doctemplates />} />
        <Route path='doctemplates/*' element={<TempAnyDoc2 />} />
        <Route path='docs' element={<Docs />} />
        <Route path='docs/*' element={<TempReceiptForm />} />
        <Route path='docs/receipt' element={<TempReceiptForm />} />
        <Route path='docs/anydoc' element={<TempAnyDoc />} />
        <Route path='docs/anydoc2' element={<TempAnyDoc2 />} />
        <Route path='*' element={<PageNotFound />} />
      </Route>
    </Routes>
  )  
}
// TODO
/* 
Главная / Поиск Клиента / Дело / Шаблон / Документы
  ?           / фильтр               / +дело/ ...шаблоны / фильтр
              / редакт.
*/

export { App }
