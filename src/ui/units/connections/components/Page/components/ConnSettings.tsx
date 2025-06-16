import React from 'react';

import {Gear} from '@gravity-ui/icons';
import type {SelectRenderControl} from '@gravity-ui/uikit';
import {Button, HelpMark, Icon, Select, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {registry} from 'ui/registry';

import {changeForm, formSelector} from '../../../store';

const ITEM_DATA_EXPORT_ENABLED = 'dataExportEnabled';
const i18nExport = I18n.keyset('exports.enable-data-export-settings');

export function ConnSettings({
    connectionId,
    className,
}: {
    connectionId: string | null;
    className?: string;
}) {
    const form = useSelector(formSelector);
    const dataExportEnabled = !form.data_export_forbidden;

    const dispatch = useDispatch();

    const settingsValue = React.useMemo(
        () => (dataExportEnabled ? [ITEM_DATA_EXPORT_ENABLED] : []),
        [dataExportEnabled],
    );

    const handleUpdateSettings = React.useCallback(
        (value: string[]) => {
            const nextDataExportEnabled = value.includes(ITEM_DATA_EXPORT_ENABLED);

            if (dataExportEnabled !== nextDataExportEnabled) {
                dispatch(changeForm({data_export_forbidden: !nextDataExportEnabled}));
            }
        },
        [dataExportEnabled, dispatch],
    );

    const renderSelectControl: SelectRenderControl = React.useCallback((args) => {
        const {ref, triggerProps} = args;

        return (
            <Button ref={ref as React.Ref<HTMLButtonElement>} view="flat" {...triggerProps}>
                <Icon data={Gear} size={18} />
            </Button>
        );
    }, []);

    const settingsSelectOptions = [
        <Select.Option key={ITEM_DATA_EXPORT_ENABLED} value={ITEM_DATA_EXPORT_ENABLED}>
            {i18nExport('label_enable-data-export')}
            <HelpMark className={spacing({ml: 2})}>{i18nExport('label_data-export-info')}</HelpMark>
        </Select.Option>,
    ];

    const {getRenderConnectionSettingsPopup} = registry.connections.functions.getAll();

    return (
        <Select
            className={className}
            value={settingsValue}
            multiple={true}
            onUpdate={handleUpdateSettings}
            popupPlacement={'bottom-end'}
            renderControl={renderSelectControl}
            renderPopup={getRenderConnectionSettingsPopup(connectionId)}
        >
            {settingsSelectOptions}
        </Select>
    );
}
