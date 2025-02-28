function getShuffledString(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const randomNumbers = new Uint32Array(1);
        window.crypto.getRandomValues(randomNumbers);

        // get index in interval [0, i]
        const j = randomNumbers[0] % (i + 1);

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array.join('');
}

function getRandomSymbolFromString(set: string) {
    const randomNumbers = new Uint32Array(1);
    window.crypto.getRandomValues(randomNumbers);
    const index = randomNumbers[0] % set.length;
    return set[index];
}

export function generateRandomPassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialSymbols = '!@#$%^&*-_';

    const allSymbols = lowercase + uppercase + numbers + specialSymbols;
    const passwordLength = 12;

    // Contains 1 of [A-Z], [a-z], [0-9], [specialSymbols]
    const requiredSymbols = [
        getRandomSymbolFromString(lowercase),
        getRandomSymbolFromString(uppercase),
        getRandomSymbolFromString(numbers),
        getRandomSymbolFromString(specialSymbols),
    ];

    for (let i = requiredSymbols.length; i < passwordLength; i++) {
        requiredSymbols.push(getRandomSymbolFromString(allSymbols));
    }

    return getShuffledString(requiredSymbols);
}
