import {UISandboxContext} from '../../../../../../shared/constants/ui-sandbox';

const getObjectType = (object) => {
    const entries = Object.entries(object);

    return entries.reduce((acc, [key, value], i) => {
        acc += `\n${key}: "${value}"\n`;
        if (i === entries.length - 1) {
            acc += '}';
        }
        return acc;
    }, '{');
};

const UISandboxContextValues = Object.values(UISandboxContext).reduce((acc, value) => {
    acc += ` | "${value}"`;
    return acc;
}, '');

const basic = (next = []) => `
interface IChartEditor {
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
     * Return added yav secrets {key: value, ...}
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
    /** Method uses to prepare function for invocation in browser */
    wrapFn: (value: {fn: (...args: unknown[]) => void; ctx: ${UISandboxContextValues}}) => unknown;
    /** Map of values are allowed to use in \`ChartEditor.wrapFn\` method */ 
    UISandboxContext: ${getObjectType(UISandboxContext)},

    ${next.join('\n')}
}

declare let ChartEditor: IChartEditor;
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
