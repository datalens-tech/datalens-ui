const basic = (next = []) => `
interface IEditor {
    /**
     * Return current user login
     */
    getUserLogin(): string;
    /**
     * Return current user lang
     */
    getUserLang(): string;
    /**
     * Return current user lang
     */
    getLang(): string;
    /**
     * Return added secrets {key: value, ...}
     */
    getSecrets(): { [key]: string };
    /**
     * Return data from tab 'Shared'
     */
    getSharedData(): { [key]: any };
    /**
     * Return data from tab 'Params'
     */
    getParams(): { [key]: any };
    /**
     * Return <ISO date>\n
     * \t'__relative_-7d' return 7 day before\n
     * years - y; month - M; weeks - w; days - d; hours - h; minutes - m; seconds - s; milliseconds - ms;
     */
    resolveRelative(relativeStr: string): string;
    /**
     * Return {from: <ISO date>, to: <ISO date>}\n
     * \t'__interval___relative_-7d___relative_+30min' return {from: <7 day before>, to: <now + 30 minutes>}\n
     * \t'__interval_2018-10-10___relative_-2w' return {from: '2018-10-10 00:00:00', to: <2 weeks before>}\n
     * years - y; month - M; weeks - w; days - d; hours - h; minutes - m; seconds - s; milliseconds - ms;
     */
    resolveInterval(intervalStr: string): {from: string, to: string};
    /**
     * \tMethod used to preparing function for invocation in browser.\n
     * \t@param {string} value.fn function that will be invoked in a browser.\n
     * \t@param {string} value.args optional arguments that will be added to the list of default arguments.\n
     * \t@return prepared object that will be converted into function in browser.
     */
    wrapFn: (value: {fn: (...args: unknown[]) => unknown; args?: unknown | unknown[]}) => unknown;
    /**
     * \tMethod used to describe the markup using an object.\n
     * \t@param {object} value markup configuration.\n
     * \t@return stringified markup.
     */
    generateHtml: (value: object) => string;

    /**
     * \tMethod used to get source id from the meta tab.\n
     * \t@param {string} name name of the source.\n
     * \t@return source id.
     */
    getId(name: string) => string;

    ${next.join('\n')}
}

declare let ChartEditor: IEditor;
declare let Editor: IEditor;
`;

const partUpdateParams = `
    /**
     * Merge 'newParams' with config from tab 'Params'
     */
    updateParams(newParams: object): void;
`;

const ui = `
    /**
     * Return data from tab 'Urls'
     */
    getLoadedData(): any;
    /**
     * Return requests info (latency etc.) from tab 'Urls'
     */
    getLoadedDataStats(): any;
${partUpdateParams}
`;

const js = `
    /**
     * Merge 'newFragment' with config from tab 'Config'
     */
    updateConfig(newFragment: object): void;
    /**
     * Merge 'newFragment' with config from tab 'Highcharts'
     */
    updateHighchartsConfig(newFragment: object): void;
`;

const params = `
${partUpdateParams}
`;

// TODO: In the future, replace it with a similar one if I use the types in the charts-engine
// monaco.languages.typescript.typescriptDefaults.addExtraLib(
//     `export declare function next() : string`,
//     'node_modules/@types/external/index.d.ts');

export const getTypes = ({language, tab}) => {
    if (language !== 'javascript') {
        return '';
    }
    switch (tab) {
        case 'ui':
            return basic([ui]);
        case 'js':
            return basic([ui, js]);
        case 'params':
            return basic([params]);
        default:
            return basic();
    }
};
