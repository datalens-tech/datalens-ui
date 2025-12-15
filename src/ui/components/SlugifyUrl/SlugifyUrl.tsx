import {useEffect} from 'react';
import type {FC} from 'react';

import {isEntryId, makeSlugName} from 'shared';
import {useRouter} from 'ui/navigation';
import {registry} from 'ui/registry';

export interface SlugifyUrlProps {
    entryId?: string | null;
    name?: string | null;
}

export const SlugifyUrl: FC<SlugifyUrlProps> = ({entryId, name}) => {
    const router = useRouter();
    useEffect(() => {
        if (entryId && name && isEntryId(entryId)) {
            const currentPathname = router.location().pathname;
            const {extractEntryId} = registry.common.functions.getAll();
            if (extractEntryId(currentPathname) && currentPathname.includes(entryId)) {
                const pathname = currentPathname
                    .split('/')
                    .map((path) => (path.includes(entryId) ? makeSlugName(entryId, name) : path))
                    .join('/');
                if (pathname !== currentPathname) {
                    router.replace({pathname});
                }
            }
        }
    }, [entryId, name, router]);
    return null;
};
