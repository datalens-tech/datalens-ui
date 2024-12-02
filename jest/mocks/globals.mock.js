// The window implementation in jest does not contain a matchMedia field.
// Official description in the documentation
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

/* eslint-disable */
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

HTMLCanvasElement.prototype.getContext = () => {
    // return whatever getContext has to return
};

// Adding the DL object to the Window.
Object.defineProperty(window, 'DL', {
    writable: true,
    value: {
        user: {},
        requestId: '',
        endpoints: {
            charts: '',
        },
        userSettings: {},
    },
});

jest.mock(`../../src/ui/utils/utils.ts`, () => {
    return {
        isIframe: jest.fn(),
        isEnabledFeature: jest.fn(),
    };
});

jest.mock(`../../src/ui/libs/schematic-sdk/index.ts`, () => {
    return {
        iam: {},
        bi: {},
        system: {},
        banners: {},
    };
});

jest.mock(`../../src/ui/libs/userSettings/index.ts`, () => {
    return {
        UserSettings: {
            getInstance: () => {
                return {
                    getSettings: () => {
                        return {};
                    },
                };
            },
        },
    };
});

jest.mock('@gravity-ui/chartkit/d3', () => {
    return {
        CustomShapeRenderer: {
            pieCenterText: () => {},
        },
    };
});
