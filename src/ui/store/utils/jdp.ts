import type {DiffContext as JDPDiffContext} from 'jsondiffpatch';
import {create as jdpCreate} from 'jsondiffpatch';

// Plugin for jsondiffpatch to diff functions by its' references
const functionDiffFilter = (context: any) => {
    if (typeof context.left === 'function') {
        if (typeof context.right === 'function') {
            if (context.left === context.right) {
                context.setResult(undefined);
            } else {
                context.setResult([context.left, context.right]);
            }
        } else {
            context.setResult([context.left, context.right]);
        }

        context.exit();
    } else if (typeof context.right === 'function') {
        context.setResult([context.left, context.right]).exit();
    }
};

functionDiffFilter.filterName = 'function';

export interface CreateJDPOptions {
    pathIgnoreList: string[];
}

export const createJDP = ({pathIgnoreList}: CreateJDPOptions) => {
    const jdp = jdpCreate({
        propertyFilter: function (name: string, ctx: JDPDiffContext) {
            const propertyPath = `${getPath(ctx)}/${name}`;

            return !pathIgnoreList.includes(propertyPath);
        },
    });

    jdp.processor.pipes.diff.before('trivial', functionDiffFilter);

    return jdp;
};

const getPath = (ctx: JDPDiffContext): string => {
    if (ctx && ctx.parent) {
        return `${getPath(ctx.parent)}/${ctx.childName}`;
    } else {
        return `${ctx.childName || ''}`;
    }
};
