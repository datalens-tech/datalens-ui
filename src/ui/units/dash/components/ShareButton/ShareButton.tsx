import React from 'react';

import {SharePopover} from '@gravity-ui/components';
import {ArrowShapeTurnUpRight, Code} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import type {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared/types';
import {URL_OPTIONS as COMMON_URL_OPTIONS, DL} from 'ui/constants';
import {registry} from 'ui/registry';
import type {DialogShareProps} from 'ui/registry/units/common/types/components/DialogShare';
import Utils from 'ui/utils';

import {socialNets} from '../../modules/constants';

import './ShareButton.scss';

const b = block('entity-share-button');
const i18n = I18n.keyset('chartkit.menu');

interface DialogSharePropsForShareButton extends Omit<DialogShareProps, 'onClose'> {}

export const ShareButton = ({
    enablePopover,
    popoverText,
    popoverTitle,
    copyText,
    copyIcon,
    iconSize = 18,
    popoverClassName,
    dialogShareProps,
}: {
    enablePopover?: boolean;
    popoverText?: string;
    copyText?: string;
    copyIcon?: SVGIconData;
    popoverTitle?: string;
    iconSize?: number;
    popoverClassName?: string;
    dialogShareProps?: DialogSharePropsForShareButton;
}) => {
    const {DialogShare} = registry.common.components.getAll();

    const [showDialogShare, setShowDialogShare] = React.useState(false);

    const handleShareButtonClick = () => {
        setShowDialogShare(true);
    };

    const handleCloseDialogShare = () => {
        setShowDialogShare(false);
    };

    const initDialogShareProps: DialogShareProps = {propsData: {}, onClose: handleCloseDialogShare};

    if (Utils.isEnabledFeature(Feature.EnableEmbedsInDialogShare)) {
        initDialogShareProps.initialParams = {
            [COMMON_URL_OPTIONS.NO_CONTROLS]: 1,
        };
    }

    if (DL.USER.isFederationUser) {
        initDialogShareProps.withFederation = true;
    }

    const getContent = () => {
        if (enablePopover && (!DL.IS_MOBILE || Utils.isEnabledFeature(Feature.EnableShareWidget))) {
            return (
                <SharePopover
                    useWebShareApi={!DL.IS_MOBILE}
                    url={window.location.href}
                    title={popoverTitle}
                    text={popoverText}
                    shareOptions={socialNets}
                    copyIcon={copyIcon || Code}
                    customIcon={ArrowShapeTurnUpRight}
                    iconSize={iconSize}
                    withCopyLink={Boolean(dialogShareProps?.propsData.id)}
                    className={popoverClassName}
                    renderCopy={({icon}) => (
                        <Button
                            view="flat-secondary"
                            size="l"
                            width="max"
                            onClick={handleShareButtonClick}
                        >
                            <Icon data={icon} size={16} />
                            {copyText || i18n('embedded')}
                        </Button>
                    )}
                />
            );
        }

        if (!DL.IS_MOBILE) {
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
            {dialogShareProps?.propsData.id && showDialogShare && (
                <DialogShare {...initDialogShareProps} {...dialogShareProps} />
            )}
        </React.Fragment>
    );
};
