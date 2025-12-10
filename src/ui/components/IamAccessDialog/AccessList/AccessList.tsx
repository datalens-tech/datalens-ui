import React from 'react';

import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Waypoint} from 'react-waypoint';
import type {SharedScope} from 'shared';
import {Utils} from 'ui';
import type {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';

import type {
    ListAccessBindingsResultItem,
    PageTokenData,
} from '../../../../shared/schema/extensions/types';
import {
    selectGetCollectionBreadcrumbsData,
    selectGetCollectionBreadcrumbsError,
    selectItemsAccessBindings,
    selectListAccessBindingsError,
    selectListAccessBindingsIsLoading,
    selectMembersItems,
} from '../../../store/selectors/iamAccessDialog';
import {SmartLoader} from '../../SmartLoader/SmartLoader';

import {ActionPanel} from './ActionPanel/ActionPanel';
import {Block} from './Block/Block';
import type {DirectAccessesTableRow} from './DirectAccessesTable/DirectAccessesTable';
import {DirectAccessesTable} from './DirectAccessesTable/DirectAccessesTable';
import type {InheritedAccessesTableRow} from './InheritedAccessesTable/InheritedAccessesTable';
import {InheritedAccessesTable} from './InheritedAccessesTable/InheritedAccessesTable';

import './AccessList.scss';

const b = block('dl-iam-access-dialog-access-list');

const i18n = I18n.keyset('component.iam-access-dialog');

export type Props = {
    resourceId: string;
    resourceType: ResourceType;
    resourceTitle: string;
    resourceScope?: SharedScope;
    canUpdate: boolean;
    refetch: () => void;
    loadMoreInheritedAccessBindings: (pageTokenData?: PageTokenData) => void;
    onAddUserClick: () => void;
    onClose: () => void;
    isLoadingDirect: boolean;
    isLoadingInherited: boolean;
};

export const AccessList = React.memo<Props>(
    ({
        resourceId,
        resourceType,
        resourceTitle,
        canUpdate,
        refetch,
        loadMoreInheritedAccessBindings,
        onAddUserClick,
        onClose,
        isLoadingDirect,
        isLoadingInherited,
        resourceScope,
    }) => {
        const accessBindingsError = useSelector(selectListAccessBindingsError);
        const accessBindings: ListAccessBindingsResultItem[] | null =
            useSelector(selectItemsAccessBindings);

        const members = useSelector(selectMembersItems);

        const breadcrumbs = useSelector(selectGetCollectionBreadcrumbsData);
        const breadcrumbsError = useSelector(selectGetCollectionBreadcrumbsError);

        const isLoadingListAccessBindings = useSelector(selectListAccessBindingsIsLoading);

        const inheritedAccesses = React.useMemo<InheritedAccessesTableRow[]>(() => {
            if (accessBindings && members && breadcrumbs) {
                const inheritedItems = accessBindings.filter(
                    (item: ListAccessBindingsResultItem) => item.resource.id !== resourceId,
                );

                return inheritedItems
                    .reduce<InheritedAccessesTableRow[]>((acc, inheritedItem) => {
                        acc.push(
                            ...inheritedItem.response.accessBindings.map((binding) => {
                                const collection = breadcrumbs.find(
                                    (breadcrumb) =>
                                        breadcrumb.collectionId === inheritedItem.resource.id,
                                );
                                const user = members.find(
                                    (member) => member.subjectClaims.sub === binding.subject.id,
                                );

                                return {
                                    user,
                                    object: {
                                        id: inheritedItem.resource.id,
                                        title: collection?.title ?? '',
                                    },
                                    role: binding.roleId,
                                };
                            }),
                        );
                        return acc;
                    }, [])
                    .filter((inheritedItem) => inheritedItem.user);
            }
            return [];
        }, [accessBindings, breadcrumbs, resourceId, members]);

        const directAccesses = React.useMemo<DirectAccessesTableRow[]>(() => {
            if (accessBindings && members) {
                const directItem = accessBindings.find((item) => item.resource.id === resourceId);

                if (directItem) {
                    return directItem.response.accessBindings
                        .map((binding) => {
                            const user = members.find(
                                (member) => member.subjectClaims.sub === binding.subject.id,
                            );

                            return {
                                user,
                                object: {
                                    id: directItem.resource.id,
                                    type: resourceType,
                                    title: resourceTitle,
                                },
                                role: binding.roleId,
                            };
                        })
                        .filter((item) => item.user);
                }
            }
            return [];
        }, [accessBindings, resourceId, resourceType, resourceTitle, members]);

        const isShowAccessError =
            breadcrumbsError && Utils.parseErrorResponse(breadcrumbsError).status === 403;

        const firstPageError = accessBindingsError && directAccesses.length === 0;

        const pageTokenData = accessBindings
            ?.map((accessBinding) => {
                return {
                    id: accessBinding.resource.id,
                    type: accessBinding.resource.type,
                    pageToken: accessBinding.response.nextPageToken,
                };
            })
            .filter((accessBinding) => {
                return accessBinding.pageToken && accessBinding.id !== resourceId;
            });

        const buttonRetry = (
            <div className={b('btn-retry')}>
                <Button
                    view="action"
                    size="m"
                    onClick={() => loadMoreInheritedAccessBindings(pageTokenData)}
                >
                    {i18n('button_bindings-list-retry')}
                </Button>
            </div>
        );

        let footerInheritedAccessesTable: React.ReactNode = null;

        if (isLoadingInherited) {
            footerInheritedAccessesTable = <SmartLoader size="s" showAfter={0} />;
        } else if (firstPageError) {
            footerInheritedAccessesTable = buttonRetry;
        }

        const renderInheritedAccessesTable = () => {
            return isLoadingInherited && inheritedAccesses?.length === 0 ? (
                <SmartLoader size="m" showAfter={0} />
            ) : (
                <>
                    <InheritedAccessesTable data={inheritedAccesses} />

                    {footerInheritedAccessesTable}

                    {!isLoadingListAccessBindings && (
                        <Waypoint
                            onPositionChange={() => {
                                loadMoreInheritedAccessBindings(pageTokenData);
                            }}
                        />
                    )}
                </>
            );
        };

        const renderDirectAccessesTable = () => {
            return isLoadingDirect ? (
                <SmartLoader size="m" showAfter={0} />
            ) : (
                <DirectAccessesTable
                    data={directAccesses}
                    canUpdate={canUpdate}
                    refetch={refetch}
                />
            );
        };

        return (
            <React.Fragment>
                <Dialog.Header caption={i18n('title_access-list')} />
                <Dialog.Body className={b()}>
                    <ActionPanel
                        type={resourceType}
                        title={resourceTitle}
                        resourceScope={resourceScope}
                        canUpdate={canUpdate}
                        onAddUserClick={onAddUserClick}
                        isLoadingDirect={isLoadingDirect}
                    />
                    <div className={b('blocks')}>
                        <Block
                            className={b('block')}
                            title={i18n('section_inherited_accesses')}
                            isLoading={isLoadingInherited}
                            defaultIsExpand={false}
                        >
                            {isShowAccessError
                                ? i18n('label_access_error')
                                : renderInheritedAccessesTable()}
                        </Block>
                        <Block
                            className={b('block')}
                            title={i18n('section_direct_accesses')}
                            isLoading={isLoadingDirect}
                            counter={directAccesses?.length}
                            defaultIsExpand={true}
                        >
                            {renderDirectAccessesTable()}
                        </Block>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    textButtonCancel={i18n('action_close')}
                    onClickButtonCancel={onClose}
                />
            </React.Fragment>
        );
    },
);

AccessList.displayName = 'AccessList';
