import {DL} from 'constants/common';

import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Checkbox, Dialog} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import {keyBy} from 'lodash';
import moment from 'moment';
import {useDispatch} from 'react-redux';
import {filterUsersIds} from 'shared';
import type {GetRevisionsEntry} from 'shared/schema';
import {showToast} from 'store/actions/toaster';
import {getResolveUsersByIdsAction} from 'store/actions/usersByIds';
import type {RevisionEntry} from 'ui/components/Revisions/types';
import {SelectAsync} from 'ui/components/Select/wrappers/SelectAsync';
import {registry} from 'ui/registry';

import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {DEFAULT_TAB_ID, TIMESTAMP_FORMAT} from '../../constants/common';
import type {EditorEntry} from '../../types/common';
import type {ScriptsValues, TabData} from '../../types/store';
import PaneTabs from '../PaneTabs/PaneTabs';

import {ButtonNewWindow} from './ButtonNewWindow/ButtonNewWindow';
import Editor from './Editor';
import {CURRENT, PAGE_SIZE, b} from './constants';

import './RevisionsDiff.scss';

type UseRevisionsReqEnhancerProps = {
    isScriptsChanged: boolean;
    entry: EditorEntry;
};

type UseTabsEnhancerProps = {
    tabsData: TabData[];
};

type RevisionsDiffProps = {
    entry: EditorEntry;
    scriptsValues: ScriptsValues;
} & UseTabsEnhancerProps &
    UseRevisionsReqEnhancerProps;

type RevisionDiffDialogProps = {
    visible: boolean;
    onClose: () => void;
} & RevisionsDiffProps;

const errorParams = {
    title: i18n('component.dialog-revisions-diff.view', 'toast_get-revisions-failed'),
    name: 'getRevisionsFailed',
    withReport: true,
};

const currentItem = {
    content: i18n('component.dialog-revisions.view', 'label_current-changes'),
    value: CURRENT,
};

const prepareRevisionsForSelect = (revisions: RevisionEntry[]) => {
    return revisions.map(({updatedAt, revId}) => ({
        content: moment(updatedAt).format(TIMESTAMP_FORMAT),
        value: String(revId),
    }));
};

export const useRevisionsReqEnhancer = (props: UseRevisionsReqEnhancerProps) => {
    const dispatch = useDispatch();
    const mounted = React.useRef(true);
    const [revisions, setRevisions] = React.useState<RevisionEntry[]>([]);
    const [revisionByRevisionId, setRevisionByRevisionId] = React.useState<
        Record<string, RevisionEntry>
    >({});
    const [hasNextPage, setHasNextPage] = React.useState(false);
    const [nextPageNumber, setNextPageNumber] = React.useState(0);

    const [leftSelectVal, setLeftSelectVal] = React.useState<string | undefined>();
    const [rightSelectVal, setRightSelectVal] = React.useState<string | undefined>();

    const resolveUsers = React.useCallback(
        (entries: GetRevisionsEntry[]) => {
            const ids = filterUsersIds(entries.map((item) => item.updatedBy));
            const resolveUsersByIds = getResolveUsersByIdsAction();
            dispatch(resolveUsersByIds(ids));
        },
        [dispatch],
    );

    const getRevisions = React.useCallback(() => {
        getSdk()
            .us.getRevisions({
                entryId: props.entry.entryId,
                pageSize: PAGE_SIZE,
                page: nextPageNumber,
            })
            .then((resp) => {
                if (!mounted.current) return;

                resolveUsers(resp.entries);

                setRevisionByRevisionId({...revisionByRevisionId, ...keyBy(resp.entries, 'revId')});
                setRevisions([...revisions, ...resp.entries]);
                setHasNextPage(resp.hasNextPage);
                setNextPageNumber(nextPageNumber + 1);
            })
            .catch((error) => {
                logger.logError('RevisionsDiff: getRevisions failed', error);
                dispatch(showToast({...errorParams, error}));
            });
    }, [props.entry, nextPageNumber, revisions, revisionByRevisionId, dispatch]);

    React.useEffect(() => {
        mounted.current = true;
        getRevisions();

        return () => {
            mounted.current = false;
        };
    }, []);

    const selectItems = React.useMemo<SelectOption[]>(() => {
        const items = prepareRevisionsForSelect(revisions);
        return props.isScriptsChanged ? [currentItem, ...items] : items;
    }, [props.isScriptsChanged, revisions]);

    const leftVal = leftSelectVal || selectItems[1]?.value;
    const rightVal = rightSelectVal || selectItems[0]?.value;
    const leftLogin =
        leftVal === CURRENT ? DL.USER_LOGIN : revisionByRevisionId[leftVal]?.updatedBy || '';
    const rightLogin =
        rightVal === CURRENT ? DL.USER_LOGIN : revisionByRevisionId[rightVal]?.updatedBy || '';
    const leftLinkRevId = revisionByRevisionId[leftVal]?.savedId === leftVal ? undefined : leftVal;
    const rightLinkRevId =
        revisionByRevisionId[rightVal]?.savedId === rightVal ? undefined : rightVal;

    return {
        leftVal,
        rightVal,
        setLeftSelectVal,
        setRightSelectVal,
        selectItems,
        hasNextPage,
        getRevisions,
        leftLogin,
        rightLogin,
        leftLinkRevId,
        rightLinkRevId,
    };
};

const useTabsEnhancer = ({tabsData}: UseTabsEnhancerProps) => {
    const [currentTabId, setCurrentTabId] = React.useState(
        tabsData.find(({id}) => id === DEFAULT_TAB_ID) ? DEFAULT_TAB_ID : tabsData[0].id,
    );

    const handleTabSelection = React.useCallback(
        ({tabId}) => {
            setCurrentTabId(tabId);
        },
        [setCurrentTabId],
    );

    return {
        currentTabId,
        setCurrentTabId: handleTabSelection,
    };
};

const useRenderSideBySideEnhander = () => {
    const [renderSideBySide, setRenderSideBySide] = React.useState(false);

    const toggleRenderSideBySide = React.useCallback(() => {
        setRenderSideBySide(!renderSideBySide);
    }, [renderSideBySide, setRenderSideBySide]);

    return {renderSideBySide, toggleRenderSideBySide};
};

export const RevisionsDiff = (props: RevisionsDiffProps) => {
    const {
        leftVal,
        rightVal,
        setLeftSelectVal,
        setRightSelectVal,
        selectItems,
        hasNextPage,
        getRevisions,
        leftLogin,
        rightLogin,
        leftLinkRevId,
        rightLinkRevId,
    } = useRevisionsReqEnhancer(props);
    const {currentTabId, setCurrentTabId} = useTabsEnhancer(props);
    const {renderSideBySide, toggleRenderSideBySide} = useRenderSideBySideEnhander();

    const {getLoginById} = registry.common.functions.getAll();
    const LoginById = getLoginById();

    return (
        <div className={b()}>
            <div className={b('panel')}>
                <div className={b('selectors-place')}>
                    <div className={b('diff-selects')}>
                        <SelectAsync
                            value={[leftVal]}
                            onUpdate={(vals) => setLeftSelectVal(vals[0])}
                            options={selectItems}
                            onFetch={hasNextPage ? getRevisions : undefined}
                        />
                        <ButtonNewWindow
                            className={b('btn-new-window')}
                            revId={leftLinkRevId}
                            disabled={leftVal === CURRENT}
                        />
                        <span className={b('mdash')}>&mdash;</span>
                        <SelectAsync
                            value={[rightVal]}
                            onUpdate={(vals) => setRightSelectVal(vals[0])}
                            options={selectItems}
                            onFetch={hasNextPage ? getRevisions : undefined}
                        />
                        <ButtonNewWindow
                            className={b('btn-new-window')}
                            revId={rightLinkRevId}
                            disabled={rightVal === CURRENT}
                        />
                    </div>
                    {LoginById && (
                        <div className={b('users')}>
                            <div className={b('user')}>
                                <LoginById
                                    loginOrId={leftLogin}
                                    className={b('staff-user')}
                                    view="secondary"
                                />
                            </div>
                            <span className={b('mdash', {hidden: true})}>&mdash;</span>
                            <div className={b('user')}>
                                <LoginById
                                    loginOrId={rightLogin}
                                    className={b('staff-user')}
                                    view="secondary"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <PaneTabs
                    paneId="mock"
                    tabs={props.tabsData}
                    currentTabId={currentTabId}
                    onSelectTab={setCurrentTabId}
                    className={b('pane-tabs')}
                />
                <Checkbox size="m" onChange={toggleRenderSideBySide} checked={renderSideBySide}>
                    {i18n('component.editor-diff.view', 'field_split-diff')}
                </Checkbox>
            </div>
            {leftVal && rightVal && (
                <Editor
                    entry={props.entry}
                    tabsData={props.tabsData}
                    scriptsValues={props.scriptsValues}
                    revIdLeft={leftVal}
                    revIdRight={rightVal}
                    currentTabId={currentTabId}
                    renderSideBySide={renderSideBySide}
                />
            )}
        </div>
    );
};

export const RevisionsDiffDialog = (props: RevisionDiffDialogProps) => {
    return (
        <Dialog open={props.visible} onClose={props.onClose}>
            <Dialog.Body>
                <RevisionsDiff {...props} />
            </Dialog.Body>
        </Dialog>
    );
};
