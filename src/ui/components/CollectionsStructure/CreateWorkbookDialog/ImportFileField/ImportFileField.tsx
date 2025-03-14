import React from 'react';

import {Paperclip} from '@gravity-ui/icons';
import {Button, Flex, Icon, Label, Text, useFileInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './ImportFileField.scss';

const b = block('workbook-dialog-import-file-field');

const i18n = I18n.keyset('component.collections-structure');

type ImportFileFieldProps = {
    onUpload: (file: File) => void;
    onRemove: (index: number) => void;
    files: File[];
    hasError: boolean;
};

export const ImportFileField = ({onUpload, onRemove, files, hasError}: ImportFileFieldProps) => {
    const handleFileUploading = (file: File[]) => {
        onUpload(file[0]);
    };

    const handleRemoveFile = (index: number) => {
        onRemove(index);
    };

    const {triggerProps, controlProps} = useFileInput({onUpdate: handleFileUploading});

    return (
        <Flex spacing={{mt: 3}} className={b()} gap={2} direction="column" alignItems="flex-start">
            <Text variant="body-1">{i18n('label_import-from-file')}</Text>
            <input {...controlProps} accept=".json" />
            <Flex gap={2} width="100%">
                <Button {...triggerProps}>
                    <Icon data={Paperclip} /> {i18n('button_choose-file')}
                </Button>
                {files.map((file, index) => (
                    <Label
                        size="m"
                        theme="clear"
                        key={file.name}
                        onCloseClick={() => handleRemoveFile(index)}
                        type="close"
                        className={b('file-label')}
                        title={file.name}
                    >
                        <Text color="complementary" variant="body-1">
                            {file.name}
                        </Text>
                    </Label>
                ))}
            </Flex>
            {hasError && (
                <Text variant="body-1" color="danger">
                    {i18n('label_error-file-type')}
                </Text>
            )}
        </Flex>
    );
};
