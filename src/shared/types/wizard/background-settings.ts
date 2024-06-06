import type {ColorsConfig} from './index';
type PaletteFields = 'mountedColors' | 'palette';
type GradientFields =
    | 'thresholdsMode'
    | 'leftThreshold'
    | 'middleThreshold'
    | 'rightThreshold'
    | 'gradientPalette'
    | 'gradientMode'
    | 'reversed';

export interface TableFieldBackgroundSettings {
    enabled: boolean;
    colorFieldGuid: string;
    settingsId: string;
    settings: {
        paletteState: Pick<ColorsConfig, PaletteFields>;
        gradientState: Pick<ColorsConfig, GradientFields>;
        isContinuous: boolean;
    };
}
