import usePageTitle from './usePageTitle';
import type {PageTitleExtraSettings} from './usePageTitle';

type Props = {
    entry?: {key: string} | null;
    defaultTitle?: string;
    extraSettings?: PageTitleExtraSettings;
};

function PageTitle({entry, defaultTitle, extraSettings}: Props) {
    usePageTitle({entry, defaultTitle, extraSettings});
    return null;
}

export default PageTitle;
