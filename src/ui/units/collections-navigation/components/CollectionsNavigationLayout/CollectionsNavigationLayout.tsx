import React from 'react';

import {Skeleton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {selectAsideHeaderData} from 'ui/store/selectors/asideHeader';

import {Layout, SkeletonsSettings} from '../../contexts/LayoutContext';

import './CollectionsNavigationLayout.scss';

const b = block('dl-collections-navigation-layout');

const DEFAULT_SKELETONS_SETTINGS = {
    actionsPanelLeftBlock: {
        width: '250px',
        height: '26px',
    },
    actionsPanelRightBlock: {
        width: '170px',
        height: '26px',
    },
    title: {
        width: '150px',
        height: '28px',
    },
    titleActionsBlock: {
        width: '28px',
        height: '28px',
    },
    titleRightBlock: {
        width: '80px',
        height: '28px',
    },
    description: {
        width: '100%',
        height: '28px',
    },
};

type Props = {
    layout: Layout;
    skeletonsSettings: SkeletonsSettings;
    children?: React.ReactNode;
};

export const CollectionsNavigationLayout = React.memo<Props>(
    // eslint-disable-next-line complexity
    ({layout, skeletonsSettings, children}) => {
        const asideHeaderData = useSelector(selectAsideHeaderData);
        const asideHeaderSize = asideHeaderData.size || 0;

        return (
            <div className={b()}>
                <React.Fragment>
                    <div className={b('actions-panel-placeholder')} />
                    <div className={b('actions-panel')} style={{left: asideHeaderSize}}>
                        {layout.actionsPanelLeftBlock && (
                            <div className={b('actions-panel-left-block')}>
                                {layout.actionsPanelLeftBlock.isLoading ? (
                                    <Skeleton
                                        style={
                                            skeletonsSettings.actionsPanelLeftBlock
                                                ? skeletonsSettings.actionsPanelLeftBlock
                                                : DEFAULT_SKELETONS_SETTINGS.actionsPanelLeftBlock
                                        }
                                    />
                                ) : (
                                    layout.actionsPanelLeftBlock.content
                                )}
                            </div>
                        )}
                        {layout.actionsPanelRightBlock && (
                            <div className={b('actions-panel-right-block')}>
                                {layout.actionsPanelRightBlock.isLoading ? (
                                    <Skeleton
                                        style={
                                            skeletonsSettings.actionsPanelRightBlock
                                                ? skeletonsSettings.actionsPanelRightBlock
                                                : DEFAULT_SKELETONS_SETTINGS.actionsPanelRightBlock
                                        }
                                    />
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
                                            <h1 className={b('header-title')}>
                                                {layout.title.isLoading ? (
                                                    <Skeleton
                                                        style={
                                                            skeletonsSettings.title
                                                                ? skeletonsSettings.title
                                                                : DEFAULT_SKELETONS_SETTINGS.title
                                                        }
                                                    />
                                                ) : (
                                                    layout.title.content
                                                )}
                                            </h1>
                                        )}
                                        {layout.titleActionsBlock && (
                                            <div className={b('header-title-actions-block')}>
                                                {layout.titleActionsBlock.isLoading ? (
                                                    <Skeleton
                                                        style={
                                                            skeletonsSettings.titleActionsBlock
                                                                ? skeletonsSettings.titleActionsBlock
                                                                : DEFAULT_SKELETONS_SETTINGS.titleActionsBlock
                                                        }
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
                                                style={
                                                    skeletonsSettings.titleRightBlock
                                                        ? skeletonsSettings.titleRightBlock
                                                        : DEFAULT_SKELETONS_SETTINGS.titleRightBlock
                                                }
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
                                        <Skeleton
                                            style={
                                                skeletonsSettings.description
                                                    ? skeletonsSettings.description
                                                    : DEFAULT_SKELETONS_SETTINGS.description
                                            }
                                        />
                                    ) : (
                                        layout.description.content
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
