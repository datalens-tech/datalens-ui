import React from 'react';

import type {History} from 'history';
import {isEntryId, makeSlugName} from 'shared';
import {registry} from 'ui/registry';

export interface SlugifyUrlProps {
    entryId?: string | null;
    name?: string | null;
    history?: History;
}

export const SlugifyUrl: React.FC<SlugifyUrlProps> = ({entryId, name, history}) => {
    React.useEffect(() => {
        if (entryId && name && isEntryId(entryId)) {
            const url = new URL(window.location.href);
            const urlPathname = url.pathname;
            const {extractEntryId} = registry.common.functions.getAll();
            if (extractEntryId(urlPathname) && urlPathname.includes(entryId)) {
                const pathname = urlPathname
                    .split('/')
                    .map((path) => (path.includes(entryId) ? makeSlugName(entryId, name) : path))
                    .join('/');
                if (pathname !== urlPathname) {
                    const resultPath = `${pathname}${url.search}${url.hash}`;
                    if (history) {
                        history.replace(resultPath);
                    } else {
                        window.history.replaceState({}, '', resultPath);
                    }
                }
            }
        }
    }, [entryId, name, history]);
    return null;
};
