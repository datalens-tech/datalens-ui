import sortBy from 'lodash/sortBy';

import {AxisLabelFormatMode, isHtmlField} from '../../../../../../../../../shared';
import type {ServerField, ServerPlaceholder} from '../../../../../../../../../shared';
import {wrapHtml} from '../../../../../../../../../shared/utils/ui-sandbox';
import type {AxisOptions} from '../../../../types';
import {applyPlaceholderSettingsToAxis} from '../../../../utils/axis-helpers';
import {addAxisFormatter, getAxisFormatting} from '../../../helpers/axis';

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
        const placeholder = isY2Axis ? placeholders.y2 : placeholders.y;

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

        applyPlaceholderSettingsToAxis(placeholder, axis, {title: true});
        addAxisFormatter({
            axisConfig: axis,
            placeholder: placeholder,
        });
        yAxis[yAxisIndex] = axis;

        const formatMode = placeholder?.settings?.axisFormatMode;
        if (formatMode && formatMode !== AxisLabelFormatMode.Auto) {
            yAxisFormattings[yAxisIndex] = getAxisFormatting(placeholder, visualizationId);
        }
    });

    return {yAxisSettings: yAxis, yAxisFormattings};
};
