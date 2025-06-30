import React from 'react';

import {Label, Popover, useResizeObserver} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';
import {Link as RouterLink} from 'react-router-dom';

import {block, galleryI18n, getCategoryLabelTitle} from '../../utils';

import './GalleryCardLabels.scss';

const b = block('card-labels');
const GAP = 6;

interface GalleryCardLabelsProps {
    getUrl?: (label: string) => string;
    id?: string;
    labels?: string[];
    labelProps?: LabelProps;
}

interface SpecialLabelProps {
    hiddenCount: number;
    visibleCount: number;
    children?: React.ReactNode;
}

function SpecialLabel(props: SpecialLabelProps) {
    const {hiddenCount, visibleCount, children} = props;

    return (
        <Popover content={<div className={b('popover')}>{children}</div>}>
            <Label size="s" theme="unknown">
                {visibleCount === 0 && hiddenCount > 0
                    ? galleryI18n('label_card-labels-collapsed', {count: hiddenCount})
                    : galleryI18n('label_card-labels-more', {count: hiddenCount})}
            </Label>
        </Popover>
    );
}

export function GalleryCardLabels({getUrl, id, labels = [], labelProps}: GalleryCardLabelsProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = React.useState(labels.length);

    const recalculate = React.useCallback(() => {
        if (!containerRef.current || !measureRef.current) {
            return;
        }

        const containerWidth = containerRef.current.offsetWidth;
        const labelNodes = Array.from(measureRef.current.children) as HTMLDivElement[];

        if (labelNodes.length === 0) {
            setVisibleCount(0);
            return;
        }

        // Check if all labels fit without More
        let total = 0;

        for (let i = 0; i < labelNodes.length - 1; i++) {
            const node = labelNodes[i];
            const width = node.offsetWidth;
            if (i > 0) {
                total += GAP;
            }
            total += width;
        }

        if (total <= containerWidth) {
            setVisibleCount(labelNodes.length - 1);
            return;
        }

        // If not all fit, reserve space for More and recalculate
        const moreNode = labelNodes[labelNodes.length - 1];
        const moreWidth = moreNode.offsetWidth;

        total = 0;
        let count = 0;

        for (let i = 0; i < labelNodes.length - 1; i++) {
            const node = labelNodes[i];
            const width = node.offsetWidth;

            if (i > 0) {
                total += GAP;
            }

            // +GAP between the last visible label and More
            if (total + width + GAP + moreWidth > containerWidth) {
                break;
            }

            total += width;
            count++;
        }

        // If not a single label + More fits, show only More
        if (count === 0 && moreWidth <= containerWidth) {
            setVisibleCount(0);
        } else {
            setVisibleCount(count);
        }
    }, []);

    useResizeObserver({
        ref: containerRef,
        onResize: recalculate,
    });

    React.useLayoutEffect(() => {
        recalculate();
    }, [labels, recalculate]);

    const hiddenCount = labels.length - visibleCount;
    const allRenderedLabels = labels.map((label, index) => {
        const key = `${id}-${label}-${index}`;
        const labelNode = (
            <Label size="s" theme="clear" key={getUrl ? undefined : key} {...labelProps}>
                {getCategoryLabelTitle(label)}
            </Label>
        );

        return getUrl ? (
            <RouterLink to={getUrl(label)} key={key}>
                {labelNode}
            </RouterLink>
        ) : (
            labelNode
        );
    });
    const visibleLabels = allRenderedLabels.slice(0, visibleCount);
    const hiddenLabels = allRenderedLabels.slice(visibleCount);

    return (
        <React.Fragment>
            {/* Hidden container for measuring label widths */}
            <div className={b('hidden')} ref={measureRef}>
                {allRenderedLabels}
                <SpecialLabel hiddenCount={hiddenCount} visibleCount={visibleCount} />
            </div>
            <div className={b()} ref={containerRef} style={{display: 'flex', gap: GAP}}>
                {visibleLabels}
                {hiddenCount > 0 && (
                    <SpecialLabel hiddenCount={hiddenCount} visibleCount={visibleCount}>
                        {hiddenLabels}
                    </SpecialLabel>
                )}
            </div>
        </React.Fragment>
    );
}
