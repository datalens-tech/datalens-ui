import React from 'react';

import type {ChartKitDataProvider} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import type {MenuActionComponent, MenuItemModalProps} from 'ui/libs/DatalensChartkit/menu/Menu';

import {DownloadCsv} from '../../DownloadCsv/DownloadCsv';
import {DEFAULT_CSV_EXPORT_PARAMS} from '../../constants';
import type {ExportActionArgs, ExportChartArgs} from '../types';
import {downloadData} from '../utils';

export type CsvExportAction = (
    chartsDataProvider: ChartKitDataProvider,
    onExportLoading?: ExportChartArgs['onExportLoading'],
    isEnabledAsyncChartDataExport?: boolean,
    hasAccessToBusinessFeature?: boolean,
) => (chartData: ExportActionArgs) => void | MenuActionComponent;

export const csvExportAction: CsvExportAction = (_chartsDataProvider, onExportLoading) => {
    return (chartData: ExportActionArgs): void | MenuActionComponent => {
        const {loadedData, event} = chartData;

        const chartType = loadedData.type;

        if (!event.ctrlKey && !event.metaKey) {
            return function DownloadCsvModalRenderer(props: MenuItemModalProps) {
                return (
                    <DownloadCsv
                        onClose={props.onClose}
                        chartData={chartData}
                        onApply={downloadData}
                        chartType={chartType}
                        onExportLoading={onExportLoading}
                    />
                );
            };
        }
        downloadData({chartData, params: DEFAULT_CSV_EXPORT_PARAMS, onExportLoading});
    };
};
