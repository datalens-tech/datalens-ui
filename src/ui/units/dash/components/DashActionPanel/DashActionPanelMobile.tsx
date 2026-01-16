import React from 'react';

import block from 'bem-cn-lite';
import ActionPanelHelpers from 'components/ActionPanel/ActionPanelHelpers';
import type {DashEntry} from 'shared';
import {registry} from 'ui/registry';

import {isEmbeddedMode} from '../../../../utils/embedded';

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
                    <div className={b('controls')}>{this.renderControls(entry.entryId)}</div>
                )}
            </div>
        );
    }

    renderControls(entryId: string) {
        const {ShareButton} = registry.common.components.getAll();

        return (
            <ShareButton
                dialogShareProps={{
                    propsData: {
                        id: entryId,
                    },
                    withSelectors: true,
                }}
            />
        );
    }
}
