import {registryLibsPlugins} from '../libs/registryLibsPlugins';
import {registerChartPlugins} from '../units/chart/register';
import {registerCollectionsPlugins} from '../units/collections/register';
import {registerCommonPlugins} from '../units/common/register';
import {registerConnectionsPlugins} from '../units/connections/register';
import {registerDashPlugins} from '../units/dash/register';
import {registerDocsPlugins} from '../units/docs/register';
import {registerEditorPlugins} from '../units/editor/register';
import {registerMainPlugins} from '../units/main/register';
import {registerPublicPlugins} from '../units/public/register';
import {registerQlPlugins} from '../units/ql/register';
import {registerWizardPlugins} from '../units/wizard/register';
import {registerWorkbooksPlugins} from '../units/workbooks/register';

export const registerAppPlugins = () => {
    registerChartPlugins();
    registerConnectionsPlugins();
    registerCommonPlugins();
    registerDashPlugins();
    registerEditorPlugins();
    registerQlPlugins();
    registerWizardPlugins();
    registerPublicPlugins();
    registerWorkbooksPlugins();
    registerMainPlugins();
    registerDocsPlugins();
    registerCollectionsPlugins();
    //libs
    registryLibsPlugins();
};
