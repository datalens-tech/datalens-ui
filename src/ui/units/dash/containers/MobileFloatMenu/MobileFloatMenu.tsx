import React from 'react';

import {BookOpen} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {FloatMenu} from 'ui/components/FloatMenu/FloatMenu';

import {Description} from '../../components/DashActionPanel/Description/Description';
import {ShareButton} from '../../components/ShareButton/ShareButton';
import {toggleTableOfContent} from '../../store/actions/dashTyped';
import {
    hasTableOfContent,
    selectDashDescription,
    selectDashShowOpenedDescription,
} from '../../store/selectors/dashTypedSelectors';
import {FixedHeaderMobile} from '../FixedHeader/FixedHeaderMobile';

export interface MobileFloatMenuProps {
    entryId: string;
    hasFixedContent: boolean;
    fixedContentInitiallyOpened?: boolean;
    fixedContentWidgetFocused?: boolean;
    fixedHeaderControlsRef: React.RefCallback<HTMLDivElement>;
    fixedHeaderContainerRef: React.RefCallback<HTMLDivElement>;
    dashEl: HTMLDivElement | null;
}

export function MobileFloatMenu({
    entryId,
    hasFixedContent: showFixedHeaderButton,
    fixedContentInitiallyOpened,
    fixedContentWidgetFocused,
    fixedHeaderControlsRef,
    fixedHeaderContainerRef,
    dashEl,
}: MobileFloatMenuProps) {
    const dashDescription = useSelector(selectDashDescription);
    const showOpenedDescription = useSelector(selectDashShowOpenedDescription);
    const showTocButton = useSelector(hasTableOfContent);
    const dispatch = useDispatch();

    const toggleToc = React.useCallback(() => {
        dispatch(toggleTableOfContent());
    }, [dispatch]);

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
                fixedContentWidgetFocused={fixedContentWidgetFocused}
                fixedHeaderControlsRef={fixedHeaderControlsRef}
                fixedHeaderContainerRef={fixedHeaderContainerRef}
            />
        ),
        showDescriptionButton && (
            <Description
                key="dash-description"
                canEdit={false}
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
