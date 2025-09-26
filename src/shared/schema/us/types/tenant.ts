import type {TenantFields, TenantSettings} from './fields';

export type SetDefaultColorPaletteArgs = {
    defaultColorPaletteId: string;
};

export type SetDefaultColorPaletteResponse = TenantFields;

export type GetTenantDetailsArgs = {
    tenantId: string;
};

export type GetTenantDetailsResponse = TenantFields;

export type ChangeTenantSettingArgs = {
    key: keyof TenantSettings;
    value: TenantSettings[keyof TenantSettings];
};

export type ChangeTenantSettingResponse = TenantFields;
