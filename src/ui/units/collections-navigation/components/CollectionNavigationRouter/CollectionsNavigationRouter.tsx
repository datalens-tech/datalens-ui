import React from 'react';

import {Route, Switch} from 'react-router-dom';

import {CollectionPage} from '../../../collections/components/CollectionPage/CollectionPage';
import {WorkbookPage} from '../../../workbooks/components/WorkbookPage/WorkbookPage';
import {
    CollectionsNavigationLayout,
    CollectionsNavigationLayoutContext,
} from '../CollectionsNavigationLayout';

export const CollectionsNavigationRouter = () => {
    const [actionsPanelLeftBlock, setActionsPanelLeftBlock] = React.useState({
        isLoading: true,
    });

    const [actionsPanelRightBlock, setActionsPanelRightBlock] = React.useState({
        isLoading: true,
    });

    const [title, setTitle] = React.useState({
        isLoading: true,
    });

    const [titleActionsBlock, setTitleActionsBlock] = React.useState({
        isLoading: true,
    });

    const [titleRightBlock, setTitleRightBlock] = React.useState({
        isLoading: true,
    });

    const [description, setDescription] = React.useState({
        isLoading: true,
    });

    return (
        <CollectionsNavigationLayoutContext.Provider
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
        </CollectionsNavigationLayoutContext.Provider>
    );
};
