import type {ChartKitPlugin, ChartKitType} from '@gravity-ui/chartkit';
import type {ChartKitHolidays} from '@gravity-ui/chartkit/build/types';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {EntryContextMenuItem} from '../../../components/EntryContextMenu/helpers';
import type {SourceMeta} from '../../../libs/DatalensChartkit/components/ChartKitBase/components/Header/components/Menu/Items/Inspector/types';
import type {MenuItemConfig} from '../../../libs/DatalensChartkit/menu/Menu';
import type {
    ResponseSuccessControls,
    ResponseSuccessNode,
} from '../../../libs/DatalensChartkit/modules/data-provider/charts/types';
import type {LoadedWidgetData} from '../../../libs/DatalensChartkit/types';
import type {GetChartkitMenuByType} from '../../../registry/units/chart/types/functions/getChartkitMenuByType';
import {EXAMPLE_FUNCTION} from '../common/constants/functions';

import type {GetDefaultChartMenuArgs} from './types/functions/getDefaultChartMenu';
import type {GetPanePreviewChartMenuArgs} from './types/functions/getPanePreviewChartMenu';
import type {GetWizardChartMenuArgs} from './types/functions/getWizardChartMenu';

export const chartFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    getWizardChartMenu:
        makeFunctionTemplate<(args: GetWizardChartMenuArgs) => (MenuItemConfig | null)[]>(),
    getPanePreviewChartMenu:
        makeFunctionTemplate<(args: GetPanePreviewChartMenuArgs) => (MenuItemConfig | null)[]>(),
    getDefaultChartMenu:
        makeFunctionTemplate<(args: GetDefaultChartMenuArgs) => (MenuItemConfig | null)[]>(),
    getChartkitMenuByType:
        makeFunctionTemplate<
            (
                args?: GetChartkitMenuByType,
            ) => (
                | EntryContextMenuItem<unknown>
                | (EntryContextMenuItem<unknown> | undefined)[]
                | undefined
            )[]
        >(),
    getChartkitPlugins: makeFunctionTemplate<() => ChartKitPlugin[]>(),
    getChartkitType: makeFunctionTemplate<(data?: LoadedWidgetData) => ChartKitType | undefined>(),
    getChartkitHolidays: makeFunctionTemplate<() => ChartKitHolidays>(),
    getChartkitInspectorSourceMeta:
        makeFunctionTemplate<(sourceType: string) => SourceMeta | null>(),
    postProcessRunResult:
        makeFunctionTemplate<(loaded: ResponseSuccessNode | ResponseSuccessControls) => Object>(),
    getSecureEmbeddingToken: makeFunctionTemplate<() => string>(),
} as const;
