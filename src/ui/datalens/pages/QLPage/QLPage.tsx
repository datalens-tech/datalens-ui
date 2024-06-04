import React from 'react';

import type {QLChartType} from 'shared';

import App from 'units/ql/containers/App/App';
import {reducerRegistry} from '../../../store';

import ql from 'units/ql/store/reducers';
import dash from 'units/dash/store/reducers/dash';
import wizard from 'units/wizard/reducers';

import 'ui/styles/dl-monaco.scss';

const qlStore: {ql: typeof ql; dash: typeof dash; wizard?: typeof wizard} = {
    ql,
    dash,
};

qlStore.wizard = wizard;

reducerRegistry.register(qlStore);

const QLPage = ({chartType}: {chartType?: QLChartType}) => {
    return <App chartType={chartType} />;
};

export default QLPage;
