import type {RowEntryData} from '../EntryRow/EntryRow';

export type RightSectionProps = {entry: RowEntryData};

export type EntitiesListProps = {
    entities: RowEntryData[];
    hideTitle?: boolean;
    enableHover?: boolean;
    rightSectionSlot?: React.FC<RightSectionProps>;
    className?: string;
    rowClassName?: string;
} & (CurrentEntity | ScopeEntities);

export type CurrentEntity = {
    isCurrent: true;
    scope?: string;
};

export type ScopeEntities = {
    isCurrent?: false;
    scope: string;
};
