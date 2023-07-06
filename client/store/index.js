import { applyMiddleware, combineReducers, configureStore } from '@reduxjs/toolkit';
import { personReducer } from './personReducer';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({personReducer})

export const store = configureStore({reducer: rootReducer}, composeWithDevTools(applyMiddleware(thunk)))