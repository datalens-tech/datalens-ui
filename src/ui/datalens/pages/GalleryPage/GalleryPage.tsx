import {reducerRegistry} from '../../../store';
import {App} from '../../../units/gallery';
import {reducer} from '../../../units/gallery/store/reducer';

reducerRegistry.register({
    gallery: reducer,
});

export default App;
