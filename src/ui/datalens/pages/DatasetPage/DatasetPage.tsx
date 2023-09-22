import React from 'react';
import dataset from 'units/datasets/store/reducers';
import {sdk} from 'ui';
import {reducerRegistry} from '../../../store';
import DatasetRouter from 'units/datasets/components/DatasetRouter/DatasetRouter';

import 'units/datasets/styles/variables.scss';

reducerRegistry.register({
    dataset,
});

const DatasetPage = () => <DatasetRouter sdk={sdk} />;

export default DatasetPage;
