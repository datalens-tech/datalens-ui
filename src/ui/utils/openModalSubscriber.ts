import type {EventBrokerData, EventBrokerSubscription} from '@gravity-ui/uikit';
import {eventBroker} from '@gravity-ui/uikit';

type UnsubscribeCallback = () => void;

export const openModalSubscriber = (callback: (open: boolean) => void): UnsubscribeCallback => {
    const subscription: EventBrokerSubscription = (eventData) => {
        const data = eventData as EventBrokerData<{layers: {type: string}[]}>;
        if (data?.eventId === 'layerschange') {
            const openModals = data?.meta?.layers?.filter(({type}) => type === 'modal') ?? [];

            callback(openModals.length !== 0);

            return;
        }
    };
    eventBroker.subscribe(subscription);
    return () => eventBroker.unsubscribe(subscription);
};
