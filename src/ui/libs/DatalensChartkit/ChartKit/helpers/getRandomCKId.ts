const randomString = (length: number, chars: string) => {
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

export const getRandomCKId = () => `ck.${randomString(10, '0123456789abcdefghijklmnopqrstuvwxyz')}`;
