import type {WizardParametrizationConfig} from './wizard';
import type {WorkbookParametrizationConfig} from './workbook';

export interface TestsParametrizationConfig {
    wizard: WizardParametrizationConfig;
    workbook: WorkbookParametrizationConfig;
}
