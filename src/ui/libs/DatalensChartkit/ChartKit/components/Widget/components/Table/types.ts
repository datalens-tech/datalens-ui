import type {RunActivityFn, TableWidgetData, WidgetProps} from '../../../../../types';

export type TableProps = WidgetProps & {data: TableWidgetData} & {runActivity?: RunActivityFn};
