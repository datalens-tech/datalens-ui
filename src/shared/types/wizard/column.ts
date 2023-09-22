export type ColumnSettings = {
    width: WidthAutoSetting | WidthPercentSetting | WidthPixelSetting;
};

export type WidthAutoSetting = {
    mode: 'auto';
};

export type WidthPercentSetting = {
    mode: 'percent';
    value: string;
};

export type WidthPixelSetting = {
    mode: 'pixel';
    value: string;
};
