import type {MarkupItem} from '../../../../../../shared';

export type MarkupUserInfoProps = {
    userId: string;
    content: MarkupItem['user_info'];
    onRender?: () => void;
};
