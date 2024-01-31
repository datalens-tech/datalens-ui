import React from 'react';

import {throttle} from 'lodash';

type IntersectionCallback = (state: boolean) => void;

// DOM element monkey patch helpers
const DOM_PATCH_PROP_NAME = Symbol('useIntersectionObserver-key');
type ElementDomNode = any;
const getId = (node: ElementDomNode) => node[DOM_PATCH_PROP_NAME];
const setId = (node: ElementDomNode, id: string) => {
    node[DOM_PATCH_PROP_NAME] = id;
    return id;
};
const deleteId = (node: ElementDomNode) => {
    delete node[DOM_PATCH_PROP_NAME];
};
const hasId = (node: ElementDomNode) => Boolean(node[DOM_PATCH_PROP_NAME]);

class Observer {
    intersectionObserver: IntersectionObserver;
    counter = 0;
    callbacksMap: Map<string, IntersectionCallback> = new Map();
    intersectionChangesQueue: Record<string, boolean> = {};

    intersectionFlushQueue = throttle(() => {
        const {callbacksMap} = this;
        const changes = this.intersectionChangesQueue;
        this.intersectionChangesQueue = {};

        Object.entries(changes).forEach(([id, isVisible]) => {
            callbacksMap.get(id)?.(isVisible);
        });
    }, 100);

    constructor() {
        this.intersectionObserver = new IntersectionObserver(this.intersectionHandler, {
            threshold: [0, 0.5, 1],
            rootMargin: '300px',
        });
    }

    intersectionHandler = (entries: IntersectionObserverEntry[]) => {
        const {intersectionChangesQueue: intersectionChanges} = this;

        const hasChanges = entries.reduce((memo, e) => {
            const state = e.intersectionRatio > 0;
            const id = getId(e.target);

            if (intersectionChanges[id] !== state) {
                intersectionChanges[id] = state;
                return true;
            }

            return memo;
        }, false);

        if (hasChanges) {
            this.intersectionFlushQueue();
        }
    };

    generateId() {
        return `${++this.counter}`;
    }

    subscribe(element: HTMLDivElement, callback: IntersectionCallback) {
        const id = hasId(element) ? getId(element) : setId(element, this.generateId());

        this.intersectionObserver.observe(element);
        this.callbacksMap.set(id, callback);
    }

    ubsubscibe(element: HTMLDivElement) {
        const id = getId(element);

        if (!id) {
            return;
        }

        this.callbacksMap.delete(id);
        this.intersectionObserver.unobserve(element);
        deleteId(element);
    }
}

const observer = new Observer();

export const useIntersectionObserver = ({
    nodeRef,
    callback,
    enable,
}: {
    nodeRef: React.RefObject<HTMLDivElement>;
    callback: (isVisible: boolean) => void;
    enable: boolean;
}) => {
    React.useEffect(() => {
        const element = nodeRef.current;
        if (!element) {
            return;
        }

        if (enable) {
            observer.subscribe(element, callback);
        } else {
            observer.ubsubscibe(element);
        }

        return () => {
            observer.ubsubscibe(element);
        };
    }, [nodeRef, callback, enable]);
};
