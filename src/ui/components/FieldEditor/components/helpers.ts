import {registry} from 'ui/registry';

export async function getFunctionsDocumentation() {
    const getFunctionsDocumentation = registry.common.functions.get('getFunctionsDocumentation');
    return getFunctionsDocumentation();
}

export async function fetchFunctionsDocumentation(docsEndpoint: string, path: string) {
    const fetchFunctionsDocumentation = registry.common.functions.get(
        'fetchFunctionsDocumentation',
    );

    // Temporary backwards compatible tweak to support old version of `fetchFunctionsDocumentation`
    // that doesn't process html itself.
    // Will be removed in next PR.
    if (fetchFunctionsDocumentation.length === 1) {
        const functionDoc = await fetchFunctionsDocumentation(path);
        functionDoc.html = functionDoc.html
            // Remove all icons from buttons to copy text
            .replace(/<svg[^>]*>/gs, '')
            // Make Cloud Documentation references
            // Delete anchor and external references
            .replace(
                /href=(["'])(?!http|#)(.+?)\1/gs,
                (_linkAttr: string, _quote: string, functionName: string) => {
                    return `href="${docsEndpoint}/function-ref/${functionName}" target="_blank"`;
                },
            );

        return functionDoc;
    }

    return fetchFunctionsDocumentation(docsEndpoint, path);
}
