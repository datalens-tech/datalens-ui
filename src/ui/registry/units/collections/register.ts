import {
    customizeCollectionsActions,
    customizeEmptyPlaceholder,
    customizeWorkbooksActions,
} from '../../../units/collections/components/CollectionContent/utils';
import {registry} from '../../index';

export const registerCollectionsPlugins = () => {
    registry.collections.functions.register({
        customizeWorkbooksActions,
        customizeCollectionsActions,
        customizeEmptyPlaceholder,
    });
};
