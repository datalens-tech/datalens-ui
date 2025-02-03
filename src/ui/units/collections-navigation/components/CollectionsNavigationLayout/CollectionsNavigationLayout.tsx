import React from 'react';

import {ActionBar} from '@gravity-ui/navigation';
import {Skeleton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Feature} from 'shared';
import {DL} from 'ui/constants/common';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {Layout, SkeletonsSettings} from '../../contexts/LayoutContext';

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
        const {Footer} = registry.common.components.getAll();

        const showTitleActionsBlock = !DL.IS_MOBILE && layout.titleActionsBlock;
        const showTitleRightBlock = !DL.IS_MOBILE && layout.titleRightBlock;
        const showDescription = !DL.IS_MOBILE && layout.description;

        const title = typeof layout.title?.content === 'string' ? layout.title.content : '';

        return (
            <div className={b({mobile: DL.IS_MOBILE})}>
                {(layout.actionsPanelLeftBlock || layout.actionsPanelRightBlock) &&
                    !DL.IS_MOBILE && (
                        <ActionBar>
                            <ActionBar.Section type="primary">
                                <ActionBar.Group pull="left">
                                    {layout.actionsPanelLeftBlock && (
                                        <ActionBar.Item>
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
                                        </ActionBar.Item>
                                    )}
                                </ActionBar.Group>
                                <ActionBar.Group pull="right">
                                    <ActionBar.Item>
                                        {layout.actionsPanelRightBlock && (
                                            <div>
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
                                    </ActionBar.Item>
                                </ActionBar.Group>
                            </ActionBar.Section>
                        </ActionBar>
                    )}

                <div className={b('page-wrapper')}>
                    <div className={b('page')}>
                        <div className={b('header')}>
                            {layout.title || layout.titleActionsBlock ? (
                                <div className={b('header-title-wrapper')}>
                                    {layout.titleBeforeActionsBlock?.content && (
                                        <div>{layout.titleBeforeActionsBlock.content}</div>
                                    )}
                                    {layout.title && (
                                        <h1 className={b('header-title')} title={title}>
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
                                    {showTitleActionsBlock && (
                                        <div className={b('header-title-actions-block')}>
                                            {layout.titleActionsBlock?.isLoading ? (
                                                <Skeleton
                                                    style={
                                                        skeletonsSettings.titleActionsBlock
                                                            ? skeletonsSettings.titleActionsBlock
                                                            : DEFAULT_SKELETONS_SETTINGS.titleActionsBlock
                                                    }
                                                />
                                            ) : (
                                                layout.titleActionsBlock?.content
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {showTitleRightBlock && (
                                <div className={b('header-right-block')}>
                                    {layout.titleRightBlock?.isLoading ? (
                                        <Skeleton
                                            style={
                                                skeletonsSettings.titleRightBlock
                                                    ? skeletonsSettings.titleRightBlock
                                                    : DEFAULT_SKELETONS_SETTINGS.titleRightBlock
                                            }
                                        />
                                    ) : (
                                        layout.titleRightBlock?.content
                                    )}
                                </div>
                            )}
                        </div>

                        {showDescription && (
                            <div className={b('header-description')}>
                                {layout.description?.isLoading ? (
                                    <Skeleton
                                        style={
                                            skeletonsSettings.description
                                                ? skeletonsSettings.description
                                                : DEFAULT_SKELETONS_SETTINGS.description
                                        }
                                    />
                                ) : (
                                    layout.description?.content
                                )}
                            </div>
                        )}

                        {children && <div className={b('content')}>{children}</div>}
                    </div>
                    {isEnabledFeature(Feature.EnableFooter) && <Footer />}
                </div>
            </div>
        );
    },
);

CollectionsNavigationLayout.displayName = 'CollectionsNavigationLayout';
