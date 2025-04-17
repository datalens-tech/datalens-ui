import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Card, Dialog, Select, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ChartkitMenuDialogsQA} from 'shared';
import {EXPORT_FORMATS} from 'ui/libs/DatalensChartkit/modules/constants/constants';

import type {ExportActionArgs, ExportChartArgs} from '../Export/types';

import './DownloadCsv.scss';

const b = block('download-csv-modal');

const i18n = I18n.keyset('chartkit.menu.download-csv');

const EXPORT_WARNING_TYPE = 'table';

type DownloadCsvProps = {
    onApply: ({chartData, params}: ExportChartArgs) => void;
    loading?: boolean;
    onClose: () => void;
    chartType: string;
    chartData: ExportActionArgs;
    path?: string;
    onExportLoading?: (isLoading: boolean) => void;
    additionalControls?: React.ReactNode;
    showWarning?: boolean;
    className?: string;
};

const valueDelimiterOptions: SelectOption[] = [
    {
        value: ';',
        qa: ChartkitMenuDialogsQA.chartMenuExportCsvValueDelimiterSemicolon,
        content: `${i18n('value_semicolon')}`,
    },
    {
        value: ',',
        qa: ChartkitMenuDialogsQA.chartMenuExportCsvValueDelimiterComma,
        content: `${i18n('value_comma')}`,
    },
    {
        value: 'tab',
        qa: ChartkitMenuDialogsQA.chartMenuExportCsvValueDelimiterTab,
        content: i18n('value_tab'),
    },
    {
        value: 'space',
        qa: ChartkitMenuDialogsQA.chartMenuExportCsvValueDelimiterSpace,
        content: i18n('value_space'),
    },
];

const decimalDelimiterOptions: SelectOption[] = [
    {
        value: '.',
        qa: ChartkitMenuDialogsQA.chartMenuExportCsvDecimalDelimiterDot,
        content: i18n('value_dot'),
    },
    {
        value: ',',
        qa: ChartkitMenuDialogsQA.chartMenuExportCsvDecimalDelimiterComma,
        content: i18n('value_comma'),
    },
];

const encodingOptions = [
    {
        value: 'utf8',
        content: 'utf8',
    },
    {
        value: 'cp1251',
        content: 'cp1251',
    },
];

export const DownloadCsv = ({
    onApply,
    loading,
    onClose,
    chartType,
    chartData,
    onExportLoading,
    additionalControls,
    showWarning = true,
    className,
}: DownloadCsvProps) => {
    const [delValue, setDelValue] = React.useState(';');
    const [delNumber, setDelNumber] = React.useState('.');
    const [encoding, setEncoding] = React.useState('utf8');

    const showAttention = showWarning && chartType === EXPORT_WARNING_TYPE;

    const downloadCsv = React.useCallback(() => {
        const params = {
            format: EXPORT_FORMATS.CSV,
            delValues: delValue,
            delNumbers: delNumber,
            encoding,
        };

        onApply({chartData, params, onExportLoading});
        onClose();
    }, [chartData, delNumber, delValue, encoding, onApply]);

    return (
        <Dialog
            open={true}
            onClose={onClose}
            className={b(null, className)}
            qa={ChartkitMenuDialogsQA.chartMenuExportCsvDialog}
        >
            <Dialog.Header caption={i18n('label_title')} />
            <Dialog.Body className={b('content')}>
                {showAttention && (
                    <Card theme="normal" className={b('attention')}>
                        {i18n('label_attention')}
                    </Card>
                )}
                {additionalControls}
                <FormRow label={i18n('label_values-delimiter')} className={b('row')}>
                    <Select
                        width="max"
                        qa={ChartkitMenuDialogsQA.chartMenuExportCsvSelectDelimiter}
                        value={[delValue]}
                        options={valueDelimiterOptions}
                        onUpdate={(delValues) => setDelValue(delValues[0])}
                    />
                </FormRow>
                <FormRow label={i18n('label_decimal-delimiter')} className={b('row')}>
                    <Select
                        width="max"
                        qa={ChartkitMenuDialogsQA.chartMenuExportCsvSelectFloat}
                        value={[delNumber]}
                        options={decimalDelimiterOptions}
                        onUpdate={(delNumbers) => setDelNumber(delNumbers[0])}
                    />
                </FormRow>
                <FormRow label={i18n('label_encoding')} className={b('row')}>
                    <Select
                        width="max"
                        qa={ChartkitMenuDialogsQA.chartMenuExportCsvSelectCharset}
                        value={[encoding]}
                        options={encodingOptions}
                        onUpdate={(encodingVal) => setEncoding(encodingVal[0])}
                    />
                </FormRow>
                <Text variant="body-1" color="hint">
                    {i18n('label_hint')}
                </Text>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={downloadCsv}
                propsButtonApply={{
                    loading,
                    qa: ChartkitMenuDialogsQA.chartMenuExportModalApplyBtn,
                }}
                textButtonApply={i18n('button_download')}
                textButtonCancel={i18n('button_cancel')}
            />
        </Dialog>
    );
};
