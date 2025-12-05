import React from 'react';

import type {MenuActionComponent, MenuItemModalProps} from 'ui/libs/DatalensChartkit/menu/Menu';

import {DownloadCsv} from '../../DownloadCsv/DownloadCsv';
import {DEFAULT_CSV_EXPORT_PARAMS} from '../../constants';
import type {ExportActionArgs, ExportMenuAction} from '../types';
import {downloadData} from '../utils';

// TODO: remove in next pr
export type CsvExportAction = ExportMenuAction;
export const csvExportAction: ExportMenuAction = (_chartsDataProvider, onExportLoading) => {
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
