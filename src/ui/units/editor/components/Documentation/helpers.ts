import {registry} from 'ui/registry';

export const fetchEditorDocumentation = (activeTab: string) => {
    const fetchEditorDocumentation = registry.editor.functions.get('fetchEditorDocumentation');
    return fetchEditorDocumentation(activeTab);
};
