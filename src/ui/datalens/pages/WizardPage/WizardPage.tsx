import {reducerRegistry} from '../../../store';

import reducers from 'units/wizard/reducers';
import dash from 'units/dash/store/reducers/dash';

import Wizard from 'units/wizard/containers/App';

reducerRegistry.register({
    wizard: reducers,
    dash,
});

export default Wizard;
