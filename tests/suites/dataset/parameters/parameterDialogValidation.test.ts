import {Page} from '@playwright/test';

import {DialogParameterDataTypes} from '../../../page-objects/common/DialogParameter';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage} from '../../../utils';
import {RobotChartsDatasetUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMETER_NAME = 'PARAMETER_TEST_NAME';
const PARAMETER_VALUE = 'PARAMETER_TEST_VALUE';

datalensTest.describe('Datasets - Parameter dialog validation', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.DatasetWithParameters, {tab: 'parameters'});
    });

    datalensTest('Required fields validation', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        await datasetPage.datasetTabSection.clickAddButton();
        const nameInput = await datasetPage.dialogParameter.getNameInput();
        const defaultValueInput = await datasetPage.dialogParameter.getDefaultValueInput();
        const applyButton = await datasetPage.dialogParameter.getApplyButton();

        // Пытаемся зааплаить с пустыми полями
        await datasetPage.dialogParameter.apply();

        // Проверяем, что все поля невалидны и кнопка сабмита неактивна
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(defaultValueInput).toHaveAttribute('aria-invalid', 'true');
        expect(applyButton).toBeDisabled();

        // Устанавливаем имя параметра
        await datasetPage.dialogParameter.setName(PARAMETER_NAME);

        // Проверяем, что поле с именем валидно, поле со значением по умолчанию - нет, кнопка сабмита неактивна
        expect(nameInput).not.toHaveAttribute('aria-invalid');
        expect(defaultValueInput).toHaveAttribute('aria-invalid', 'true');
        expect(applyButton).toBeDisabled();

        // Устанавливаем значение параметра
        await datasetPage.dialogParameter.setDefaultValue(PARAMETER_VALUE);

        // Проверяем, что все поля валидны и кнопка сабмита активна
        expect(nameInput).not.toHaveAttribute('aria-invalid');
        expect(defaultValueInput).not.toHaveAttribute('aria-invalid');
        expect(applyButton).not.toBeDisabled();

        // Устанавливаем пустые значения в поля
        await datasetPage.dialogParameter.setName('');
        await datasetPage.dialogParameter.setDefaultValue('');

        // Проверяем, что все поля невалидны и кнопка сабмита неактивна
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(defaultValueInput).toHaveAttribute('aria-invalid', 'true');
        expect(applyButton).toBeDisabled();
    });

    datalensTest('Parameter name validation', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        await datasetPage.datasetTabSection.clickAddButton();
        const nameInput = await datasetPage.dialogParameter.getNameInput();

        await datasetPage.dialogParameter.setName('_');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setName('абв');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setName('±');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setName('tab');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setName('1234567890asdfghzxcvbn!@#$%^&*_-QWERTY');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setName('PARAMETER_NAME');
        expect(nameInput).not.toHaveAttribute('aria-invalid');
    });

    datalensTest('Parameter default_value validation [number]', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        await datasetPage.datasetTabSection.clickAddButton();
        await datasetPage.dialogParameter.selectType(DialogParameterDataTypes.Int);
        const defaultValueInput = await datasetPage.dialogParameter.getDefaultValueInput();

        await datasetPage.dialogParameter.setDefaultValue('abc');
        expect(defaultValueInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setDefaultValue('123.456');
        expect(defaultValueInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setDefaultValue('123');
        expect(defaultValueInput).not.toHaveAttribute('aria-invalid');

        await datasetPage.dialogParameter.selectType(DialogParameterDataTypes.Float);

        await datasetPage.dialogParameter.setDefaultValue('abc');
        expect(defaultValueInput).toHaveAttribute('aria-invalid', 'true');

        await datasetPage.dialogParameter.setDefaultValue('123.456');
        expect(defaultValueInput).not.toHaveAttribute('aria-invalid');

        await datasetPage.dialogParameter.setDefaultValue('123');
        expect(defaultValueInput).not.toHaveAttribute('aria-invalid');
    });
});
