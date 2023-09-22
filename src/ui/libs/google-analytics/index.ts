export function sendGAEvent(eventName: string, params: Gtag.EventParams = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, {
            event_category: 'button',
            event_label: 'console',
            ...params,
        });
    }
}
