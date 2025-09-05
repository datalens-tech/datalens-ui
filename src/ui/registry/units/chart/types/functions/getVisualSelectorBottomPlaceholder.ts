import type React from 'react';

export type GetVisualSelectorBottomPlaceholder = () => {
    action: () => void;
    text: React.ReactNode;
} | null;
