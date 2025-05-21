import type {ConnectorType} from 'shared';
import type {GetEntryResponse} from 'shared/schema';

export interface AdditionalConnectionFormActionsProps {
    connectorType: ConnectorType;
    entry: GetEntryResponse | undefined;
}
