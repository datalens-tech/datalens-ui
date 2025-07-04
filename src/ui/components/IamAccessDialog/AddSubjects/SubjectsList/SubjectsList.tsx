import React from 'react';

import {Plus, TrashBin} from '@gravity-ui/icons';
import {Button, Icon, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {SuggestBatchListMembersArgs} from 'ui/store/typings/iamAccessDialog';

import type {SubjectClaims} from '../../../../../shared/schema/extensions/types';
import {ClaimsSubjectType} from '../../../../../shared/schema/extensions/types';
import {registry} from '../../../../registry';
import type {IamAccessDialogDispatch} from '../../../../store/actions/iamAccessDialog';
import {suggestBatchListMembers} from '../../../../store/actions/iamAccessDialog';
import {selectItemsAccessBindings} from '../../../../store/selectors/iamAccessDialog';

import './SubjectsList.scss';

const b = block('dl-iam-access-dialog-add-subjects-subjects-list');

const i18n = I18n.keyset('component.iam-access-dialog');

export type Props = {
    resourceId: string;
    subjects: SubjectClaims[];
    onUpdateSubjects: (subjects: SubjectClaims[]) => void;
};

export const SubjectsList = ({resourceId, subjects, onUpdateSubjects}: Props) => {
    const dispatch = useDispatch<IamAccessDialogDispatch>();

    const accessBindings = useSelector(selectItemsAccessBindings);
    const directAccessBindings = accessBindings?.find((item) => item.resource.id === resourceId)
        ?.response.accessBindings;

    const membersIds = React.useMemo(() => {
        const result: string[] = [];
        if (directAccessBindings) {
            directAccessBindings.forEach((item) => {
                result.push(item.subject.id);
            });
        }
        return result;
    }, [directAccessBindings]);

    const suggestRef = React.useRef<HTMLElement>(null);
    const [suggestOpen, setSuggestOpen] = React.useState(true);

    const handleAddSubject = React.useCallback(
        (subject) => {
            if (!subjects.find((item) => item.sub === subject.sub)) {
                onUpdateSubjects([...subjects, subject]);
            }
        },
        [subjects, onUpdateSubjects],
    );

    const handleRemoveSubject = React.useCallback(
        (subject) => {
            return onUpdateSubjects(subjects.filter((item) => item.sub !== subject.sub));
        },
        [subjects, onUpdateSubjects],
    );

    const availableSubjectGroups = React.useMemo(() => {
        const result = [
            {
                id: ClaimsSubjectType.UserAccount,
                name: i18n('label_user-accounts'),
            },
            {
                id: ClaimsSubjectType.Group,
                name: i18n('label_groups'),
            },
            {
                id: ClaimsSubjectType.Invitee,
                name: i18n('label_invitee'),
            },
        ];

        return result;
    }, []);

    const {AclSubject, AclSubjectSuggest} = registry.common.components.getAll();
    const useSubjectsListId = registry.common.functions.get('useSubjectsListId');

    const {id} = useSubjectsListId();

    const fetchSubjectsCalls = React.useRef<{call: number; result: SubjectClaims[]}>({
        call: 0,
        result: [],
    });

    const fetchSubjects = React.useCallback(
        async (
            search,
            tabId: ClaimsSubjectType,
            pageToken?: string,
        ): Promise<{
            subjects: SubjectClaims[];
            nextPageToken?: string;
        }> => {
            const currentCall = fetchSubjectsCalls.current.call + 1;
            fetchSubjectsCalls.current.call = currentCall;

            const getListMembersFilter = registry.common.functions.get('getListMembersFilter');

            const filter = getListMembersFilter({
                search,
                tabId,
            });

            const batchListArgs: SuggestBatchListMembersArgs = {
                id,
                search,
                pageToken,
                tabId,
            };

            if (filter) {
                batchListArgs.filter = filter;
            }

            const suggestMembers = await dispatch(suggestBatchListMembers(batchListArgs));

            const filteredSuggestMembers = suggestMembers
                ? suggestMembers.subjects.filter((item) => !membersIds.includes(item.sub))
                : [];

            if (
                fetchSubjectsCalls.current.call > currentCall &&
                fetchSubjectsCalls.current.result
            ) {
                return {
                    subjects: fetchSubjectsCalls.current.result,
                    nextPageToken: suggestMembers?.nextPageToken,
                };
            } else {
                fetchSubjectsCalls.current.result = filteredSuggestMembers;
                return {
                    subjects: filteredSuggestMembers,
                    nextPageToken: suggestMembers?.nextPageToken,
                };
            }
        },
        [dispatch, id, membersIds],
    );

    return (
        <div className={b()}>
            <Button
                ref={suggestRef as React.RefObject<HTMLButtonElement>}
                onClick={() => {
                    setSuggestOpen(true);
                }}
            >
                <Icon data={Plus} height={12} width={12} />
                {i18n('action_choose-user')}
            </Button>

            <Popup
                anchorElement={suggestRef.current}
                open={suggestOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setSuggestOpen(false);
                    }
                }}
            >
                <AclSubjectSuggest
                    availableGroups={availableSubjectGroups}
                    fetchSubjects={fetchSubjects}
                    onSubjectChange={(subject) => {
                        handleAddSubject(subject);
                        setSuggestOpen(false);
                    }}
                />
            </Popup>

            {subjects.length > 0 && (
                <div className={b('subjects')}>
                    {subjects.map((subject) => (
                        <div key={subject.sub} className={b('subject')}>
                            <div className={b('subject-info')}>
                                <AclSubject subjectClaims={subject} />
                            </div>
                            <Button
                                className={b('delete-subject')}
                                onClick={() => {
                                    handleRemoveSubject(subject);
                                }}
                                view="flat"
                            >
                                <Icon
                                    data={TrashBin}
                                    className={b('delete-subject-icon')}
                                    width="16"
                                    height="16"
                                />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
