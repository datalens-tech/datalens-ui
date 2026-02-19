import React from 'react';

import type {ExportParams} from 'shared';
import type {MenuActionComponent, MenuItemModalProps} from 'ui/libs/DatalensChartkit/menu/Menu';

import {DownloadCsv} from '../../DownloadCsv/DownloadCsv';
import {DEFAULT_CSV_EXPORT_PARAMS} from '../../constants';
import type {ExportActionArgs, ExportMenuAction} from '../types';
import {downloadData} from '../utils';

export const csvExportAction: ExportMenuAction = ({onExportLoading}) => {
    return (chartData: ExportActionArgs): void | MenuActionComponent => {
        const {loadedData, event} = chartData;

        const chartType = loadedData.type;

        if (!event.ctrlKey && !event.metaKey) {
            return function DownloadCsvModalRenderer(props: MenuItemModalProps) {
                const onSubmit = (params: ExportParams) => {
                    downloadData({chartData, params, onExportLoading});
                    props.onClose();
                };
                return (
                    <DownloadCsv
                        onClose={props.onClose}
                        onSubmit={onSubmit}
                        chartType={chartType}
                    />
                );
            };
        }
        downloadData({chartData, params: DEFAULT_CSV_EXPORT_PARAMS, onExportLoading});
    };
};
