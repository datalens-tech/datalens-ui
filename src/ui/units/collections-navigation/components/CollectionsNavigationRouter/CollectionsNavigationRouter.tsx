import React from 'react';

import {Route, Switch} from 'react-router-dom';

import {CollectionPage} from '../../../collections/components/CollectionPage/CollectionPage';
import {WorkbookPage} from '../../../workbooks/components/WorkbookPage/WorkbookPage';
import {Layout, LayoutBlock, LayoutContext, SkeletonsSettings} from '../../contexts/LayoutContext';
import {CollectionsNavigationLayout} from '../CollectionsNavigationLayout';

export const CollectionsNavigationRouter = () => {
    const [actionsPanelLeftBlock, setActionsPanelLeftBlock] = React.useState<LayoutBlock>({
        isLoading: false,
        content: null,
    });
    const [actionsPanelRightBlock, setActionsPanelRightBlock] = React.useState<LayoutBlock>({
        isLoading: true,
        content: null,
    });
    const [title, setTitle] = React.useState<LayoutBlock>({
        isLoading: true,
        content: null,
    });
    const [titleActionsBlock, setTitleActionsBlock] = React.useState<LayoutBlock>({
        isLoading: true,
        content: null,
    });
    const [titleRightBlock, setTitleRightBlock] = React.useState<LayoutBlock>({
        isLoading: true,
        content: null,
    });
    const [description, setDescription] = React.useState<LayoutBlock>({
        isLoading: true,
        content: null,
    });

    const setLayout = React.useCallback((layout: Partial<Layout>) => {
        if (layout.actionsPanelLeftBlock) {
            setActionsPanelLeftBlock(layout.actionsPanelLeftBlock);
        }
        if (layout.actionsPanelRightBlock) {
            setActionsPanelRightBlock(layout.actionsPanelRightBlock);
        }
        if (layout.title) {
            setTitle(layout.title);
        }
        if (layout.titleActionsBlock) {
            setTitleActionsBlock(layout.titleActionsBlock);
        }
        if (layout.titleRightBlock) {
            setTitleRightBlock(layout.titleRightBlock);
        }
        if (layout.description) {
            setDescription(layout.description);
        }
    }, []);

    const [skeletonsSettings, setSkeletonsSettings] = React.useState<SkeletonsSettings>({});

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
