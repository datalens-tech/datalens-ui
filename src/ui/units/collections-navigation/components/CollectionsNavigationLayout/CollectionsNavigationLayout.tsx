import React from 'react';

import {Skeleton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {selectAsideHeaderData} from 'ui/store/selectors/asideHeader';

import {Layout, SkeletonsSettings} from '../../contexts/LayoutContext';

import './CollectionsNavigationLayout.scss';

const b = block('dl-collections-navigation-layout');

type Props = {
    layout: Layout;
    skeletonsSettings: SkeletonsSettings;
    children?: React.ReactNode;
};

export const CollectionsNavigationLayout = React.memo<Props>(
    ({layout, /*skeletonsSettings,*/ children}) => {
        const asideHeaderData = useSelector(selectAsideHeaderData);
        const asideHeaderSize = asideHeaderData.size || 0;

        const leftStyle: React.CSSProperties = {left: asideHeaderSize};

        return (
            <div className={b()}>
                <React.Fragment>
                    <div className={b('actions-panel-placeholder')} />
                    <div className={b('actions-panel')} style={leftStyle}>
                        {layout.actionsPanelLeftBlock && (
                            <div className={b('actions-panel-left-block')}>
                                {layout.actionsPanelLeftBlock.isLoading ? (
                                    <Skeleton className={b('actions-panel-left-block-skeleton')} />
                                ) : (
                                    layout.actionsPanelLeftBlock.content
                                )}
                            </div>
                        )}
                        {layout.actionsPanelRightBlock && (
                            <div className={b('actions-panel-right-block')}>
                                {layout.actionsPanelRightBlock.isLoading ? (
                                    <Skeleton className={b('actions-panel-right-block-skeleton')} />
                                ) : (
                                    layout.actionsPanelRightBlock.content
                                )}
                            </div>
                        )}
                    </div>
                </React.Fragment>

                <div className={b('page-wrapper')}>
                    <div className={b('page')}>
                        <React.Fragment>
                            <div className={b('header')}>
                                {layout.title || layout.titleActionsBlock ? (
                                    <div className={b('header-title-wrapper')}>
                                        {layout.title && (
                                            <React.Fragment>
                                                {layout.title.isLoading ? (
                                                    <Skeleton
                                                        className={b('header-title-skeleton')}
                                                    />
                                                ) : (
                                                    <h1 className={b('header-title')}>
                                                        {layout.title.content}
                                                    </h1>
                                                )}
                                            </React.Fragment>
                                        )}
                                        {layout.titleActionsBlock && (
                                            <div className={b('header-title-actions-block')}>
                                                {layout.titleActionsBlock.isLoading ? (
                                                    <Skeleton
                                                        className={b(
                                                            'header-title-actions-block-skeleton',
                                                        )}
                                                    />
                                                ) : (
                                                    layout.titleActionsBlock.content
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {layout.titleRightBlock && (
                                    <div className={b('header-right-block')}>
                                        {layout.titleRightBlock.isLoading ? (
                                            <Skeleton
                                                className={b('header-right-block-skeleton')}
                                            />
                                        ) : (
                                            layout.titleRightBlock.content
                                        )}
                                    </div>
                                )}
                            </div>

                            {layout.description && (
                                <div className={b('header-description')}>
                                    {layout.description.isLoading ? (
                                        <Skeleton className={b('header-decription-skeleton')} />
                                    ) : (
                                        layout.description?.content
                                    )}
                                </div>
                            )}
                        </React.Fragment>

                        {children && <div className={b('content')}>{children}</div>}
                    </div>
                </div>
            </div>
        );
    },
);

CollectionsNavigationLayout.displayName = 'CollectionsNavigationLayout';
