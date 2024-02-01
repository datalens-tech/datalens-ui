import React from 'react';

import {throttle} from 'lodash';

type IntersectionCallback = (state: boolean) => void;

const LOADING_VISIBLE_OFFSET = 300;

class Observer {
    callbacksMap: Map<HTMLDivElement, IntersectionCallback> = new Map();
    changesQueue: Map<HTMLDivElement, boolean> | null = null;
    intersectionObserver: IntersectionObserver | null = null;

    intersectionFlushQueue = throttle(() => {
        if (this.changesQueue === null) {
            return;
        }

        const {callbacksMap, changesQueue} = this;
        const changes = changesQueue;
        this.changesQueue = null;

        changes.forEach((isVisible, el) => {
            callbacksMap.get(el)?.(isVisible);
        });
        changes.clear();
    }, 100);

    intersectionHandler = (entries: IntersectionObserverEntry[]) => {
        this.changesQueue = this.changesQueue || new Map();

        const hasChanges = entries.reduce((memo, e) => {
            const target = e.target as HTMLDivElement;
            const state = e.intersectionRatio > 0;
            const currentState = this.changesQueue?.get(target);

            if (currentState !== state) {
                this.changesQueue?.set(target, state);
                return true;
            }

            return memo;
        }, false);

        if (hasChanges) {
            this.intersectionFlushQueue();
        }
    };

    getIntersectionObserver() {
        if (this.intersectionObserver === null) {
            this.intersectionObserver = new IntersectionObserver(this.intersectionHandler, {
                threshold: [0, 0.5, 1],
                rootMargin: `${LOADING_VISIBLE_OFFSET}px`,
            });
        }

        return this.intersectionObserver;
    }

    cleanIntersectionObserver() {
        if (this.callbacksMap.size === 0) {
            this.getIntersectionObserver().disconnect();
            this.intersectionObserver = null;
        }
    }

    subscribe(element: HTMLDivElement, callback: IntersectionCallback) {
        this.getIntersectionObserver().observe(element);
        this.callbacksMap.set(element, callback);

        this.triggerSync(element, callback);
    }

    ubsubscibe(element: HTMLDivElement) {
        if (this.intersectionObserver === null) {
            return;
        }

        this.intersectionObserver.unobserve(element);
        this.callbacksMap.delete(element);
        this.changesQueue?.delete(element);

        this.cleanIntersectionObserver();
    }

    private triggerSync(element: HTMLDivElement, callback: IntersectionCallback) {
        // Sync call for priority loading to work as intended
        // cause all selectors are added to load queue while first render
        // if we will delegate this to IntersectionObserver init call micro-task
        // we will be already late by the time when loading will be already started
        const {top, height}: {top: number; height: number} = element.getBoundingClientRect();
        const bottom: number = top + height;

        const isVisible = Number(top) < window.innerHeight + LOADING_VISIBLE_OFFSET && bottom >= 0;
        callback(isVisible);
    }
}

const observer = new Observer();

export const useIntersectionObserver = ({
    nodeRef,
    callback,
    enable,
}: {
    nodeRef: React.RefObject<HTMLDivElement>;
    callback: IntersectionCallback;
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
