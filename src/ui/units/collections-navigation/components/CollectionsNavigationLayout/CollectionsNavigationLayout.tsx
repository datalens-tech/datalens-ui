import React from 'react';

import {Skeleton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {selectAsideHeaderData} from 'ui/store/selectors/asideHeader';

import './CollectionsNavigationLayout.scss';

const b = block('dl-collections-navigation-layout');

type Props = {
    actionsPanel?: {
        leftBlock?: {
            isLoading: boolean;
            content?: React.ReactNode;
        };
        rightBlock?: {
            isLoading: boolean;
            content?: React.ReactNode;
        };
    };
    header: {
        title?: {
            isLoading: boolean;
            content?: React.ReactNode;
        };
        titleActionsBlock?: {
            isLoading: boolean;
            content?: React.ReactNode;
        };
        titleRightBlock?: {
            isLoading: boolean;
            content?: React.ReactNode;
        };
        description?: {
            isLoading: boolean;
            content?: React.ReactNode;
        };
    };

    children?: React.ReactNode;
};

export const CollectionsNavigationLayout = React.memo<Props>(({actionsPanel, header, children}) => {
    const asideHeaderData = useSelector(selectAsideHeaderData);
    const asideHeaderSize = asideHeaderData.size || 0;

    const leftStyle: React.CSSProperties = {left: asideHeaderSize};

    return (
        <div className={b()}>
            {actionsPanel && (
                <React.Fragment>
                    <div className={b('actions-panel-placeholder')} />
                    <div className={b('actions-panel')} style={leftStyle}>
                        {actionsPanel.leftBlock && (
                            <div className={b('actions-panel-left-block')}>
                                {actionsPanel.leftBlock.isLoading ? (
                                    <Skeleton className={b('actions-panel-left-block-skeleton')} />
                                ) : (
                                    actionsPanel.leftBlock?.content
                                )}
                            </div>
                        )}
                        {actionsPanel.rightBlock && (
                            <div className={b('actions-panel-right-block')}>
                                {actionsPanel.rightBlock.isLoading ? (
                                    <Skeleton className={b('actions-panel-right-block-skeleton')} />
                                ) : (
                                    actionsPanel.rightBlock?.content
                                )}
                            </div>
                        )}
                    </div>
                </React.Fragment>
            )}
            <div className={b('page-wrapper')}>
                <div className={b('page')}>
                    {header && (
                        <React.Fragment>
                            <div className={b('header')}>
                                {header.title || header.titleActionsBlock ? (
                                    <div className={b('header-title-wrapper')}>
                                        {header.title && (
                                            <React.Fragment>
                                                {header.title.isLoading ? (
                                                    <Skeleton
                                                        className={b('header-title-skeleton')}
                                                    />
                                                ) : (
                                                    <h1 className={b('header-title')}>
                                                        {header.title.content}
                                                    </h1>
                                                )}
                                            </React.Fragment>
                                        )}
                                        {header.titleActionsBlock && (
                                            <div className={b('header-title-actions-block')}>
                                                {header.titleActionsBlock.isLoading ? (
                                                    <Skeleton
                                                        className={b(
                                                            'header-title-actions-block-skeleton',
                                                        )}
                                                    />
                                                ) : (
                                                    header.titleActionsBlock.content
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {header.titleRightBlock && (
                                    <div className={b('header-right-block')}>
                                        {header.titleRightBlock.isLoading ? (
                                            <Skeleton
                                                className={b('header-right-block-skeleton')}
                                            />
                                        ) : (
                                            header.titleRightBlock?.content
                                        )}
                                    </div>
                                )}
                            </div>

                            {header.description && header.description.isLoading ? (
                                <Skeleton className={b('header-decription-skeleton')} />
                            ) : (
                                <div className={b('header-decription')}>
                                    {header.description?.content}
                                </div>
                            )}
                        </React.Fragment>
                    )}
                    {children && <div className={b('content')}>{children}</div>}
                </div>
            </div>
        </div>
    );
});

CollectionsNavigationLayout.displayName = 'CollectionsNavigationLayout';
