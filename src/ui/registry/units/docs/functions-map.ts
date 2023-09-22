import {makeFunctionTemplate} from 'shared/utils/makeFunctionTemplate';

export const docsFunctionsMap = {
    getFieldEditorDocPath: makeFunctionTemplate<(href: string) => string>(),
} as const;
