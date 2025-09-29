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
    title,
    hideDefaultTitle,
}: {
    entry?: {key: string} | null;
    defaultTitle: string;
    extraSettings?: PageTitleExtraSettings;
    title?: string | null;
    hideDefaultTitle?: boolean;
}) => {
    let pageTitle;
    if (title) {
        pageTitle = hideDefaultTitle ? title : `${title} - ${defaultTitle}`;
    } else if (entry && entry.key) {
        pageTitle = hideDefaultTitle
            ? getEntryNameByKey({key: entry.key})
            : `${getEntryNameByKey({key: entry.key})} - ${defaultTitle}`;
    } else {
        pageTitle = defaultTitle;
    }

    return extraSettings?.subtitle ? `${extraSettings?.subtitle} - ${pageTitle}` : pageTitle;
};

const usePageTitle = ({
    entry,
    defaultTitle = DL.SERVICE_NAME,
    extraSettings,
    title,
    hideDefaultTitle,
}: {
    entry?: {key: string} | null;
    defaultTitle?: string;
    extraSettings?: PageTitleExtraSettings;
    title?: string | null;
    hideDefaultTitle?: boolean;
}) => {
    const [documentTitle, changeTitle] = useState(
        getPageTitle({entry, defaultTitle, extraSettings, title, hideDefaultTitle}),
    );

    useEffect(() => {
        changeTitle(getPageTitle({entry, defaultTitle, extraSettings, title, hideDefaultTitle}));
    }, [entry, defaultTitle, extraSettings, extraSettings.subtitle, title, hideDefaultTitle]);

    useTitle(documentTitle, defaultTitle);
};

export default usePageTitle;
