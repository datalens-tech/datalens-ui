export type ConnectionByFieldsProp = string[] | string;
export type ConnectionByUsedParamsProp = string[] | string;
export type ConnectionByAliasesProp = string[][] | string;
export type ConnectionIndirectAliasesProp = string[][];

export type ConnectionField =
    | ConnectionByFieldsProp
    | ConnectionByUsedParamsProp
    | ConnectionByAliasesProp
    | ConnectionIndirectAliasesProp;
export type ConnectionType = 'alias' | 'field' | 'param' | 'indirect';
