import type {ExportActionArgs} from 'ui/libs/DatalensChartkit/components/ChartKitBase/components/Header/components/Menu/Items/Export/types';
import type {MenuItemConfig} from 'ui/libs/DatalensChartkit/menu/Menu';
import type {AlertsActionArgs} from 'ui/libs/DatalensChartkit/types/menu';
import {getStore} from 'ui/store';
import type {OpenDialogSaveChartConfirmArguments} from 'ui/store/actions/dialog';
import {openDialogSaveChartConfirm} from 'ui/store/actions/dialog';

export function getCustomExportActionWrapperWithSave(
    {
        onApply,
        canBeSaved,
        ...args
    }: {
        onApply: () => void;
        canBeSaved: boolean;
    } & OpenDialogSaveChartConfirmArguments,
    originalAction: MenuItemConfig['action'],
) {
    return (originalActionArgs: ExportActionArgs | AlertsActionArgs) => {
        return confirmSaveChart(
            {
                onApply,
                canBeSaved,
                ...args,
            },
            () => originalAction(originalActionArgs),
        );
    };
}

export async function confirmSaveChart<T = void>(
    {
        onApply,
        canBeSaved,
        ...args
    }: {
        onApply: () => void;
        canBeSaved: boolean;
    } & OpenDialogSaveChartConfirmArguments,
    cb: () => T,
) {
    return new Promise((resolve) => {
        if (canBeSaved) {
            openDialogSaveChartConfirm({
                onApply: async () => {
                    await onApply();
                    resolve(cb());
                },
                ...args,
            })(getStore().dispatch);
        } else {
            resolve(cb());
        }
    });
}
