import type React from 'react';

import type {StringParams} from '@gravity-ui/dashkit';
import type {TitlePlacementOption} from 'shared';
import type {
    GetDistinctsApiV2Args,
    GetDistinctsApiV2InfoHeadersArg,
    GetDistinctsApiV2TransformedResponse,
} from 'shared/schema/types';
import type {ServerFilter} from 'shared/types/config/wizard';
import type {ResolveWidgetControlDataRefArgs} from 'ui/components/Widgets/Chart/types';
import type {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import type {ChartsChartKit} from 'ui/libs/DatalensChartkit/types/charts';

export type ControlType = 'select' | 'input' | 'datepicker' | 'range-datepicker' | 'checkbox';
export type LoadStatus = 'pending' | 'success' | 'fail' | 'initial' | 'destroyed';

export type ErrorData = {
    data: {
        error?: SelectorError;
        title?: string | null;
        message?: string;
        status?: number;
    };
    requestId?: string;
    extra?: {hideErrorDetails: boolean};
};

export type SelectorError = {
    code: string;
    debug: string | {requestId?: string};
    details?: {
        sources?: Record<
            string,
            {
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
                code?: string;
            }
        >;
    };
};

export interface ControlSettings {
    getDistincts?: (
        params: GetDistinctsApiV2Args,
        headers?: GetDistinctsApiV2InfoHeadersArg,
    ) => Promise<GetDistinctsApiV2TransformedResponse>;
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
    labelPlacement?: TitlePlacementOption;
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
    hint?: string;
    disabled?: boolean;
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
