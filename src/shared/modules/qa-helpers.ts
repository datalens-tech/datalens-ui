import type {ConnectorFormItem} from '../schema/bi/types';

export const getConnectorFormItemQa = ({id, name}: {id: ConnectorFormItem['id']; name: string}) => {
    return `conn-${id}-${name}`;
};
