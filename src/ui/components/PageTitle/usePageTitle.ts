import {useEffect, useState} from 'react';

import {getEntryNameByKey} from 'shared';
import {DL} from 'ui';

import {useTitle} from '../../hooks/useTitle';

export type PageTitleExtraSettings = {
    subtitle?: string | null;
};

const getPageTitle = ({
    entry,
    defaultTitle,
    extraSettings,
}: {
    entry?: {key: string} | null;
    defaultTitle: string;
    extraSettings?: PageTitleExtraSettings;
}) => {
    const pageTitle =
        entry && entry.key
            ? `${getEntryNameByKey({key: entry.key})} - ${defaultTitle}`
            : defaultTitle;
    return extraSettings?.subtitle ? `${extraSettings?.subtitle} - ${pageTitle}` : pageTitle;
};

const usePageTitle = ({
    entry,
    defaultTitle = DL.SERVICE_NAME,
    extraSettings,
}: {
    entry?: {key: string} | null;
    defaultTitle?: string;
    extraSettings?: PageTitleExtraSettings;
}) => {
    const [title, changeTitle] = useState(getPageTitle({entry, defaultTitle, extraSettings}));

    useEffect(() => {
        changeTitle(getPageTitle({entry, defaultTitle, extraSettings}));
    }, [entry, defaultTitle, extraSettings, extraSettings?.subtitle]);

    useTitle(title, defaultTitle);
};

export default usePageTitle;
