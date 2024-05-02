import React from 'react';

import {PencilToLine} from '@gravity-ui/icons';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18N} from 'i18n';
import {batch, useDispatch, useSelector} from 'react-redux';

import {DIALOG_EDIT_WORKBOOK} from '../../../../../components/CollectionsStructure';
import {DL} from '../../../../../constants/common';
import {registry} from '../../../../../registry';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {setCollection} from '../../../../collections/store/actions';
import {
    CollectionBreadcrumbs,
    cutBreadcrumbs,
} from '../../../../collections-navigation/components/CollectionBreadcrumbs';
import {LayoutContext} from '../../../../collections-navigation/contexts/LayoutContext';
import {setCollectionBreadcrumbs} from '../../../../collections-navigation/store/actions';
import {
    selectCollectionBreadcrumbs,
    selectCollectionBreadcrumbsError,
} from '../../../../collections-navigation/store/selectors';
import {selectPageError, selectWorkbook, selectWorkbookFilters} from '../../../store/selectors';
import {WorkbookActions} from '../../WorkbookActions/WorkbookActions';

const b = block('dl-workbook-page');

const i18n = I18N.keyset('new-workbooks');

type UseLayoutArgs = {
    workbookId: string;
    refreshWorkbookInfo: () => void;
};

export const useLayout = ({workbookId, refreshWorkbookInfo}: UseLayoutArgs) => {
    const {ActionPanelEntrySelect} = registry.common.components.getAll();

    const {setLayout} = React.useContext(LayoutContext);

    const dispatch = useDispatch<AppDispatch>();

    const workbook = useSelector(selectWorkbook);
    const filters = useSelector(selectWorkbookFilters);
    const breadcrumbs = useSelector(selectCollectionBreadcrumbs);
    const breadcrumbsError = useSelector(selectCollectionBreadcrumbsError);
    const pageError = useSelector(selectPageError);

    const isCorrectWorkbook = workbook && workbook.workbookId === workbookId;
    const isCorrectBreadcrumbs = Boolean(
        workbook &&
            (workbook.collectionId === null ||
                (breadcrumbs &&
                    breadcrumbs[breadcrumbs.length - 1]?.collectionId === workbook.collectionId)),
    );

    React.useEffect(() => {
        setLayout({
            actionsPanelLeftBlock: {
                content: (
                    <React.Fragment>
                        <ActionPanelEntrySelect />
                        <CollectionBreadcrumbs
                            className={b('breadcrumbs', {'is-mobile': DL.IS_MOBILE})}
                            isLoading={!(isCorrectBreadcrumbs || breadcrumbsError)}
                            collections={breadcrumbs ?? []}
                            workbook={workbook}
                            onItemClick={({isCurrent, id}) => {
                                if (!isCurrent && id !== null) {
                                    batch(() => {
                                        const newBreadcrumbs = cutBreadcrumbs(
                                            id,
                                            breadcrumbs ?? [],
                                        );
                                        dispatch(setCollectionBreadcrumbs(newBreadcrumbs));

                                        const curBreadcrumb =
                                            newBreadcrumbs[newBreadcrumbs.length - 1];
                                        if (newBreadcrumbs[newBreadcrumbs.length - 1]) {
                                            dispatch(setCollection(curBreadcrumb));
                                        }
                                    });
                                }
                            }}
                        />
                    </React.Fragment>
                ),
            },
        });
    }, [
        ActionPanelEntrySelect,
        breadcrumbs,
        breadcrumbsError,
        dispatch,
        filters,
        isCorrectBreadcrumbs,
        isCorrectWorkbook,
        setLayout,
        workbook,
        workbookId,
    ]);

    React.useEffect(() => {
        if (isCorrectWorkbook && workbook) {
            setLayout({
                actionsPanelRightBlock: {
                    content: (
                        <WorkbookActions
                            workbook={workbook}
                            refreshWorkbookInfo={refreshWorkbookInfo}
                        />
                    ),
                },
            });
        } else {
            setLayout({
                actionsPanelRightBlock: {
                    isLoading: true,
                },
            });
        }
    }, [dispatch, isCorrectWorkbook, refreshWorkbookInfo, setLayout, workbook]);

    React.useEffect(() => {
        if (isCorrectWorkbook && workbook) {
            setLayout({
                titleActionsBlock: {
                    content: workbook?.permissions.update ? (
                        <Tooltip content={i18n('action_edit')}>
                            <div>
                                <Button
                                    onClick={() => {
                                        dispatch(
                                            openDialog({
                                                id: DIALOG_EDIT_WORKBOOK,
                                                props: {
                                                    open: true,
                                                    workbookId: workbook.workbookId,
                                                    title: workbook.title,
                                                    description: workbook?.description ?? '',
                                                    onApply: refreshWorkbookInfo,
                                                    onClose: () => {
                                                        dispatch(closeDialog());
                                                    },
                                                },
                                            }),
                                        );
                                    }}
                                >
                                    <Icon data={PencilToLine} />
                                </Button>
                            </div>
                        </Tooltip>
                    ) : null,
                },
                title: {
                    content: workbook.title,
                },
                description: workbook.description
                    ? {
                          content: workbook.description,
                      }
                    : null,
            });
        } else {
            setLayout({
                titleActionsBlock: {
                    isLoading: true,
                },
                title: {
                    isLoading: true,
                },
                description: null,
            });
        }
    }, [dispatch, isCorrectWorkbook, refreshWorkbookInfo, setLayout, workbook]);

    React.useEffect(() => {
        setLayout({
            titleRightBlock: null,
        });
    }, [dispatch, setLayout]);

    React.useEffect(() => {
        if (pageError) {
            setLayout({
                actionsPanelLeftBlock: null,
                actionsPanelRightBlock: null,
                title: null,
                titleActionsBlock: null,
                titleRightBlock: null,
                description: null,
            });
        }
    }, [pageError, setLayout]);
};
