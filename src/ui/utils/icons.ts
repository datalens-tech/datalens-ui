import type {IconId} from '../../shared';
import config from '../configs';

const iconsConfig = config.icons;

export const getIconDataById = (id: IconId) => {
    return iconsConfig[id];
};
