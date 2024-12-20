import React from 'react';

import type {GradientNullMode, NestedPartial, TableFieldBackgroundSettings} from 'shared';

export function useBackgroundNullModeSettings({
    state,
    onUpdate,
}: {
    onUpdate: (args: NestedPartial<TableFieldBackgroundSettings, 'settings'>) => void;
    state: TableFieldBackgroundSettings;
}) {
    const handleNullModeUpdate = React.useCallback(
        (nullMode: GradientNullMode) => {
            onUpdate({
                ...state,
                settings: {
                    ...state.settings,
                    gradientState: {
                        ...state.settings.gradientState,
                        nullMode,
                    },
                },
            });
        },
        [onUpdate, state],
    );
    return {
        nullMode: state.settings.gradientState.nullMode,
        handleNullModeUpdate,
    };
}
