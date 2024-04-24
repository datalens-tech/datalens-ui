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

    console.log(itemId);
    useEffect(()=>{
        Utils.getRoles({}).then(_roles=>{
            Utils.getAccesses({id: itemId}).then(_accesses=>{
                for (var i = 0; i < _roles.length; i++) {
                    const role = _roles[i];
                    const access = _accesses.find((item:any)=>item.role_id == role.role_id)
                    if (access) {
                        _roles[i].add = access.add;
                        _roles[i].delete = access.delete;
                        _roles[i].select = access.select;
                        _roles[i].update = access.update;
                    } else {
                        _roles[i].add = false;
                        _roles[i].delete = false;
                        _roles[i].select = false;
                        _roles[i].update = false;
                    }
                }
                setAccesses(_roles.sort((a:any, b:any)=> a.weight - b.weight));
            });
        })
        //{dl: propsData.id, role_id: propsData.role_id, select: propsData.select, add: propsData.add, update: propsData.update, delete: propsData.delete, destroy: propsData.destroy}
        
    }, [itemId]);

    function onApply () {
        // accesses.forEach((item: any) => {
        //     Utils.setAccesses({
        //         "id": itemId,
        //         "role_id": item.role_id,
        //         "select": item.select,
        //         "add": item.add,
        //         "update": item.update,
        //         "delete": item.delete
        //     });
        // }); 
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
