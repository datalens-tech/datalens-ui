import type {MenuItemConfig} from 'ui/libs/DatalensChartkit/menu/Menu';
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
    return (...originalActionArgs: any) => {
        return new Promise((resolve) => {
            if (canBeSaved) {
                openDialogSaveChartConfirm({
                    onApply: async () => {
                        await onApply();
                        resolve(originalAction(originalActionArgs[0]));
                    },
                    message,
                })(getStore().dispatch);
            } else {
                resolve(originalAction(originalActionArgs[0]));
            }
        });
    };
}
