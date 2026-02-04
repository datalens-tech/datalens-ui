import React from 'react';

import {Button, Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import type {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';

import type {SubjectClaims} from '../../../../../../shared/schema/extensions/types';
import {AccessBindingAction} from '../../../../../../shared/schema/extensions/types';
import type {IamAccessDialogDispatch} from '../../../../../store/actions/iamAccessDialog';
import {
    updateAccessBindings,
    updateListAccessBindingsInline,
} from '../../../../../store/actions/iamAccessDialog';
import {SmartLoader} from '../../../../SmartLoader/SmartLoader';
import {getAccessSubjectType} from '../../../utils';

import iconTrash from '@gravity-ui/icons/svgs/trash-bin.svg';

import './Controls.scss';

const b = block('dl-iam-access-dialog-access-list-direct-accesses-table-controls');

export type Props = {
    subject: SubjectClaims;
    resourceId: string;
    resourceType: ResourceType;
    role: string;
    options: {
        title: string;
        value: string;
    }[];
    canUpdate: boolean;
    onDeleteButtonClick: () => void;
};

export const Controls = ({
    subject,
    resourceId,
    resourceType,
    role,
    options,
    canUpdate,
    onDeleteButtonClick,
}: Props) => {
    const dispatch = useDispatch<IamAccessDialogDispatch>();

    const [changeIsLoading, setChangeIsLoading] = React.useState(false);

    return (
        <div className={b()}>
            <div className={b('change-role')}>
                {changeIsLoading && (
                    <div className={b('change-role-loader')}>
                        <SmartLoader size="s" showAfter={0} />
                    </div>
                )}

                <Select
                    className={b('change-role-select')}
                    value={[role]}
                    disabled={!canUpdate || changeIsLoading}
                    onUpdate={([newRole]) => {
                        setChangeIsLoading(true);

                        const newAccessBinding = {
                            roleId: newRole,
                            subject: {
                                id: subject.sub,
                                type: getAccessSubjectType(subject),
                            },
                        };

                        dispatch(
                            updateAccessBindings({
                                resourceId,
                                resourceType,
                                deltas: [
                                    {
                                        action: AccessBindingAction.Remove,
                                        accessBinding: {
                                            roleId: role,
                                            subject: {
                                                id: subject.sub,
                                                type: getAccessSubjectType(subject),
                                            },
                                        },
                                    },
                                    {
                                        action: AccessBindingAction.Add,
                                        accessBinding: newAccessBinding,
                                    },
                                ],
                            }),
                        ).then((res) => {
                            if (res) {
                                dispatch(
                                    updateListAccessBindingsInline({
                                        resourceId,
                                        subjectId: subject.sub,
                                        roleId: newRole,
                                    }),
                                );
                            }
                            setChangeIsLoading(false);
                        });
                    }}
                >
                    {options.map((option) => (
                        <Select.Option
                            key={option.value}
                            value={option.value}
                            content={option.title}
                        />
                    ))}
                </Select>
            </div>
            <Button
                className={b('delete-role')}
                disabled={!canUpdate}
                onClick={onDeleteButtonClick}
                view="flat"
            >
                <Icon className={b('delete-role-icon')} data={iconTrash} width="16" height="16" />
            </Button>
        </div>
    );
};
