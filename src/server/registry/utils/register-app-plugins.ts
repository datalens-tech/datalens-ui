import {registerGatewayAuthPlugins} from '../../../shared/registry/units/gateway-auth/register';
import {registerCommonPlugins} from '../units/common/register';

export const registerAppPlugins = () => {
    registerCommonPlugins();
    registerGatewayAuthPlugins();
};
