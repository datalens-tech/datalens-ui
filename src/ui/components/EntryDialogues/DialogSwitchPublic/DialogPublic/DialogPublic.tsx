import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Alert, Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {YfmWrapper} from 'ui/components/YfmWrapper/YfmWrapper';
import {formDocsEndpointDL} from 'ui/utils/docs';

import AuthorSection from './AuthorSection/AuthorSection';
import ContentError from './ContentError/ContentError';
import ContentLoader from './ContentLoader/ContentLoader';
import CurrentEntrySection from './CurrentEntrySection/CurrentEntrySection';
import DialogAlert from './DialogAlert/DialogAlert';
import RelationsList from './RelationsList/RelationsList';
import {DIALOG_STATUS, RESOLVE_STATUS} from './constants';
import type {DialogPublicCloseCallback, EntryData, EntryRelationExtended, State} from './types';
import {
    DIALOG_PUBLIC_CHANGE_ENTRY_AUTHOR,
    DIALOG_PUBLIC_CHANGE_RELATIONS_ENTRIES,
    DIALOG_PUBLIC_SET_PUBLISH_UNPUBLISH_ONCE,
} from './types';
import {useDialogPublicState} from './useDialogPublicState';

import './DialogPublic.scss';

const b = block('dl-dialog-make-public');
const i18n = I18n.keyset('component.dialog-switch-public.view');

type Props = {
    onClose: DialogPublicCloseCallback;
    visible: boolean;
    entry: EntryData;
};

function DialogPublic({onClose, visible, entry: propsEntry}: Props) {
    const alertDialogRef: React.MutableRefObject<any | null> = React.useRef(null);
    const {state, apply, refetch, disableApply, dispatchAction} = useDialogPublicState({
        entry: propsEntry,
        onClose,
    });

    async function onChangeCurrentEntry() {
        const newState: Partial<Pick<State, 'onceChangePublish' | 'onceChangeUnpublish'>> = {};
        if (!state.onceChangeUnpublish && state.entry.public && state.currentEntryChecked) {
            const result = await alertDialogRef.current?.open({publish: false});
            if (result.status === RESOLVE_STATUS.CLOSE) {
                return;
            }
            newState.onceChangeUnpublish = true;
        } else if (!state.onceChangePublish && !state.entry.public && !state.currentEntryChecked) {
            const result = await alertDialogRef.current?.open({publish: true});
            if (result.status === RESOLVE_STATUS.CLOSE) {
                return;
            }
            newState.onceChangePublish = true;
        }

        dispatchAction(DIALOG_PUBLIC_SET_PUBLISH_UNPUBLISH_ONCE, newState);
    }

    async function onChangeRelationsEntries({
        relations,
        nextChecked,
    }: {
        relations: Array<EntryRelationExtended>;
        nextChecked: boolean;
    }) {
        const newState: Partial<Pick<State, 'onceChangePublish' | 'onceChangeUnpublish'>> & {
            relations: Array<EntryRelationExtended>;
            nextChecked: boolean;
        } = {
            relations,
            nextChecked,
        };
        if (
            !state.onceChangeUnpublish &&
            !nextChecked &&
            relations.some((relationEntry) => relationEntry.public && relationEntry.checked)
        ) {
            const result = await alertDialogRef.current.open({
                publish: false,
                many: relations.length > 1,
            });
            if (result.status === RESOLVE_STATUS.CLOSE) {
                return;
            }
            newState.onceChangeUnpublish = true;
        } else if (
            !state.onceChangePublish &&
            nextChecked &&
            relations.some((relationEntry) => !relationEntry.public && !relationEntry.checked)
        ) {
            const result = await alertDialogRef.current.open({
                publish: true,
                many: relations.length > 1,
            });
            if (result.status === RESOLVE_STATUS.CLOSE) {
                return;
            }
            newState.onceChangePublish = true;
        }
        dispatchAction(DIALOG_PUBLIC_CHANGE_RELATIONS_ENTRIES, newState);
    }

    async function onChangeEntryAuthor({link, text}: {link?: string; text?: string}) {
        dispatchAction(DIALOG_PUBLIC_CHANGE_ENTRY_AUTHOR, {
            link,
            text,
        });
    }

    function renderContent() {
        const scope = state.entry.scope as 'dash' | 'widget';
        const attentionMessage = state.hasLockedEntries
            ? i18n('md_label_unavaible-publication-attention', {
                  link: formDocsEndpointDL('/concepts/datalens-public#rules'),
              })
            : i18n('label_main-attention', {
                  subject: i18n(`label_main-subject-${scope}`),
              });

        return (
            <React.Fragment>
                <Alert
                    theme="danger"
                    message={<YfmWrapper content={attentionMessage} setByInnerHtml />}
                    icon={
                        <div className={b('attention-icon')}>
                            <TriangleExclamationFill width={16} height={16} />
                        </div>
                    }
                />

                <CurrentEntrySection
                    className={b('current-entry')}
                    entry={state.entry}
                    checked={state.currentEntryChecked}
                    onChange={onChangeCurrentEntry}
                    progress={state.progress}
                    disabled={state.currentEntryDisabled}
                    tooltip={state.currentEntryTooltip}
                />
                <AuthorSection
                    validationErrors={state.validationErrors}
                    className={b('author-section')}
                    authorData={state.entryAuthor}
                    onChange={onChangeEntryAuthor}
                    progress={state.progress}
                    disabled={state.currentEntryDisabled}
                    scope={scope}
                />
                <RelationsList
                    progress={state.progress}
                    onChange={onChangeRelationsEntries}
                    groups={state.groups}
                />
                <DialogAlert ref={alertDialogRef} />
            </React.Fragment>
        );
    }

    function renderBody() {
        if (state.status === DIALOG_STATUS.SUCCESS) {
            return renderContent();
        }
        if (state.status === DIALOG_STATUS.FAILED) {
            return (
                <ContentError
                    buttonText={i18n('button_repeat')}
                    errorText={state.error.title || i18n('label_loading-failed')}
                    errorDescription={state.error.description}
                    onClick={refetch}
                />
            );
        }
        return <ContentLoader />;
    }

    return (
        <Dialog open={visible} onClose={() => onClose('close', false)}>
            <div className={b()}>
                <Dialog.Header caption={i18n('section_main-title')} />
                <Dialog.Body className={b('body')}>
                    <div className={b('content')}>{renderBody()}</div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => onClose('close', false)}
                    onClickButtonApply={() => apply()}
                    textButtonApply={i18n('button_apply')}
                    textButtonCancel={i18n('button_cancel')}
                    propsButtonApply={{disabled: disableApply}}
                    loading={state.progress}
                >
                    <Button view="outlined" size="l" disabled={state.progress} onClick={refetch}>
                        {i18n('button_refresh')}
                    </Button>
                </Dialog.Footer>
            </div>
        </Dialog>
    );
}

export default DialogPublic;
