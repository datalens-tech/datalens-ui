function getRandomSymbolFromString(set: string) {
    const index = Math.floor(Math.random() * set.length);
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

    // Math.rand() - 0.5 returns a random number between -0.5 and 0.5
    requiredSymbols.sort(() => Math.random() - 0.5);

    return requiredSymbols.join('');
}
