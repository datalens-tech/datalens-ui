import {z} from 'zod';

export const keyOrWorkbookIdNameSchema = z
    .object({
        key: z.string().optional(),
        workbookId: z.string().optional(),
        name: z.string().optional(),
    })
    .refine(
        (data) => {
            const {key, workbookId, name} = data;

            const isKeyProvided = key !== undefined;
            const isWorkbookIdProvided = workbookId !== undefined;
            const isNameProvided = name !== undefined;

            if (isKeyProvided && !isWorkbookIdProvided && !isNameProvided) {
                return true;
            }

            if (!isKeyProvided && isWorkbookIdProvided && isNameProvided) {
                return true;
            }

            return false;
        },
        {
            message:
                "For folder entries provide only 'key', for workbook entries provide only 'workbookId' and 'name' together.",
        },
    );
