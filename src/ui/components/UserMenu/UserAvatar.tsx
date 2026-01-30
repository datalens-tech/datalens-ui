import React from 'react';

import type {AvatarProps} from '@gravity-ui/uikit';
import {Avatar} from '@gravity-ui/uikit';

import avatar from '../../assets/icons/avatar-middle.png';

type Props = Omit<AvatarProps, 'imgUrl'>;

export const UserAvatar = (props: Props) => <Avatar imgUrl={avatar} {...props} />;
