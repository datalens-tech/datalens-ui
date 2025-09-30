import usePageTitle from './usePageTitle';
import type {PageTitleExtraSettings} from './usePageTitle';

type Props = {
    entry?: {key: string} | null;
    defaultTitle?: string;
    extraSettings?: PageTitleExtraSettings;
    title?: string | null;
};

function PageTitle({entry, defaultTitle, extraSettings, title}: Props) {
    usePageTitle({entry, defaultTitle, extraSettings, title});
    return null;
}

export default PageTitle;
