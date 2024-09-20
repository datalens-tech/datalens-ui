import type {MenuItemConfig} from 'ui/libs/DatalensChartkit/menu/Menu';
import {getStore} from 'ui/store';
import {openDialogSaveChartConfirm} from 'ui/store/actions/dialog';

export function getCustomExportActionWrapperWithSave(
    this: any,
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
                        resolve(originalAction.apply(this, originalActionArgs));
                    },
                    message,
                })(getStore().dispatch);
            } else {
                resolve(originalAction.apply(this, originalActionArgs));
            }
        });
    };
}
