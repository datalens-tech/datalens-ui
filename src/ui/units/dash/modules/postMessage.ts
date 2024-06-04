import type {Location} from 'history';

import {isEmbeddedMode} from '../../../utils/embedded';

export enum PostMessageCode {
    UrlChanged = 'URL_CHANGED',
}

interface PostMessageUrlChange {
    code: PostMessageCode.UrlChanged;
    data: Pick<Location, 'pathname' | 'search'>;
}

type PostMessageSendData = PostMessageUrlChange | {[key: string]: any};

export class PostMessage {
    static isInIFrame() {
        try {
            return window.self !== window.top;
        } catch (error) {
            return true;
        }
    }

    static send(data: PostMessageSendData) {
        const isEmbedded = isEmbeddedMode();
        if (isEmbedded) {
            if (PostMessage.isInIFrame()) {
                window.parent.postMessage(data, '*');
            } else {
                console.warn('Trying to postMessage while not being inside an iframe');
            }
        }
    }
}
