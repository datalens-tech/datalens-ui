import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.Module,
    name: 'module',
    type: EDITOR_TYPE.MODULE,
    data: {
        js: `// Перечисляем нужные и вспомогательные функции и переменные:

// Константа 3.14
const PI = Math.PI.toFixed(2);

// Случайное число между 0 и 1
// Вспомогательная функция
function getRandom() {
    return Math.random();
}

// Случайный HEX
function getRandomHex() {
    return getRandom().toString(16).substring(2);
}

// Случайное число с {digits} разрядами и {decimalDigits} символами после точки
function getRandomNumber(digits, decimalDigits) {
    return (getRandom() * Math.pow(10, digits)).toFixed(decimalDigits);
}

// Описываем модуль с нужными функциями и переменными
module.exports = {
    PI, 
    getRandomHex, 
    getRandomNumber
};

// вызываем на любой вкладке:
// const randomModule = require('<путь до модуля>');
`,
        documentation_en: '',
        documentation_ru: '',
    },
};
