import {PresetFieldData} from './fields';

export interface GetPresetResponse {
    presetId: string;
    data: PresetFieldData;
}
export interface GetPresetArgs {
    presetId: string;
}
