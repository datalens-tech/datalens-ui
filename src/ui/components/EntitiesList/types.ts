import type {RowEntryData} from '../EntryRow/EntryRow';

export type RightSectionProps = {entry: RowEntryData};

export type EntitiesListProps = {
    entities: RowEntryData[];
    hideTitle?: boolean;
    enableHover?: boolean;
    rightSectionSlot?: React.FC<RightSectionProps>;
    className?: string;
    rowClassName?: string;
} & (CurrentEntity | ScopeEntities | CustomTitle);

export type CurrentEntity = {
    isCurrent: true;
    scope?: string;
    title?: string;
};

export type ScopeEntities = {
    isCurrent?: false;
    scope: string;
    title?: string;
};

export type CustomTitle = {
    isCurrent?: false;
    scope?: string;
    title: string;
};
