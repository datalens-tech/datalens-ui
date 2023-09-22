import {registry} from 'ui/registry';

export function getResolveUsersByIdsAction() {
    const resolveUsers = registry.common.functions.get('resolveUsersByIds');
    return resolveUsers;
}
