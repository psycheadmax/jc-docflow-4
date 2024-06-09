import React from 'react';
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout';
import { Main } from './pages/Main';
import { PageNotFound } from './pages/PageNotFound';
import { PersonCard } from './pages/PersonCard';
import { OrgCard } from './pages/OrgCard';
import { Cases } from './pages/Cases'
import { CaseComponent } from './components/CaseComponent';
import { SearchAndResults } from './pages/SearchAndResults';
import { Doctemplates } from './pages/Doctemplates';
import { Docs } from './pages/Docs';
import { Doc } from './docTemplates/Doc';
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';
import { TempReceiptForm } from './docTemplates/TempReceiptForm';
import { TempAnyDoc } from './docTemplates/TempAnyDoc';
import { TempAnyDoc2 } from './docTemplates/TempAnyDoc2';
import { TemplateAgreement } from './docTemplates/TemplateAgreement';
import { TemplateBankrotOpis } from './docTemplates/TemplateBankrotOpis';
import { TemplateBankrotSpisok } from './docTemplates/TemplateBankrotSpisok';

function App() {
  return(
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Main />} />
        <Route path='login' element={<Login />} />
        <Route path='registration' element={<Registration />} />
        <Route path='person' element={<PersonCard />} />
        <Route path='persons/*' element={<PersonCard />} />
        <Route path='org' element={<OrgCard />} />
        <Route path='orgs/*' element={<OrgCard />} />
        <Route path='cases' element={<Cases />} />
        <Route path='cases/*' element={<CaseComponent />} />
        <Route path='search' element={<SearchAndResults />} />
        <Route path='doctemplates' element={<Doctemplates />} />
        <Route path='doctemplates/*' element={<TempAnyDoc2 />} />
        <Route path='docs' element={<Docs />} />
        <Route path='docs/*' element={<Doc />} />
        <Route path='docs/receipt' element={<TempReceiptForm />} />
        <Route path='docs/anydoc' element={<TempAnyDoc />} />
        <Route path='docs/anydoc2' element={<TempAnyDoc2 />} />
        <Route path='docs/templateagreement' element={<TemplateAgreement />} />
        <Route path='docs/templatebankrotopis' element={<TemplateBankrotOpis />} />
        <Route path='docs/templatebankrotspisok' element={<TemplateBankrotSpisok />} />
        <Route path='*' element={<PageNotFound />} />
      </Route>
    </Routes>
  )  
}

export { App }
