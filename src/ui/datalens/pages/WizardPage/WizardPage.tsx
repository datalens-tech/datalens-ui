import {reducerRegistry} from '../../../store';

import reducers from 'units/wizard/reducers';
import dash from 'units/dash/store/reducers/dash';

import Wizard from 'units/wizard/containers/App';
import {experimental} from 'ui/units/dash/store/slices/experimental/experimental';

reducerRegistry.register({
    wizard: reducers,
    dash,
    experimental,
});

export default Wizard;
