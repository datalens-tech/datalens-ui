import type {IChartEditor, QlConfig} from '../../../../../../../shared';

import {buildLibraryConfig} from './build-library-config';

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    return buildLibraryConfig({shared, ChartEditor});
};
