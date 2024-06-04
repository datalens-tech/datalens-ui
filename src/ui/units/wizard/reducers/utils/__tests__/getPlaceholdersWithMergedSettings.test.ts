import pick from 'lodash/pick';
import type {Placeholder} from 'shared';

import {getPlaceholdersWithMergedSettings} from '../getPlaceholdersWithMergedSettings';

const LINE_PLACEHOLDERS = [
    {
        id: 'x',
        settings: {
            title: 'on',
            titleValue: 'New Title',
        },
    },
    {
        id: 'y',
        settings: {
            scale: 'manual',
            nulls: 'ignore',
        },
    },
    {
        id: 'y2',
        settings: {
            hideLabels: 'no',
            labelsView: 'auto',
        },
    },
] as unknown as Placeholder[];

const COLUMN_PLACEHOLDERS = [
    {
        id: 'x',
        settings: {
            title: 'off',
            titleValue: '',
            type: 'linear',
            grid: 'on',
        },
    },
    {
        id: 'y',
        settings: {
            scale: 'auto',
            nulls: 'as-0',
        },
    },
] as unknown as Placeholder[];

jest.mock('../../../utils/visualization', () => {
    return {
        getAvailableVisualizations: () => [
            {
                id: 'line',
                placeholders: [
                    {
                        id: 'x',
                        settings: {
                            title: 'off',
                            titleValue: '',
                        },
                    },
                    {
                        id: 'y',
                        settings: {
                            scale: 'auto',
                            nulls: 'ignore',
                        },
                    },
                    {
                        id: 'y2',
                        settings: {
                            hideLabels: 'no',
                            labelsView: 'auto',
                        },
                    },
                ],
            },
            {
                id: 'column',
                placeholders: [
                    {
                        id: 'x',
                        settings: {
                            title: 'off',
                            titleValue: '',
                        },
                    },
                    {
                        id: 'y',
                        settings: {
                            scale: 'auto',
                            nulls: 'ignore',
                        },
                    },
                ],
            },
        ],
    };
});

describe('getPlaceholdersWithMergedSettings', () => {
    it('If there are more placeholders in the old visualization than in the new one, then the extra placeholders are ignored', () => {
        const result = getPlaceholdersWithMergedSettings({
            oldPlaceholders: LINE_PLACEHOLDERS,
            newPlaceholders: COLUMN_PLACEHOLDERS,
            oldVisualizationId: 'line',
        });

        expect(result).toHaveLength(2);
    });

    it('If there are fewer placeholders in the old visualization, then the remaining placeholders will be with default settings', () => {
        const result = getPlaceholdersWithMergedSettings({
            oldPlaceholders: COLUMN_PLACEHOLDERS,
            newPlaceholders: LINE_PLACEHOLDERS,
            oldVisualizationId: 'column',
        });

        expect(result).toHaveLength(3);

        const lastPlaceholder = result[2];

        expect(lastPlaceholder.settings).toStrictEqual({hideLabels: 'no', labelsView: 'auto'});
    });

    it('Should return the changed settings, only those that were changed in the last visualization: {x: [title, titleValue], y: [scale]}', () => {
        const result = getPlaceholdersWithMergedSettings({
            oldPlaceholders: LINE_PLACEHOLDERS,
            newPlaceholders: COLUMN_PLACEHOLDERS,
            oldVisualizationId: 'line',
        });

        const xPlaceholder = result[0];
        const yPlaceholder = result[1];

        expect(pick(xPlaceholder.settings, ['title', 'titleValue', 'type', 'grid'])).toEqual({
            title: 'on',
            titleValue: 'New Title',
            type: 'linear',
            grid: 'on',
        });

        expect(pick(yPlaceholder.settings, ['scale', 'nulls'])).toEqual({
            scale: 'manual',
            nulls: 'as-0',
        });
    });

    it('Should return the unchanged placeholder if a non-existent visualization is used', () => {
        const result = getPlaceholdersWithMergedSettings({
            oldPlaceholders: LINE_PLACEHOLDERS,
            newPlaceholders: COLUMN_PLACEHOLDERS,
            oldVisualizationId: 'wow-visualization',
        });

        expect(result).toStrictEqual(COLUMN_PLACEHOLDERS);
    });

    it('Should update only selectedPlaceholders, when this parameter is passed to function', () => {
        const result = getPlaceholdersWithMergedSettings({
            oldPlaceholders: LINE_PLACEHOLDERS,
            newPlaceholders: COLUMN_PLACEHOLDERS,
            oldVisualizationId: 'line',
            selectedPlaceholders: {x: true},
        });

        expect(result).toHaveLength(2);
        expect(result[0].settings).toEqual({
            title: 'on',
            titleValue: 'New Title',
            type: 'linear',
            grid: 'on',
        });

        expect(result[1].settings).toEqual({
            scale: 'auto',
            nulls: 'as-0',
        });
    });
});
