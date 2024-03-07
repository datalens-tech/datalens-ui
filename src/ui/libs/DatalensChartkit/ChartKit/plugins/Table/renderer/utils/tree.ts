import {StringParams, TableCommonCell} from 'shared';

function isSubarray(master: string[], sub: string[]) {
    return (
        master.length >= sub.length &&
        sub.every((_, subIndex) => {
            return master[subIndex] === sub[subIndex];
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
        // const subarrayIndexes: number[] = [];

        treeStateNodes.forEach((item: string[], index) => {
            if (isSubarray(item, cellTreeNode)) {
                treeState.splice(index, 1, '');
                // subarrayIndexes.unshift(index);
            }
        });

        // subarrayIndexes.forEach((index) => {
        //     treeState.splice(index, 1);
        // });
    } else {
        treeState.push(treeNode);
    }

    return treeState.filter(Boolean);
}
