import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import type {ChartsEngine} from '..';
import type {WorkbookId} from '../../../../shared';
import {ControlType} from '../../../../shared';
import type {ProcessorParams} from '../components/processor';
import type {ReducedResolvedConfig, ResolvedConfig} from '../components/storage/types';

import {runControl} from './control';
import {runWizardChart} from './wizard';

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
    config: ResolvedConfig | ReducedResolvedConfig;
    configResolving: number;
    workbookId?: WorkbookId;
    isWizard?: boolean;
    forbiddenFields?: ProcessorParams['forbiddenFields'];
};

export function getDefaultRunners() {
    const runners: Runner[] = [
        {
            name: 'wizard',
            trigger: new Set([
                'graph_wizard_node',
                'table_wizard_node',
                'ymap_wizard_node',
                'metric_wizard_node',
                'markup_wizard_node',
                'timeseries_wizard_node',
                'd3_wizard_node',
            ]),
            safeConfig: true,
            handler: runWizardChart,
        },
        {
            // for all types of controls except editor control
            name: 'dashControls',
            trigger: new Set([ControlType.Dash]),
            safeConfig: true,
            handler: runControl,
        },
    ];

    return runners;
}
