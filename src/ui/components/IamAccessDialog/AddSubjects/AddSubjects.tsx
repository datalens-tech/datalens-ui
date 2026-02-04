import React from 'react';

import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {SharedScope} from 'shared';
import type {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';

import type {AccessBindingDelta, SubjectClaims} from '../../../../shared/schema/extensions/types';
import {AccessBindingAction} from '../../../../shared/schema/extensions/types';
import type {IamAccessDialogDispatch} from '../../../store/actions/iamAccessDialog';
import {updateAccessBindings} from '../../../store/actions/iamAccessDialog';
import {getAccessSubjectType, getResourceRoles} from '../utils';

import {ActionPanel} from './ActionPanel/ActionPanel';
import {SubjectsList} from './SubjectsList/SubjectsList';

import './AddSubjects.scss';

const b = block('dl-iam-access-dialog-add-subjects');

const i18n = I18n.keyset('component.iam-access-dialog');

export type Props = {
    resourceId: string;
    resourceType: ResourceType;
    resourceScope?: SharedScope;
    resourceTitle: string;
    refetch: () => void;
    onBack: () => void;
};

export const AddSubjects = React.memo<Props>(
    ({resourceId, resourceType, resourceTitle, refetch, resourceScope, onBack}) => {
        const dispatch = useDispatch<IamAccessDialogDispatch>();

        const options = getResourceRoles(resourceType);

        const [role, setRole] = React.useState(options[0]?.value);

        const [subjects, setSubjects] = React.useState<SubjectClaims[]>([]);

        const handleUpdateSubjects = React.useCallback((newValue) => {
            setSubjects(newValue);
        }, []);

        const [isLoading, setIsLoading] = React.useState(false);

        const isClickButtonDisabled = isLoading || subjects.length === 0;

        const handleSubmit = React.useCallback(() => {
            setIsLoading(true);
            dispatch(
                updateAccessBindings({
                    resourceId,
                    resourceType,
                    deltas: subjects.map<AccessBindingDelta>((subject) => ({
                        action: AccessBindingAction.Add,
                        accessBinding: {
                            roleId: role,
                            subject: {
                                id: subject.sub,
                                type: getAccessSubjectType(subject),
                            },
                        },
                    })),
                }),
            ).then((res) => {
                if (res) {
                    refetch();
                    onBack();
                }
                setIsLoading(false);
            });
        }, [resourceId, resourceType, role, subjects, dispatch, refetch, onBack]);

        return (
            <React.Fragment>
                <Dialog.Header
                    caption={
                        <div className={b('header')}>
                            <Button onClick={onBack} view="flat" disabled={isLoading}>
                                <Icon data={ArrowLeft} width="20" height="20" />
                            </Button>
                            <div className={b('title')}>{i18n('title_add-user')}</div>
                        </div>
                    }
                />
                <Dialog.Body>
                    <ActionPanel
                        type={resourceType}
                        title={resourceTitle}
                        resourceScope={resourceScope}
                        options={options}
                        role={role}
                        onChangeRole={setRole}
                    />
                    <div className={b('subjects-list')}>
                        <SubjectsList
                            resourceId={resourceId}
                            subjects={subjects}
                            onUpdateSubjects={handleUpdateSubjects}
                        />
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    textButtonCancel={i18n('action_cancel')}
                    onClickButtonCancel={onBack}
                    propsButtonCancel={{
                        disabled: isLoading,
                    }}
                    textButtonApply={i18n('action_save')}
                    onClickButtonApply={handleSubmit}
                    propsButtonApply={{
                        disabled: isClickButtonDisabled,
                        loading: isLoading,
                    }}
                />
            </React.Fragment>
        );
    },
);

AddSubjects.displayName = 'AddSubjects';
