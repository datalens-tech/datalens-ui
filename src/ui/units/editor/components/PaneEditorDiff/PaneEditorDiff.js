import React from 'react';

import PropTypes from 'prop-types';

import EditorDiff from '../EditorDiff/EditorDiff';

function PaneEditorDiff({language, original, value, paneSize}) {
    return <EditorDiff language={language} original={original} value={value} size={paneSize} />;
}

PaneEditorDiff.propTypes = {
    language: PropTypes.string.isRequired,
    original: PropTypes.string,
    value: PropTypes.string,
    paneSize: PropTypes.number,
};

export default PaneEditorDiff;
