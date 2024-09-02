import type {IChartEditor, Palette, QlConfig} from '../../../../../../../shared';

export type BuildSourcesArgs = {
    shared: QlConfig;
    ChartEditor: IChartEditor;
    palettes: Record<string, Palette>;
};
