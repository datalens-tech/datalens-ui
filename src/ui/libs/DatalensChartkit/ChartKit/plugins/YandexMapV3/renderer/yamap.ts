export function isYmapsReady(args: {apiKey: string; lang?: string}) {
    const {apiKey, lang = 'en_EN'} = args;
    return new Promise((resolve, reject) => {
        if (typeof ymaps3 !== 'undefined') {
            ymaps3.ready.then(() => resolve(ymaps3));
            return;
        }

        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=${lang}`;
        script.onload = () => {
            (ymaps3 as any).ready.then(() => resolve(ymaps3));
        };
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
    });
}
