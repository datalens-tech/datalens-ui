import type {HotkeysContextType} from 'react-hotkeys-hook/dist/HotkeysProvider';

export function useSetHotkeysScope({
    hotkeysContext,
    componentScope,
}: {
    hotkeysContext: HotkeysContextType;
    componentScope: string;
}) {
    const previousScopes = hotkeysContext.enabledScopes;

    const setHotkeysScope = () => {
        const {enabledScopes, enableScope, disableScope} = hotkeysContext;

        enabledScopes.forEach((scope) => {
            disableScope(scope);
        });

        enableScope(componentScope);
    };

    const unsetHotkeysScope = () => {
        const {enableScope, disableScope} = hotkeysContext;

        previousScopes.forEach((scope) => {
            enableScope(scope);
        });

        disableScope(componentScope);
    };

    return {setHotkeysScope, unsetHotkeysScope};
}
