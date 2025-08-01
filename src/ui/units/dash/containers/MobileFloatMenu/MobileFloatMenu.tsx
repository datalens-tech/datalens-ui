import React from 'react';

import {BookOpen} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {type ResolveThunks, connect} from 'react-redux';
import {FloatMenu} from 'ui/components/FloatMenu/FloatMenu';
import type {DatalensGlobalState, EntryDialogues} from 'ui/index';

import {Description} from '../../components/DashActionPanel/Description/Description';
import {ShareButton} from '../../components/ShareButton/ShareButton';
import {toggleTableOfContent} from '../../store/actions/dashTyped';
import {
    hasTableOfContent,
    selectDashDescription,
    selectDashShowOpenedDescription,
} from '../../store/selectors/dashTypedSelectors';
import {FixedHeaderMobile} from '../FixedHeader/FixedHeaderMobile';

export interface MobileFloatMenuOwnProps {
    entryId: string;
    hasFixedContent: boolean;
    fixedContentInitiallyOpened?: boolean;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    fixedHeaderControlsRef: React.RefCallback<HTMLDivElement>;
    fixedHeaderContainerRef: React.RefCallback<HTMLDivElement>;
    dashEl: HTMLDivElement | null;
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    dashDescription: selectDashDescription(state),
    showOpenedDescription: selectDashShowOpenedDescription(state),
    hasTableOfContent: hasTableOfContent(state),
});

const mapDispatchToProps = {
    toggleTableOfContent,
};

type MobileFloatMenuStateProps = ReturnType<typeof mapStateToProps>;
type MobileFloatMenuDispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type MobileFloatMenuProps = MobileFloatMenuOwnProps &
    MobileFloatMenuStateProps &
    MobileFloatMenuDispatchProps;

function MobileFloatMenuComponent({
    entryId,
    dashDescription,
    showOpenedDescription,
    hasTableOfContent: showTocButton,
    hasFixedContent: showFixedHeaderButton,
    fixedContentInitiallyOpened,
    entryDialoguesRef,
    fixedHeaderControlsRef,
    fixedHeaderContainerRef,
    dashEl,
    toggleTableOfContent: toggleToc,
}: MobileFloatMenuProps) {
    const showDescriptionButton = Boolean(dashDescription);

    const actions: React.ReactNode[] = [
        showTocButton && (
            <Button view="flat" onClick={() => toggleToc()} key="dash-toc">
                <Icon size={24} data={BookOpen} />
            </Button>
        ),
        showFixedHeaderButton && (
            <FixedHeaderMobile
                key="dash-fixed-header"
                fixedContentInitiallyOpened={fixedContentInitiallyOpened}
                fixedHeaderControlsRef={fixedHeaderControlsRef}
                fixedHeaderContainerRef={fixedHeaderContainerRef}
            />
        ),
        showDescriptionButton && (
            <Description
                key="dash-description"
                canEdit={false}
                entryDialoguesRef={entryDialoguesRef}
                showOpenedDescription={showOpenedDescription}
                iconSize={24}
            />
        ),
        <ShareButton
            key="dash-share-btn"
            dialogShareProps={{
                propsData: {
                    id: entryId,
                },
                withSelectors: true,
            }}
            mobileShareIconSize={24}
            mobileShareIconColorPrimary
        />,
    ].filter(Boolean);

    return (
        <FloatMenu align={actions.length <= 2 ? 'right' : 'center'} container={dashEl ?? undefined}>
            {actions}
        </FloatMenu>
    );
}
export const MobileFloatMenu = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MobileFloatMenuComponent);
