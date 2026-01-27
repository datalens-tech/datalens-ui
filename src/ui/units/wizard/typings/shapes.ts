import type {ValueOf} from 'shared';

import type {LINE_CAPS, LINE_JOINS} from '../constants/shapes';

export type LineCap = ValueOf<typeof LINE_CAPS>;
export type LineJoin = ValueOf<typeof LINE_JOINS>;
