import {initSdk} from '../../libs/schematic-sdk';
import {registry} from '../index';

export const registryLibsPlugins = () => {
    registry.libs.schematicSdk.register(initSdk());
};
