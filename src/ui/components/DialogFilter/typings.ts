export enum ViewMode {
    Fields = 'fields',
    Filters = 'filters',
}

export type ChangeValue = (values: string[], meta?: {needSort?: boolean; valid?: boolean}) => void;
