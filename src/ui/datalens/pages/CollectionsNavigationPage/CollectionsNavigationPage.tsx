import {collectionsNavigationReducer} from 'units/collections-navigation/store/reducers';
import {collectionsReducer} from 'units/collections/store/reducers';
import {reducerRegistry} from '../../../store';
import {CollectionsNavigationApp} from '../../../units/collections-navigation/components/CollectionsNavigationApp';

reducerRegistry.register({
    collectionsNavigation: collectionsNavigationReducer,
    collections: collectionsReducer,
    // workbooksReducer is already included as core reducer
});

export default CollectionsNavigationApp;
