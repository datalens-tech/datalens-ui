import type {DashTab} from 'shared';
import {URL_QUERY} from 'ui/constants';

export const getTabId = (searchParams: URLSearchParams, tabs: DashTab[]) =>
    searchParams.get(URL_QUERY.TAB_ID) || (tabs && tabs[0].id) || '';
