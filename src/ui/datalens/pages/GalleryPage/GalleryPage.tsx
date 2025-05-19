import {reducerRegistry} from '../../../store';
import {App} from '../../../units/gallery';
import {galleryApi} from '../../../units/gallery/store/api';

reducerRegistry.register({
    [galleryApi.reducerPath]: galleryApi.reducer,
});

export default App;
