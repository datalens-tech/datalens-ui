import {CollectionPageContainer} from 'units/collections/containers/CollectionPageContainer/CollectionPageContainer';
import {collectionsReducer} from 'units/collections/store/reducers';
import {reducerRegistry} from '../../../store';

reducerRegistry.register({
    collections: collectionsReducer,
});

export default CollectionPageContainer;
