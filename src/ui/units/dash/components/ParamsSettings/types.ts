export type ParamsSettingData = Record<string, string | string[]>;

export type ParamsSettingsProps = {
    tagLabelClassName?: string;
    data: ParamsSettingData;
    group?: number;
    validator?: {
        title?: (t: string) => null | Error;
        value?: (v: string) => null | Error;
    };
    qa?: string;
    onEditParamTitle: (oldTitle: string, title: string) => void;
    onEditParamValue: (title: string, value: string[]) => void;
    onRemoveParam: (title: string) => void;
    onRemoveAllParams: () => void;
};
