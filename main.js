import { Spreadsheet } from './src/spreadsheet.js';
import './style.css'

const spreadsheet = new Spreadsheet();

const app = document.querySelector('#app');
app.appendChild(spreadsheet);