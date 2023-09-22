import {registry} from 'ui/registry';

export async function getFunctionsDocumentation() {
    const getFunctionsDocumentation = registry.common.functions.get('getFunctionsDocumentation');
    return getFunctionsDocumentation();
}

export async function fetchFunctionsDocumentation(path: string) {
    const fetchFunctionsDocumentation = registry.common.functions.get(
        'fetchFunctionsDocumentation',
    );
    return fetchFunctionsDocumentation(path);
}
