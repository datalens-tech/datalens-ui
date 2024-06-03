import type {MonitoringPreset} from '../../../index';

export type GetPresetResponse = MonitoringPreset;
export interface GetPresetArgs {
    presetId: string;
}
