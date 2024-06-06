import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import type {ChartsEngine} from '..';
import type {WorkbookId} from '../../../../shared';
import {EDITOR_TYPE} from '../../../../shared/constants';
import type {ResolvedConfig} from '../components/storage/types';

import {runChart} from './chart';
import {runEditor} from './editor';

export type Runner = {
    name: string;
    trigger: Set<string>;
    handler: RunnerHandler;
    safeConfig?: boolean;
};

export type RunnerHandler = (
    ctx: AppContext,
    {chartsEngine, req, res, config, configResolving}: RunnerHandlerProps,
) => void;

export type RunnerHandlerProps = {
    chartsEngine: ChartsEngine;
    req: Request;
    res: Response;
    config: ResolvedConfig;
    configResolving: number;
    workbookId?: WorkbookId;
    isWizard?: boolean;
};

const runners: Runner[] = [
    {
        name: 'editor',
        trigger: new Set([
            'graph_node',
            'table_node',
            'text_node',
            'metric_node',
            'map_node',
            'ymap_node',
            'control_node',
            'markdown_node',
            'markup_node',
            'timeseries_node',
            EDITOR_TYPE.D3_NODE,
        ]),
        handler: runEditor,
    },

    {
        name: 'wizard',
        trigger: new Set([
            'graph_wizard_node',
            'table_wizard_node',
            'ymap_wizard_node',
            'metric_wizard_node',
            'markup_wizard_node',
            'control_dash',
            'timeseries_wizard_node',
            'd3_wizard_node',
        ]),
        safeConfig: true,
        handler: runChart,
    },
];

export default runners;
