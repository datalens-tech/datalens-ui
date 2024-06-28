import React, { useEffect } from 'react';

import {Dialog, Table, Checkbox} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import DialogManager from '../DialogManager/DialogManager';
import { WorkbookId } from 'shared';
import Utils from '../../utils/utils';

export interface DialogAssignClaimsProps {
    entryId: string | null;
    workbookId: WorkbookId;
    onClose: () => void;
}


const b = block('dl-dialog-need-reset');

export const DIALOG_ASSIGN_CLAIMS = Symbol('DIALOG_ASSIGN_CLAIMS');

export type OpenDialogAssignClaimsArgs = {
    id: typeof DIALOG_ASSIGN_CLAIMS;
    props?: DialogAssignClaimsProps;
};
function DialogAssignClaims(props: DialogAssignClaimsProps) {
    const [accesses, setAccesses] = React.useState<any>([]);

    const {
        onClose,
        entryId,
        workbookId
    } = props;
    const itemId = entryId || workbookId;

    useEffect(()=>{
        Utils.getRoles({}).then(_roles=>{
            Utils.getAccesses({id: itemId}).then(_accesses=>{
                for (var i = 0; i < _roles.length; i++) {
                    const role = _roles[i];
                    const accessFiltered = _accesses.filter((item:any)=>item.role_id == role.role_id)
                    _roles[i].add = false;
                    _roles[i].delete = false;
                    _roles[i].select = false;
                    _roles[i].update = false;

                    accessFiltered.forEach((access:any) => {
                        if (access.add) _roles[i].add = true;
                        if (access.delete) _roles[i].delete = true;
                        if (access.select) _roles[i].select = true;
                        if (access.update) _roles[i].update = true;
                    });
                }
                setAccesses(_roles.sort((a:any, b:any)=> a.weight - b.weight));
            });
        })
        
    }, [itemId]);

    function onApply () {
        const requests: Array<Promise<any>> = [];

        accesses.forEach((item: any) => {
            // const recordRequests = [];
            // const isDestroy = !item.select && !item.add && !item.update && !item.delete;
            // recordRequests.push(Utils.setAccesses({
            //     "id": itemId,
            //     "role_id": item.role_id,
            //     "select": false,
            //     "add": false,
            //     "update": false,
            //     "delete": false,
            //     "destroy": true,
            // }));
            // if (!isDestroy) {
            requests.push(Utils.setAccesses({
                "id": itemId,
                "role_id": item.role_id,
                "select": item.select,
                "add": item.add,
                "update": item.update,
                "delete": item.delete,
                "destroy": true//isDestroy
            }));
            // }
            // requests.push(Promise.all(recordRequests));
        });

        Promise.all(requests).then(() => onClose());
    }

    function onChange(index: number, name: string) {
        return (e: any) => {
            accesses[index][name] = e.target.checked;
            setAccesses([...accesses])
        }
    }

    const columns = [
        {id: 'description', name: "Роль"}, 
        {id: 'select', name: "Чтение", template: (item: any, index: number) => <Checkbox onChange={onChange(index, "select")} defaultChecked={item.select} size="l" />},
        {id: 'add', name: "Добавление", template: (item: any, index: number) => <Checkbox onChange={onChange(index, "add")} defaultChecked={item.add} size="l" />},
        {id: 'update', name: "Обновление", template: (item: any, index: number) => <Checkbox onChange={onChange(index, "update")} defaultChecked={item.update} size="l" />},
        {id: 'delete', name: "Удаление", template: (item: any, index: number) => <Checkbox onChange={onChange(index, "delete")} defaultChecked={item.delete} size="l" />},
    ];


    return (
        <Dialog
            onClose={onClose}
            hasCloseButton={false}
            open={true}
            disableEscapeKeyDown={true}
            disableOutsideClick={true}
            className={b()}
        >
            <Dialog.Header caption={"Назначение прав"} />
            <Dialog.Body className={b('content')}>
                <Table data={accesses} columns={columns} />
            </Dialog.Body>
            <Dialog.Footer
                preset={'default'}
                showError={false}
                listenKeyEnter={false}
                textButtonCancel='Отмена'
                onClickButtonCancel={onClose}
                textButtonApply='Сохранить'
                onClickButtonApply={onApply}
                loading={false}
            ></Dialog.Footer>
        </Dialog>
    );
}

DialogManager.registerDialog(DIALOG_ASSIGN_CLAIMS, DialogAssignClaims);
