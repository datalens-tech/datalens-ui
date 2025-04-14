import type {DirectionValue} from 'ui/components/DialogRelatedEntities/constants';

export type RenderDialogRelatedEntitiesAlertHint = ({
    direction,
    entryScope,
    entryType,
}: {
    direction: DirectionValue;
    entryScope: string;
    entryType: string;
}) => React.ReactNode | null;
