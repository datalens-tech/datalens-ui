import {
    getAvailableQlVisualizations,
    getDefaultQlVisualization,
    getQlVisualization,
} from '../visualization';

import {
    MOCKED_DEFAULT_VISUALIZATION,
    MOCKED_INVALID_VISUALIZATION,
    MOCKED_LOADED_VISUALIZATION,
    MOCKED_LOADED_VISUALIZATION_WITH_PLACEHOLDERS,
    MOCKED_PREDEFINED_VISUALIZATION,
    MOCKED_PREDEFINED_VISUALIZATION_WITH_OVERRIDE,
} from './mocks/getQlVisualization';

jest.mock('../visualization/getAvailableQlVisualizations', () => {
    return {
        getAvailableQlVisualizations: jest.fn(),
    };
});

jest.mock('../visualization/getDefaultQlVisualization', () => {
    return {
        getDefaultQlVisualization: jest.fn(),
    };
});

const getAvailableQlVisualizationsMock = getAvailableQlVisualizations as jest.Mock;
const getDefaultQlVisualizationMock = getDefaultQlVisualization as jest.Mock;

describe('getQlVisualization', () => {
    beforeEach(() => {
        getAvailableQlVisualizationsMock.mockImplementationOnce(() => [
            MOCKED_PREDEFINED_VISUALIZATION,
        ]);
    });
    it('should merge properties of predefined visualization and loaded visualization', () => {
        const result = getQlVisualization(MOCKED_LOADED_VISUALIZATION);

        expect(result).toStrictEqual({...MOCKED_PREDEFINED_VISUALIZATION, colorsCapacity: 1});
    });

    it('should not override already defined properties in predefined visualization', () => {
        const result = getQlVisualization(MOCKED_PREDEFINED_VISUALIZATION_WITH_OVERRIDE);

        expect(result.allowLabels).toStrictEqual(false);
    });

    it('should leave default value for placeholders from predefined visualization', () => {
        const result = getQlVisualization(MOCKED_LOADED_VISUALIZATION_WITH_PLACEHOLDERS);

        expect(result).toStrictEqual(MOCKED_PREDEFINED_VISUALIZATION);
    });

    it('should return default visualization, when id does not match with availableVisualizations', () => {
        getDefaultQlVisualizationMock.mockImplementationOnce(() => MOCKED_DEFAULT_VISUALIZATION);

        const result = getQlVisualization(MOCKED_INVALID_VISUALIZATION);

        expect(result).toStrictEqual(MOCKED_DEFAULT_VISUALIZATION);
    });
});
