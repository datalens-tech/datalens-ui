import sortBy from 'lodash/sortBy';

import type {ServerField, ServerPlaceholder} from '../../../../../../../../../shared';
import {AxisLabelFormatMode, isHtmlField} from '../../../../../../../../../shared';
import {wrapHtml} from '../../../../../../../../../shared/utils/ui-sandbox';
import type {AxisOptions} from '../../../../types';
import {applyPlaceholderSettingsToAxis} from '../../../../utils/axis-helpers';
import {getAxisFormattingByField} from '../axis/getAxisFormattingByField';

import type {SegmentsMap} from './types';

const DEFAULT_SPACE_BETWEEN_SEGMENTS = 4;

export const getSegmentsYAxis = (args: {
    segment?: ServerField;
    segmentsMap: SegmentsMap;
    placeholders: {y?: ServerPlaceholder; y2?: ServerPlaceholder};
    visualizationId: string;
}): {yAxisSettings: AxisOptions[]; yAxisFormattings: any[]} => {
    const {segment, segmentsMap, placeholders, visualizationId} = args;
    const segments = sortBy(Object.values(segmentsMap), (s) => s.index);
    const isHtmlSegment = isHtmlField(segment);

    const segmentsNumber = segments.filter((s) => !s.isOpposite).length;
    const takenSpaceBetweenSegments = DEFAULT_SPACE_BETWEEN_SEGMENTS * (segmentsNumber - 1);
    const freeSpaceForSegments = 100 - takenSpaceBetweenSegments;
    const segmentsSpace = Math.floor(freeSpaceForSegments / segmentsNumber);

    let leftAxisSegment = -1;
    let rightAxisSegment = -1;

    const yAxis = new Array(segments.length);
    const yAxisFormattings = new Array(segments.length);

    segments.forEach((segment) => {
        const isY2Axis = segment.isOpposite;
        const yAxisIndex = segment.index;

        let segmentIndex;

        if (isY2Axis) {
            rightAxisSegment += 1;
            segmentIndex = rightAxisSegment;
        } else {
            leftAxisSegment += 1;
            segmentIndex = leftAxisSegment;
        }

        const segmentTitle = isHtmlSegment ? wrapHtml(segment.title) : String(segment.title);

        const axis: AxisOptions = {
            top: `${DEFAULT_SPACE_BETWEEN_SEGMENTS * segmentIndex + segmentsSpace * segmentIndex}%`,
            height: `${segmentsSpace}%`,
            offset: 0,
            lineWidth: 1,
            gridLineWidth: 1,
            opposite: isY2Axis,
            title: isY2Axis
                ? undefined
                : {
                      text: segmentTitle,
                      useHTML: isHtmlSegment,
                      align: 'middle',
                      textAlign: 'center',
                      offset: 120,
                      rotation: 0,
                      style: {
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          width: 120,
                      },
                  },
        };

        const placeholder = isY2Axis ? placeholders.y2 : placeholders.y;

        applyPlaceholderSettingsToAxis(placeholder, axis, {title: true});

        yAxis[yAxisIndex] = axis;
        if (placeholder && placeholder.settings?.axisFormatMode === AxisLabelFormatMode.ByField) {
            yAxisFormattings[yAxisIndex] = getAxisFormattingByField(placeholder, visualizationId);
        }
    });

    return {yAxisSettings: yAxis, yAxisFormattings};
};
