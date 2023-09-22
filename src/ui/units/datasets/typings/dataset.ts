export interface ObligatoryFilter {
    id: string;
    field_guid: string;
    managed_by: string;
    valid: boolean;
    default_filters: [
        {
            column: string;
            operation: string;
            values: string[];
        },
    ];
}
