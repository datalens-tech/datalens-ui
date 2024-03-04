import React from 'react';

import {Route, Switch} from 'react-router-dom';

import {CollectionPage} from '../../../collections/components/CollectionPage/CollectionPage';
import {WorkbookPage} from '../../../workbooks/components/WorkbookPage/WorkbookPage';
import {LayoutBlock, LayoutContext} from '../../contexts/LayoutContext';
import {CollectionsNavigationLayout} from '../CollectionsNavigationLayout';

export const CollectionsNavigationRouter = () => {
    const [actionsPanelLeftBlock, setActionsPanelLeftBlock] = React.useState<LayoutBlock>({
        isLoading: true,
    });

    const [actionsPanelRightBlock, setActionsPanelRightBlock] = React.useState<LayoutBlock>({
        isLoading: true,
    });

    const [title, setTitle] = React.useState<LayoutBlock>({
        isLoading: true,
    });

    const [titleActionsBlock, setTitleActionsBlock] = React.useState<LayoutBlock>({
        isLoading: true,
    });

    const [titleRightBlock, setTitleRightBlock] = React.useState<LayoutBlock>({
        isLoading: true,
    });

    const [description, setDescription] = React.useState<LayoutBlock>({
        isLoading: true,
    });

    return (
        <LayoutContext.Provider
            value={{
                actionsPanelLeftBlock,
                setActionsPanelLeftBlock,
                actionsPanelRightBlock,
                setActionsPanelRightBlock,
                title,
                setTitle,
                titleActionsBlock,
                setTitleActionsBlock,
                titleRightBlock,
                setTitleRightBlock,
                description,
                setDescription,
            }}
        >
            <CollectionsNavigationLayout
                actionsPanel={{
                    leftBlock: actionsPanelLeftBlock,
                    rightBlock: actionsPanelRightBlock,
                }}
                header={{
                    title,
                    titleActionsBlock,
                    titleRightBlock,
                    description,
                }}
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
