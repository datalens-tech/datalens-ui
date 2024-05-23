import React from 'react';

import {SharePopover} from '@gravity-ui/components';
import {ArrowShapeTurnUpRight, Code} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared/types';
import {DialogShare} from 'ui/components/DialogShare/DialogShare';
import {URL_OPTIONS as COMMON_URL_OPTIONS} from 'ui/constants';
import Utils from 'ui/utils';
import {isMobileView} from 'ui/utils/mobile';

import {socialNets} from '../../modules/constants';

import './ShareButton.scss';

const b = block('entity-share-button');
const i18n = I18n.keyset('chartkit.menu');

export const ShareButton = ({
    enablePopover,
    entityId,
    popoverText,
    popoverTitle,
    iconSize = 18,
    popoverClassName,
}: {
    enablePopover?: boolean;
    entityId?: string;
    popoverText?: string;
    popoverTitle?: string;
    iconSize?: number;
    popoverClassName?: string;
}) => {
    const [showDialogShare, setShowDialogShare] = React.useState(false);

    const handleShareButtonClick = () => {
        setShowDialogShare(true);
    };

    const handleCloseDialogShare = () => {
        setShowDialogShare(false);
    };

    const getContent = () => {
        if (enablePopover && (!isMobileView || Utils.isEnabledFeature(Feature.EnableShareWidget))) {
            return (
                <SharePopover
                    useWebShareApi={!isMobileView}
                    url={window.location.href}
                    title={popoverTitle}
                    text={popoverText}
                    shareOptions={socialNets}
                    copyIcon={Code}
                    customIcon={ArrowShapeTurnUpRight}
                    iconSize={iconSize}
                    withCopyLink={Boolean(entityId)}
                    className={popoverClassName}
                    renderCopy={({icon}) => (
                        <Button
                            view="flat-secondary"
                            size="l"
                            width="max"
                            onClick={handleShareButtonClick}
                        >
                            <Icon data={icon} size={16} />
                            {i18n('embedded')}
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
