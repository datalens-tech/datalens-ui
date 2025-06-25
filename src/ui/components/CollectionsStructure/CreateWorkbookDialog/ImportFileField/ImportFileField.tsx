import React from 'react';

import {Paperclip} from '@gravity-ui/icons';
import {Button, Flex, HelpMark, Icon, Label, Text, useFileInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {InterpolatedText} from 'ui/components/InterpolatedText/InterpolatedText';
import {helpMarkDefaultProps} from 'ui/constants';
import {formDocsEndpointDL} from 'ui/utils';

import './ImportFileField.scss';

const b = block('workbook-dialog-import-file-field');

const i18n = I18n.keyset('component.collections-structure');

type ImportFileFieldProps = {
    onUpload: (file: File) => void;
    onRemove: (index: number | 'publicGallery') => void;
    files: File[];
    error: string | null;
    publicGalleryFile?: string;
};

const FileLabel: React.FC<{filename: string; handler: () => unknown}> = ({filename, handler}) => {
    return (
        <Label
            size="m"
            theme="clear"
            onCloseClick={handler}
            type="close"
            className={b('file-label')}
            title={filename}
        >
            <Text color="complementary" variant="body-1">
                {filename}
            </Text>
        </Label>
    );
};

export const ImportFileField = ({
    onUpload,
    onRemove,
    files,
    error,
    publicGalleryFile,
}: ImportFileFieldProps) => {
    const handleFileUploading = (file: File[]) => {
        onUpload(file[0]);
    };

    const handleRemoveFile = (index: number | 'publicGallery') => {
        onRemove(index);
    };

    const {triggerProps, controlProps} = useFileInput({onUpdate: handleFileUploading});

    const docsUrl = formDocsEndpointDL('/workbooks-collections/export-and-import');

    return (
        <Flex spacing={{mt: 3}} className={b()} gap={2} direction="column" alignItems="flex-start">
            <Flex gap={1}>
                <Text variant="body-1">{i18n('label_import-from-file')}</Text>
                <HelpMark {...helpMarkDefaultProps}>
                    <InterpolatedText
                        href={docsUrl}
                        disableLink={!docsUrl}
                        text={i18n('label_help-import-hint')}
                    />
                </HelpMark>
            </Flex>
            <input {...controlProps} accept=".json" />
            <Flex gap={2} width="100%">
                <Button {...triggerProps}>
                    <Icon data={Paperclip} /> {i18n('button_choose-file')}
                </Button>
                {files.map((file, index) => (
                    <FileLabel
                        key={file.name}
                        filename={file.name}
                        handler={() => handleRemoveFile(index)}
                    />
                ))}
                {publicGalleryFile && (
                    <FileLabel
                        filename={publicGalleryFile}
                        handler={() => handleRemoveFile('publicGallery')}
                    />
                )}
            </Flex>
            {error && (
                <Text variant="body-1" color="danger">
                    {error}
                </Text>
            )}
        </Flex>
    );
};
