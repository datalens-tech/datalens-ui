import {DL} from 'constants/common';

import React from 'react';

import {SharePopover} from '@gravity-ui/components';
import {ArrowShapeTurnUpRight} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import ActionPanelHelpers from 'components/ActionPanel/ActionPanelHelpers';
import {DashEntry, Feature} from 'shared';
import {registry} from 'ui/registry';
import Utils from 'ui/utils';
import {isCurrentTenantWithOrg} from 'utils/tenant';

import {isEmbeddedMode} from '../../../../utils/embedded';
import {socialNets} from '../../modules/constants';

import './DashActionPanelMobile.scss';

const b = block('dash-action-panel-mobile');

type Props = {
    entry: DashEntry;
};

export class DashActionPanelMobile extends React.PureComponent<Props> {
    render() {
        const {entry} = this.props;
        const hideTitleSetting = Boolean(entry.data?.settings?.hideDashTitle);

        if (hideTitleSetting) {
            return null;
        }

        const showControls = !isEmbeddedMode();
        const entryName = ActionPanelHelpers.getNameByKey({key: entry.key});

        return (
            <div className={b()}>
                <div className={b('entry-name')}>{entryName}</div>
                {showControls && (
                    <div className={b('controls')}>{this.renderControls(entryName)}</div>
                )}
            </div>
        );
    }

    renderControls(entryName: string) {
        if (
            DL.IS_MOBILE &&
            Utils.isEnabledFeature(Feature.ShowActionPanelTreeSelect) &&
            !isCurrentTenantWithOrg()
        ) {
            const {CloudTreeSelectBase} = registry.common.components.getAll();
            return <CloudTreeSelectBase folderId={DL.CURRENT_TENANT_ID} />;
        }

        if (Utils.isEnabledFeature(Feature.EnableShareWidget))
            return (
                <SharePopover
                    useWebShareApi={DL.IS_MOBILE}
                    url={window.location.href}
                    title={entryName}
                    text={entryName}
                    shareOptions={socialNets}
                    customIcon={ArrowShapeTurnUpRight}
                />
            );

        return null;
    }
}
