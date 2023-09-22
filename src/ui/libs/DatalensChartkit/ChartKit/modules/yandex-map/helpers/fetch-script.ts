export function fetchScript(url: string) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.type = 'text/javascript';
        script.onload = resolve;
        script.onerror = reject;
        script.src = url;
        script.async = true;

        document.head.appendChild(script);
    });
}
