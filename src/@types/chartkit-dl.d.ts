import '../shared/types/chartkit';

declare module '../shared/types' {
    export interface TableCommonCell {
        color?: number;
        backgroundColor?: string;
        type?: 'number' | 'markup';
    }
}
