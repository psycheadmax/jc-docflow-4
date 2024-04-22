import { applyMiddleware, combineReducers, configureStore } from "@reduxjs/toolkit";
import { personReducer } from "./personReducer";
import { templateReducer } from './templateReducer';
import { caseReducer } from './caseReducer';
import { docReducer } from './docReducer'
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";

// Custom middleware to store state in local storage
const localStorageSaver = store => next => action => {
  const result = next(action);
  const state = store.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
  return result;
};

const rootReducer = combineReducers({ personReducer, templateReducer, caseReducer, docReducer });

// Function to initialize state from session storage if it's empty
const initializeStateFromStorage = () => {
  const storedState = localStorage.getItem('reduxState');
  return storedState ? JSON.parse(storedState) : undefined;
};

// Modified store configuration to use local storage and initialize state if empty
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: initializeStateFromStorage(),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(localStorageSaver, thunk)
}, composeWithDevTools());


    // OLD WORKING W/O SESSION STORAGE
    /* import {
        applyMiddleware,
        combineReducers,
        configureStore,
    } from "@reduxjs/toolkit";
    import { personReducer } from "./personReducer";
    import { composeWithDevTools } from "redux-devtools-extension";
    import thunk from "redux-thunk";
    
    const rootReducer = combineReducers({ personReducer });
    
    export const store = configureStore(
        { reducer: rootReducer },
        composeWithDevTools(applyMiddleware(thunk))
    ); */