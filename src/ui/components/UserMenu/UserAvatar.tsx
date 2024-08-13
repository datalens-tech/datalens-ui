import React from 'react';

import type {AvatarProps} from '@gravity-ui/uikit';
import {Avatar} from '@gravity-ui/uikit';

import avatar from '../../assets/icons/avatar-middle.png';

export const UserAvatar = (props: AvatarProps) => <Avatar imgUrl={avatar} {...props} />;
