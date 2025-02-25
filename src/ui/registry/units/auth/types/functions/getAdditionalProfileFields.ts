import type React from 'react';

import type {UserProfile} from 'shared/schema/auth/types/users';

export type GetAdditionalProfileFields = (
    userProfile: UserProfile,
) => {name: string; value: React.ReactNode}[];
