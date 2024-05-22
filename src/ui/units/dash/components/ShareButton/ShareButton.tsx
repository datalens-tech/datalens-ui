import React from 'react';

import {SharePopover} from '@gravity-ui/components';
import {ArrowShapeTurnUpRight, Code} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DialogShare} from 'ui/components/DialogShare/DialogShare';
import {URL_OPTIONS as COMMON_URL_OPTIONS} from 'ui/constants';
import {isMobileView} from 'ui/utils/mobile';

import {socialNets} from '../../modules/constants';

import './ShareButton.scss';

const b = block('entity-share-button');

export const ShareButton = ({
    enablePopover,
    entityId,
    popoverText,
    popoverTitle,
    popoverButtonText,
}: {
    enablePopover?: boolean;
    entityId?: string;
    popoverText?: string;
    popoverTitle?: string;
    popoverButtonText?: string;
}) => {
    const [showDialogShare, setShowDialogShare] = React.useState(false);

    const handleShareButtonClick = () => {
        setShowDialogShare(true);
    };

    const handleCloseDialogShare = () => {
        setShowDialogShare(false);
    };

    const getContent = () => {
        if (!isMobileView && enablePopover) {
            return (
                <SharePopover
                    useWebShareApi={false}
                    url={window.location.href}
                    title={popoverTitle}
                    text={popoverText}
                    shareOptions={socialNets}
                    copyIcon={Code}
                    customIcon={ArrowShapeTurnUpRight}
                    iconSize={18}
                    withCopyLink={Boolean(entityId)}
                    className={b('share-popover')}
                    renderCopy={({icon}) => (
                        <Button
                            view="flat-secondary"
                            size="l"
                            width="max"
                            onClick={handleShareButtonClick}
                        >
                            <Icon data={icon} size={16} />
                            {popoverButtonText}
                        </Button>
                    )}
                />
            );
        }

        if (!isMobileView) {
            return null;
        }

        return (
            <Button
                view="flat"
                onClick={handleShareButtonClick}
                className={b('mobile-share-button')}
            >
                <Icon size={18} data={ArrowShapeTurnUpRight} />
            </Button>
        );
    };

    return (
        <React.Fragment>
            {getContent()}
            {entityId && showDialogShare && (
                <DialogShare
                    onClose={handleCloseDialogShare}
                    propsData={{id: entityId}}
                    initialParams={{
                        [COMMON_URL_OPTIONS.EMBEDDED]: 1,
                        [COMMON_URL_OPTIONS.NO_CONTROLS]: 1,
                    }}
                />
            )}
        </React.Fragment>
    );
};
