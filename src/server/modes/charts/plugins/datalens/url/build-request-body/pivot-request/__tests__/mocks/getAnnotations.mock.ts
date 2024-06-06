import type {ApiV2BackgroundSettingsGuids, ServerField} from '../../../../../../../../../../shared';

export const COLORS = [{guid: '1899d37a-ff15-4bbc-b9f1-9df1e5f715ee'}] as ServerField[];

export const BACKGROUND_COLORS = [
    {
        colorFieldGuid: 'bfccec5c-941a-45aa-89d6-8cc7a09b19ca',
        targetFieldGuid: 'fdddd3b0-5639-11eb-9c8e-41e84ec800f0',
        isContinuous: true,
    },
] as ApiV2BackgroundSettingsGuids[];

export const DIMENSION_BACKGROUND_COLORS = [
    {
        colorFieldGuid: 'asdha91-2131njda-12424jjd-23s-21eh12h',
        targetFieldGuid: 'fdddd3b0-5639-11eb-9c8e-41e84ec800f0',
        isContinuous: false,
    },
] as ApiV2BackgroundSettingsGuids[];

export const USED_FIELDS_MAP = {
    'fdddd3b0-5639-11eb-9c8e-41e84ec800f0': {legendItemId: 1, role: 'pivot_measure'},
};
export const MEASURE_NAME_COLORS = [{title: 'Measure Names', type: 'PSEUDO'}] as ServerField[];

export const extendUsedFieldsMap = (
    extend: Record<string, {legendItemId: number; role: string}>,
) => {
    return {
        ...USED_FIELDS_MAP,
        ...extend,
    };
};
