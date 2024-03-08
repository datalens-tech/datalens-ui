import React from 'react';

import block from 'bem-cn-lite';
// import {I18N} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {EntryScope} from '../../../../../../shared/types';
import {DL} from '../../../../../constants/common';
import {registry} from '../../../../../registry';
import {AppDispatch} from '../../../../../store';
import {CollectionBreadcrumbs} from '../../../../collections-navigation/components/CollectionBreadcrumbs/CollectionBreadcrumbs';
import {LayoutContext} from '../../../../collections-navigation/contexts/LayoutContext';
import {getWorkbookEntries, resetWorkbookEntries} from '../../../store/actions';
import {selectBreadcrumbs, selectWorkbook, selectWorkbookFilters} from '../../../store/selectors';
import {WorkbookActions} from '../../WorkbookActions/WorkbookActions';

const b = block('dl-workbook-page');

// const i18n = I18N.keyset('new-workbooks');

type UseLayoutArgs = {
    workbookId: string;
    scope?: EntryScope;
    refreshWorkbookInfo: () => void;
};

export const useLayout = ({workbookId, scope, refreshWorkbookInfo}: UseLayoutArgs) => {
    const {ActionPanelEntrySelect} = registry.common.components.getAll();

    const {setLayout} = React.useContext(LayoutContext);

    const dispatch = useDispatch<AppDispatch>();

    const workbook = useSelector(selectWorkbook);
    const breadcrumbs = useSelector(selectBreadcrumbs);
    const filters = useSelector(selectWorkbookFilters);

    React.useEffect(() => {
        setLayout({
            actionsPanelLeftBlock: {
                content: (
                    <div className={b('action-panel-left-block')}>
                        <ActionPanelEntrySelect />
                        {workbook && (
                            <CollectionBreadcrumbs
                                className={b('breadcrumbs', {'is-mobile': DL.IS_MOBILE})}
                                collectionBreadcrumbs={breadcrumbs ?? []}
                                workbook={workbook}
                                onCurrentItemClick={() => {
                                    dispatch(resetWorkbookEntries());
                                    dispatch(
                                        getWorkbookEntries({
                                            workbookId,
                                            filters,
                                            scope,
                                        }),
                                    );
                                }}
                            />
                        )}
                    </div>
                ),
            },
        });
    }, [
        ActionPanelEntrySelect,
        breadcrumbs,
        dispatch,
        filters,
        scope,
        setLayout,
        workbook,
        workbookId,
    ]);

    React.useEffect(() => {
        if (workbook) {
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
    }, [dispatch, refreshWorkbookInfo, setLayout, workbook]);
};
