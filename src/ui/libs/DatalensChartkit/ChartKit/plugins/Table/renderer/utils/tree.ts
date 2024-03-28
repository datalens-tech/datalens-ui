import type {StringParams, TableCommonCell} from 'shared';

function isSubarray(main: string[], sub: string[]) {
    return (
        main.length >= sub.length &&
        sub.every((_, subIndex) => {
            return main[subIndex] === sub[subIndex];
        })
    );
}

export function getUpdatesTreeState(args: {cell: TableCommonCell; params: StringParams}) {
    const {cell, params} = args;
    const treeNode = cell.treeNode;

    if (!treeNode) {
        return null;
    }

    const treeState: string[] = ([] as string[]).concat(params.treeState).filter(Boolean);

    if (treeState.some((state) => state === treeNode)) {
        const cellTreeNode: string[] = JSON.parse(treeNode);
        const treeStateNodes = treeState.map((jsonArray) => JSON.parse(jsonArray));
        treeStateNodes.forEach((item, index) => {
            if (isSubarray(item, cellTreeNode)) {
                treeState.splice(index, 1, '');
            }
        });
    } else {
        treeState.push(treeNode);
    }

    return treeState.filter(Boolean);
}
