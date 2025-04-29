import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {Link, Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {getEntryNameByKey} from '../../../../../../shared';
import navigateHelper from '../../../../../libs/navigateHelper';
import {EntryIcon} from '../../../../EntryIcon/EntryIcon';
import AlertTooltip from '../AlertTooltip/AlertTooltip';
import SharedLink from '../SharedLink/SharedLink';
import type {EntryData} from '../types';

import './CurrentEntrySection.scss';

const b = block('dl-dialog-public-current-entry');
const i18n = I18n.keyset('component.dialog-switch-public.view');
const tooltipPlacement: PopupPlacement = ['bottom', 'top', 'left', 'right'];

type Props = {
    className: string;
    progress: boolean;
    entry: EntryData;
    onChange: () => void;
    checked: boolean;
    disabled: boolean;
    tooltip: string;
};

function CurrentEntrySection({
    entry,
    className,
    checked,
    onChange,
    progress,
    disabled,
    tooltip,
}: Props) {
    function onChangeTumbler() {
        if (!progress) {
            onChange();
        }
    }

    return (
        <div className={b(null, className)}>
            <div className={b('title')}>{i18n('section_current-entry')}</div>
            <div className={b('entry-line')}>
                <div className={b('current-entry')}>
                    <EntryIcon entry={entry} width={20} height={20} className={b('entry-icon')} />
                    <Link
                        view="primary"
                        target="_blank"
                        className={b('entry-name')}
                        title={entry.key}
                        href={navigateHelper.redirectUrlSwitcher(entry)}
                    >
                        {getEntryNameByKey({key: entry.key})}
                    </Link>
                </div>
                <div className={b('other')}>
                    {Boolean(tooltip) && (
                        <AlertTooltip
                            className={b('alert')}
                            text={tooltip}
                            tooltipPlacement={tooltipPlacement}
                        />
                    )}
                    <Switch
                        size="m"
                        disabled={disabled}
                        checked={checked}
                        onUpdate={onChangeTumbler}
                    />
                </div>
            </div>
            <div>
                <SharedLink className={b('shared-link')} entry={entry} disabled={!checked} />
            </div>
        </div>
    );
}

export default CurrentEntrySection;
