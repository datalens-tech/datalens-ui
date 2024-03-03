import {collectionsReducer} from 'units/collections/store/reducers';
import {reducerRegistry} from '../../../store';
import {CollectionsNavigationRouter} from '../../../units/collections-navigation/components/CollectionNavigationRouter';

reducerRegistry.register({
    collections: collectionsReducer,
});

export default CollectionsNavigationRouter;
