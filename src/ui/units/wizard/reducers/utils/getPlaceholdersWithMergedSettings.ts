import {Placeholder, PlaceholderId} from '../../../../../shared';
import {getAvailableVisualizations} from '../../utils/visualization';

type GetMergedPlaceholdersSettingsArgs = {
    oldSettings: Record<string, any>;
    currentSettings: Record<string, any>;
    keysToMerge: string[];
};

const getMergedPlaceholdersSettings = ({
    oldSettings,
    currentSettings,
    keysToMerge,
}: GetMergedPlaceholdersSettingsArgs): Record<string, any> => {
    return keysToMerge.reduce(
        (acc, key) => {
            if (typeof currentSettings[key] !== 'undefined') {
                return {...acc, [key]: oldSettings[key]};
            }

            return acc;
        },
        {} as Record<string, any>,
    );
};

type GetChangedPlaceholderSettingsArgs = {
    presetSettings: Record<string, any>;
    oldSettings: Record<string, any>;
};

export const getChangedPlaceholderSettings = ({
    presetSettings,
    oldSettings,
}: GetChangedPlaceholderSettingsArgs): string[] => {
    return Object.keys(presetSettings).reduce((acc, key) => {
        const oldSetting = oldSettings[key];
        const defaultSetting = presetSettings[key];

        if (defaultSetting !== oldSetting) {
            return [...acc, key];
        }

        return acc;
    }, [] as string[]);
};

type GetPlaceholdersWithMergedSettingsArgs = {
    oldPlaceholders: Placeholder[];
    newPlaceholders: Placeholder[];
    oldVisualizationId: string;
    selectedPlaceholders?: Partial<Record<PlaceholderId, boolean>>;
};

export const getPlaceholdersWithMergedSettings = (
    args: GetPlaceholdersWithMergedSettingsArgs,
): Placeholder[] => {
    const {oldPlaceholders, newPlaceholders, oldVisualizationId, selectedPlaceholders} = args;
    const availableVisualizations = getAvailableVisualizations();

    const visualizationPreset = availableVisualizations.find(({id}) => id === oldVisualizationId);

    if (!visualizationPreset) {
        return newPlaceholders;
    }

    const presetPlaceholders: Placeholder[] = visualizationPreset.placeholders || [];

    // 1 array - 1 placeholder. Match by index
    const changedSettingsPerPlaceholder: string[][] = oldPlaceholders.map((oldPlaceholder) => {
        if (selectedPlaceholders && !selectedPlaceholders[oldPlaceholder.id as PlaceholderId]) {
            return [];
        }
        const currentPresetPlaceholder = presetPlaceholders.find(
            (presetPlaceholder: Placeholder) => presetPlaceholder.id === oldPlaceholder.id,
        );

        const oldSettings = oldPlaceholder.settings || {};
        const presetSettings = currentPresetPlaceholder?.settings || {};

        return getChangedPlaceholderSettings({oldSettings, presetSettings});
    });

    return newPlaceholders.map((placeholder, index) => {
        if (selectedPlaceholders && !selectedPlaceholders[placeholder.id as PlaceholderId]) {
            return placeholder;
        }
        const changedSettingsInPrevVisualization = changedSettingsPerPlaceholder[index];
        const oldPlaceholder = oldPlaceholders[index];

        let mergedSettings: Record<string, any> = {};
        const currentSettings = placeholder.settings || {};

        if (oldPlaceholder) {
            const oldSettings = oldPlaceholder.settings || {};

            mergedSettings = getMergedPlaceholdersSettings({
                oldSettings,
                currentSettings,
                keysToMerge: changedSettingsInPrevVisualization,
            });
        }

        return {
            ...placeholder,
            settings: {
                ...currentSettings,
                ...mergedSettings,
            },
        };
    });
};
