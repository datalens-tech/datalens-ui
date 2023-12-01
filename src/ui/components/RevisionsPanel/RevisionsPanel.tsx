import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import {EntryScope} from 'shared';
import type {AppDispatch} from 'store';
import {closeDialog as closeDialogConfirm, openDialogConfirm} from 'store/actions/dialog';
import {setRevisionsListMode, setRevisionsMode} from 'store/actions/entryContent';
import {selectEntryContent} from 'store/selectors/entryContent';
import {EntryGlobalState, RevisionsListMode, RevisionsMode} from 'store/typings/entryContent';
import {TIMESTAMP_FORMAT, URL_QUERY} from 'ui/constants';
import {registry} from 'ui/registry';

import {getUrlParamFromStr} from '../../utils';
import history from '../../utils/history';
import {getCapitalizedStr} from '../../utils/stringUtils';

import RevisionsControls from './components/RevisionsControls';
import {getAvailableScopes, getDraftWarningAvailableScopes} from './utils';

import './RevisionsPanel.scss';

export type RevisionsPanelProps = {
    entry: EntryGlobalState;
    leftStyle: React.CSSProperties;
    onSetActualRevision: () => void;
    onOpenActualRevision: () => void;
    onOpenDraftRevision: () => void;
    setRevisionsMode?: (mode: RevisionsMode) => void;
    setRevisionsListMode?: (mode: RevisionsListMode) => void;
    isEditing: boolean;
};

const b = block('revisions-panel');
const i18n = I18n.keyset('component.revisions-panel.view');

const SCOPE_TEXTS: Record<string, string> = {
    dash: i18n('label_dash'),
    widget: i18n('label_chart'),
    editor: i18n('label_editor'),
};
export const SCOPE_TEXTS_PANEL: Record<string, string> = {
    dash: i18n('label_of-dash'),
    widget: i18n('label_of-chart'),
    editor: i18n('label_of-editor'),
};

export const lockedTextInfo = (loginOrId: string, scope: string) => {
    const {getLoginById} = registry.common.functions.getAll();
    const LoginById = getLoginById();

    const showLogin = LoginById && loginOrId && loginOrId !== 'unknown';

    return (
        <div>
            {showLogin ? (
                <React.Fragment>
                    <LoginById
                        loginOrId={loginOrId}
                        className={b('locked-login')}
                        view="secondary"
                    />
                    &nbsp;
                    {i18n('label_entry-is-editing-by', {scope: SCOPE_TEXTS[scope]})}
                </React.Fragment>
            ) : (
                i18n('label_already-editing-entry', {scope: SCOPE_TEXTS[scope]})
            )}
        </div>
    );
};

type LockedTextInfoParams = {
    loginOrId: string;
    scope: string;
    callback: () => void;
    onError: (params: {title: string; name: string; error: Error}) => void;
};

export const setLockedTextInfo = ({loginOrId, scope, callback, onError}: LockedTextInfoParams) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialogConfirm({
                onApply: () => {
                    try {
                        dispatch(closeDialogConfirm());
                        callback();
                    } catch (error) {
                        onError({
                            title: i18n('label_unexpected-error'),
                            name: 'RevisionsPanel.setLockedTextInfo.error',
                            error,
                        });
                    }
                },
                message: lockedTextInfo(loginOrId, scope),
                cancelButtonView: 'flat',
                confirmButtonView: 'normal',
                isWarningConfirm: true,
                showIcon: false,
                onCancel: () => {
                    dispatch(closeDialogConfirm());
                },
                widthType: 'medium',
                confirmHeaderText: getCapitalizedStr(
                    i18n('label_entry-is-editing', {scope: SCOPE_TEXTS[scope]}),
                ),
                cancelButtonText: i18n('button_cancel'),
                confirmButtonText: i18n('button_edit-anyway'),
            }),
        );
    };
};

const RevisionsPanel = ({
    entry,
    leftStyle,
    onOpenActualRevision,
    onSetActualRevision,
    onOpenDraftRevision,
    isEditing,
}: RevisionsPanelProps) => {
    const dispatch = useDispatch();
    const storedEntryContent = useSelector(selectEntryContent);

    const {scope, updatedBy, updatedAt} = entry;
    const {publishedId, currentRevId, savedId, revisionsLoadingStatus} = storedEntryContent;

    const urlRevId = getUrlParamFromStr(location.search, URL_QUERY.REV_ID);
    const isInAvailableScopes = React.useMemo(
        () => getAvailableScopes().includes(scope as EntryScope),
        [location, scope],
    );
    const isDraftInAvailableScopes = React.useMemo(
        () => getDraftWarningAvailableScopes().includes(scope as EntryScope),
        [location, scope],
    );
    const isCurrentRevDraft = savedId === urlRevId;

    const showDraftWarningPanel =
        currentRevId &&
        currentRevId === publishedId &&
        savedId !== publishedId &&
        isInAvailableScopes &&
        isDraftInAvailableScopes;

    const isPanelHidden =
        !currentRevId ||
        !urlRevId ||
        currentRevId === publishedId ||
        !(typeof scope === 'undefined' || isInAvailableScopes) ||
        isEditing;

    const handleMakeActualClick = React.useCallback(() => {
        onSetActualRevision();
    }, [onSetActualRevision]);

    const handleOpenActualClick = React.useCallback(() => {
        onOpenActualRevision();

        const searchParams = new URLSearchParams(location.search);
        searchParams.delete(URL_QUERY.REV_ID);

        history.push({
            ...location,
            search: `?${searchParams.toString()}`,
        });
    }, [onOpenActualRevision, location]);

    const handleOpenRevisionsClick = React.useCallback(() => {
        dispatch(setRevisionsMode?.(RevisionsMode.Opened));
        dispatch(setRevisionsListMode?.(RevisionsListMode.Expanded));
    }, [dispatch]);

    const handleOpenDraftClick = React.useCallback(() => {
        onOpenDraftRevision();

        const searchParams = new URLSearchParams(location.search);
        if (savedId === publishedId) {
            searchParams.delete(URL_QUERY.REV_ID);
        } else {
            searchParams.set(URL_QUERY.REV_ID, savedId);
        }
        history.push({
            ...location,
            search: `?${searchParams.toString()}`,
        });
    }, [onOpenDraftRevision, savedId, publishedId, location]);

    if (isPanelHidden && !showDraftWarningPanel) {
        return null;
    }

    const scopeText = SCOPE_TEXTS_PANEL[scope] || '';
    const date = moment(updatedAt).format(TIMESTAMP_FORMAT);

    const {getLoginById} = registry.common.functions.getAll();
    const LoginById = getLoginById();

    let warningText = '';
    let loginText = null;
    let dateText = '';
    if (showDraftWarningPanel) {
        warningText = `${i18n('label_later-warning-text', {scope: scopeText})}`;
    } else {
        dateText = `${i18n('label_by')} ${date}`;
        const prefixText = isCurrentRevDraft
            ? i18n('label_draft-version')
            : i18n('label_not-actual');
        warningText = `${prefixText} ${scopeText}, ${dateText}`;

        const showLogin = LoginById && updatedBy;

        loginText = showLogin ? (
            <React.Fragment>
                (
                <LoginById loginOrId={updatedBy} className={b('text-login')} view="light-primary" />
                )
            </React.Fragment>
        ) : null;
    }

    return (
        <div className={b('wrap', null, 'active')}>
            <div className={b('text-container')} style={leftStyle} data-qa="revisions-top-panel">
                <div className={b('text')}>
                    <div className={b('text-info')}>{warningText}</div>
                    {loginText}
                </div>
                <RevisionsControls
                    canEdit={Boolean(entry.permissions?.edit || !entry.permissions)}
                    onMakeActualClickCallback={handleMakeActualClick}
                    onOpenActualClickCallback={handleOpenActualClick}
                    onOpenRevisionsClickCallback={handleOpenRevisionsClick}
                    onOpenDraftClickCallback={handleOpenDraftClick}
                    isDraft={Boolean(showDraftWarningPanel)}
                    isLoading={revisionsLoadingStatus === 'loading'}
                />
            </div>
        </div>
    );
};

export default RevisionsPanel;
