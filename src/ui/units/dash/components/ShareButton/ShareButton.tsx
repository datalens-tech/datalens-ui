import React from 'react';

import {SharePopover} from '@gravity-ui/components';
import {ArrowShapeTurnUpRight, Code} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared/types';
import {URL_OPTIONS as COMMON_URL_OPTIONS, DL} from 'ui/constants';
import {registry} from 'ui/registry';
import type {DialogShareProps} from 'ui/registry/units/common/types/components/DialogShare';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {socialNets} from '../../modules/constants';

import './ShareButton.scss';

const b = block('entity-share-button');
const i18n = I18n.keyset('chartkit.menu');

interface DialogSharePropsForShareButton extends Omit<DialogShareProps, 'onClose'> {}

export const ShareButton = ({
    enablePopover,
    popoverText,
    popoverTitle,
    iconSize = 18,
    popoverClassName,
    dialogShareProps,
}: {
    enablePopover?: boolean;
    popoverText?: string;
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

    if (isEnabledFeature(Feature.EnableEmbedsInDialogShare)) {
        initDialogShareProps.initialParams = {
            [COMMON_URL_OPTIONS.NO_CONTROLS]: 1,
        };
    }

    if (DL.USER.isFederationUser) {
        initDialogShareProps.withFederation = true;
    }

    const getContent = () => {
        if (enablePopover && !DL.IS_MOBILE) {
            return (
                <SharePopover
                    url={window.location.href}
                    title={popoverTitle}
                    text={popoverText}
                    shareOptions={socialNets}
                    copyIcon={Code}
                    customIcon={ArrowShapeTurnUpRight}
                    iconSize={iconSize}
                    withCopyLink={Boolean(dialogShareProps?.propsData.id)}
                    className={popoverClassName}
                    buttonAriaLabel={i18n('get-code')}
                    renderCopy={({icon}) => (
                        <Button
                            view="flat-secondary"
                            size="l"
                            width="max"
                            onClick={handleShareButtonClick}
                            aria-label={i18n('embedded')}
                        >
                            <Icon data={icon} size={16} />
                            {i18n('embedded')}
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
                aria-label={i18n('get-code')}
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
