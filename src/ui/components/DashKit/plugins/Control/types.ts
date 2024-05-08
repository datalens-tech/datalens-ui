import React from 'react';

import type {StringParams} from '@gravity-ui/dashkit';
import type {schema} from 'shared';
import type {ServerFilter} from 'shared/types/config/wizard';
import type {ResolveWidgetControlDataRefArgs} from 'ui/components/Widgets/Chart/types';
import type {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';

import type {DatalensSdk} from '../../../../libs/schematic-sdk';

export type GetDistincts = DatalensSdk<{
    root: typeof schema;
}>['bi']['getDistinctsApiV2'];

export type ControlType = 'select' | 'input' | 'datepicker' | 'range-datepicker' | 'checkbox';
export type LoadStatus = 'pending' | 'success' | 'fail' | 'initial' | 'destroyed';

export type ErrorData = {
    data: {
        error?: SelectorError;
        title?: string;
        message?: string;
        status?: number;
    };
    requestId?: string;
};

export type SelectorError = {
    code: string;
    debug: string | {requestId?: string};
    details?: {
        sources?: {
            distincts?: {
                body?: {
                    debug: Record<string, string>;
                    message: string;
                    details: Record<string, string>;
                    code: string;
                };
                data?: {
                    ignore_nonexistent_filters: boolean;
                    fuild_guid: string;
                    where: ServerFilter[];
                };
                message?: string;
                sourceType?: string;
                status?: number;
                uiUrl?: string;
                url?: string;
            };
        };
    };
};

export interface ControlSettings {
    getDistincts?: GetDistincts;
}

export interface PluginControlState {
    status: LoadStatus;
    loadedData: null | ResponseSuccessControls;
    errorData: null | ErrorData;
    silentLoading: boolean;
    showSilentLoader: boolean;
    forceUpdate: boolean;
    dialogVisible: boolean;
    loadingItems: boolean;
    initialParams?: StringParams;
    isInit: boolean;
    validationError: null | string;
}

export interface SelectControlProps {
    widgetId: string;
    content: any;
    editMode?: boolean;
    label?: string;
    innerLabel: string;
    limitLabel?: boolean;
    param: string;
    multiselect: boolean;
    type: ControlType;
    className: string;
    labelClassName: string;
    key: string;
    value: string;
    onChange: (value: string) => void;
    onOpenChange: ({open}: {open: boolean}) => void;
    loadingItems: boolean;
    errorContent?: React.ReactNode;
    itemsLoaderClassName?: string;
    getItems?: ({
        searchPattern,
        exactKeys,
        nextPageToken,
    }: {
        searchPattern: string;
        exactKeys: string[];
        nextPageToken?: number;
    }) => Promise<
        | {nextPageToken: undefined | number; items: any}
        | {nextPageToken: number; items: {title: string; value: string}[]}
        | {items: any[]}
    >;
    placeholder: string | undefined;
    required?: boolean;
    hasValidationError: boolean;
    renderOverlay?: () => React.ReactNode;
    style?: React.CSSProperties;
}

export type ChartControlRef =
    | (ChartsChartKit & {
          getMeta: () => Promise<ResolveWidgetControlDataRefArgs | null>;
      })
    | null;

export type ValidationErrorData = {
    required?: boolean;
    value?:
        | string
        | string[]
        | {
              from: string | string[];
              to: string | string[];
          };
    index?: string;
};
