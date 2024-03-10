import React from 'react';

import {useDispatch} from 'react-redux';
import {Route, Switch} from 'react-router-dom';
import {AppDispatch} from 'ui/store';

import {CollectionPage} from '../../../collections/components/CollectionPage/CollectionPage';
import {resetState as resetCollectionsState} from '../../../collections/store/actions';
import {WorkbookPage} from '../../../workbooks/components/WorkbookPage/WorkbookPage';
import {resetWorkbookState as resetWorkbooksState} from '../../../workbooks/store/actions';
import {Layout, LayoutBlock, LayoutContext, SkeletonsSettings} from '../../contexts/LayoutContext';
import {resetState as resetCollectionsNavigationState} from '../../store/actions';
import {CollectionsNavigationLayout} from '../CollectionsNavigationLayout';

export const CollectionsNavigationApp = () => {
    const dispatch: AppDispatch = useDispatch();

    const [actionsPanelLeftBlock, setActionsPanelLeftBlock] = React.useState<LayoutBlock>(null);
    const [actionsPanelRightBlock, setActionsPanelRightBlock] = React.useState<LayoutBlock>(null);
    const [title, setTitle] = React.useState<LayoutBlock>(null);
    const [titleActionsBlock, setTitleActionsBlock] = React.useState<LayoutBlock>(null);
    const [titleRightBlock, setTitleRightBlock] = React.useState<LayoutBlock>(null);
    const [description, setDescription] = React.useState<LayoutBlock>(null);

    const setLayout = React.useCallback((layout: Partial<Layout>) => {
        if (layout.actionsPanelLeftBlock !== undefined) {
            setActionsPanelLeftBlock(layout.actionsPanelLeftBlock);
        }
        if (layout.actionsPanelRightBlock !== undefined) {
            setActionsPanelRightBlock(layout.actionsPanelRightBlock);
        }
        if (layout.title !== undefined) {
            setTitle(layout.title);
        }
        if (layout.titleActionsBlock !== undefined) {
            setTitleActionsBlock(layout.titleActionsBlock);
        }
        if (layout.titleRightBlock !== undefined) {
            setTitleRightBlock(layout.titleRightBlock);
        }
        if (layout.description !== undefined) {
            setDescription(layout.description);
        }
    }, []);

    const [skeletonsSettings, setSkeletonsSettings] = React.useState<SkeletonsSettings>({});

    React.useEffect(() => {
        return () => {
            dispatch(resetCollectionsNavigationState());
            dispatch(resetCollectionsState());
            dispatch(resetWorkbooksState());
        };
    }, [dispatch]);

    return (
        <LayoutContext.Provider
            value={{
                setLayout,
                setSkeletonsSettings,
            }}
        >
            <CollectionsNavigationLayout
                layout={{
                    actionsPanelLeftBlock,
                    actionsPanelRightBlock,
                    title,
                    titleActionsBlock,
                    titleRightBlock,
                    description,
                }}
                skeletonsSettings={skeletonsSettings}
            >
                <Switch>
                    <Route
                        path={['/collections/:collectionId', '/collections']}
                        component={CollectionPage}
                    />
                    <Route exact path="/workbooks/:workbookId" component={WorkbookPage} />
                </Switch>
            </CollectionsNavigationLayout>
        </LayoutContext.Provider>
    );
};
