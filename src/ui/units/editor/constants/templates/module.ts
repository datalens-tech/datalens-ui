import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.Module,
    name: 'module',
    type: EDITOR_TYPE.MODULE,
    data: {
        js: `// Functions and constants:

// Constant PI
const PI = Math.PI.toFixed(2);

// Random number between 0 and 1
function getRandom() {
    return Math.random();
}

// Random HEX
function getRandomHex() {
    return getRandom().toString(16).substring(2);
}

// Random number with {digits} digits and {decimalDigits} digits points
function getRandomNumber(digits, decimalDigits) {
    return (getRandom() * Math.pow(10, digits)).toFixed(decimalDigits);
}

// Exports
module.exports = {
    PI, 
    getRandomHex, 
    getRandomNumber
};
`,
    },
};
