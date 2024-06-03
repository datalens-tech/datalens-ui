import type {ConnectorType} from '../../shared';

export type ConvertConnectorTypeToQLConnectionType = (connectorType: string) => ConnectorType;
