import type React from 'react';

import type {UserProfile} from 'shared/schema/auth/types/users';

export type GetAdditionalProfileSections = (
    userProfile: UserProfile,
) => {title: string; section: React.ReactNode}[];
