import type {ExportActionArgs} from 'ui/libs/DatalensChartkit/components/ChartKitBase/components/Header/components/Menu/Items/Export/types';
import type {MenuItemConfig} from 'ui/libs/DatalensChartkit/menu/Menu';
import type {AlertsActionArgs} from 'ui/libs/DatalensChartkit/types/menu';
import {getStore} from 'ui/store';
import {openDialogSaveChartConfirm} from 'ui/store/actions/dialog';

export function getCustomExportActionWrapperWithSave(
    {
        message,
        onApply,
        canBeSaved,
    }: {
        message: string;
        onApply: () => void;
        canBeSaved: boolean;
    },
    originalAction: MenuItemConfig['action'],
) {
    return (originalActionArgs: ExportActionArgs | AlertsActionArgs) => {
        return confirmSaveChart(
            {
                message,
                onApply,
                canBeSaved,
            },
            () => originalAction(originalActionArgs),
        );
    };
}

export async function confirmSaveChart<T = void>(
    {
        message,
        onApply,
        canBeSaved,
    }: {
        message: string;
        onApply: () => void;
        canBeSaved: boolean;
    },
    cb: () => T,
) {
    return new Promise((resolve) => {
        if (canBeSaved) {
            openDialogSaveChartConfirm({
                onApply: async () => {
                    await onApply();
                    resolve(cb());
                },
                message,
            })(getStore().dispatch);
        } else {
            resolve(cb());
        }
    });
}
