import {collectionsReducer} from 'units/collections/store/reducers';
import {reducerRegistry} from '../../../store';
import {CollectionsNavigationRouter} from '../../../units/collections-navigation/components/CollectionsNavigationRouter';

reducerRegistry.register({
    collections: collectionsReducer,
});

export default CollectionsNavigationRouter;
