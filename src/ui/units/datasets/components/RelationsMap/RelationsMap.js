import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _differenceWith from 'lodash/differenceWith';
import _flow from 'lodash/flow';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _noop from 'lodash/noop';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {AvatarQA} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import {JOIN_TYPES_ICONS, SVG_NAMESPACE_URI} from '../../constants';
import Avatar from '../Avatar/Avatar';
import {withDragging, withDropping} from '../hoc/AvatarDnD';

import './RelationsMap.scss';

const b = block('relations-map');
const i18n = I18n.keyset('dataset.sources-tab.modify');
const AvatarDnD = _flow(withDropping, withDragging)(Avatar);
const CONTAINER_PADDING = 24;

const EmptyPlaceholder = () => {
    return (
        <div className={b('placeholder')}>
            <PlaceholderIllustration
                description={i18n('label_sources-map-placeholder')}
                name="template"
            />
        </div>
    );
};

function SubTree(props) {
    const {directChildren} = props;

    if (!directChildren.length) {
        return null;
    }

    return (
        <div className={b('sub-tree')}>
            {directChildren.map((directChild, index) => {
                return <TreeLevel {...props} key={`tree-level-${index}`} avatar={directChild} />;
            })}
        </div>
    );
}

function TreeLevel(props) {
    const {avatar, getDirectChildren} = props;

    const directChildren = getDirectChildren(avatar);

    return (
        <div className={b('tree-level')}>
            <AvatarDnD {...props} key={'root-avatar'} isActive={true} />
            <SubTree {...props} directChildren={directChildren} />
        </div>
    );
}

function SVGCanvas(props) {
    const {forwardedRef, width, height} = props;

    return (
        <svg
            ref={forwardedRef}
            data-qa={AvatarQA.RelationsMapCanvas}
            className={b('svg-canvas')}
            xmlns="http://www.w3.org/2000/svg"
            width={width || '100%'}
            height={height || '100%'}
        />
    );
}

const SVGCanvasWithRef = React.forwardRef((props, ref) => {
    return <SVGCanvas {...props} forwardedRef={ref} />;
});

SVGCanvasWithRef.displayName = SVGCanvas.name;

function Avatars(props) {
    const {root} = props;

    if (!root) {
        return null;
    }

    return <TreeLevel {...props} avatar={root} />;
}

class RelationsMap extends React.Component {
    state = {
        // During the first rendering, _treeLevelRef.current === null, which does not allow the container width to be calculated correctly.
        // In this regard, if there is a horizontal scroll, all links that are not included in the viewport are not drawn.
        treeLevelMounted: false,
    };

    componentDidMount() {
        this.displayRelations();
        this.setState({treeLevelMounted: true});
    }

    componentDidUpdate(prevProps) {
        if (this.isNecessaryRerenderRelations(prevProps)) {
            this.clearSVGCanvas();
            this.displayRelations();
        }
    }

    _svgCanvasRef = React.createRef();
    _treeLevelRef = React.createRef();

    get svgCanvasElement() {
        return this._svgCanvasRef.current;
    }

    get relationsMap() {
        return this._svgCanvasRef.current;
    }

    get treeLevelRect() {
        const width = this._treeLevelRef.current?.getBoundingClientRect().width;
        const scrollHeight = this._treeLevelRef.current?.scrollHeight;
        const height = scrollHeight ? scrollHeight + CONTAINER_PADDING : undefined;

        return {width, height};
    }

    get isEmptyMap() {
        const {avatars} = this.props;

        return avatars.length === 0;
    }

    get rootSource() {
        const {avatars} = this.props;

        return avatars.find(({is_root: isRoot}) => isRoot);
    }

    isNecessaryRerenderRelations(prevProps) {
        const {relations: relationsPrev, relationsErrors: relationsErrorsPrev} = prevProps;
        const {relations, relationsErrors} = this.props;

        if (
            relationsPrev.length !== relations.length ||
            relationsErrorsPrev.length !== relationsErrors.length
        ) {
            return true;
        }

        if (!this.isEqualRelations(relations, relationsPrev)) {
            return true;
        }

        return false;
    }

    isEqualRelations = (relations, relationsPrev) => {
        return _isEmpty(_differenceWith(relations, relationsPrev, _isEqual));
    };

    getAvatarRect = (avatarId) => {
        const avatarNode = document.getElementById(avatarId);

        return avatarNode ? avatarNode.getBoundingClientRect() : null;
    };

    drawLine = ({width, height, x1, y1, x2, y2}, lineParams) => {
        const {stroke, strokeWidth, strokeDasharray} = lineParams;
        const svgLine = document.createElementNS(SVG_NAMESPACE_URI, 'path');

        let path;

        if (y1 === y2) {
            path = `
                M ${x1} ${y1}
                L ${x2} ${y2}
            `;
        } else {
            const startX = x1 - width * 0.5,
                startY = y1 + height * 0.5,
                verticalLineLength = y2 - y1 - height * 0.5,
                horizontalLineLength = x2 - startX;

            path = `
                M ${startX} ${startY}
                M ${startX} ${startY}
                v ${verticalLineLength}
                h ${horizontalLineLength}
            `;
        }

        svgLine.setAttributeNS(null, 'd', path);
        svgLine.setAttributeNS(null, 'class', b('line'));
        svgLine.setAttributeNS(null, 'fill', 'none');
        svgLine.setAttributeNS(null, 'stroke', stroke);
        svgLine.setAttributeNS(null, 'stroke-width', strokeWidth);
        svgLine.setAttributeNS(null, 'stroke-dasharray', strokeDasharray);

        this.svgCanvasElement.appendChild(svgLine);
    };

    setIconPosition = (iconContainer, {x1, y1, x2, y2}) => {
        const iconWidth = 42,
            iconHeight = 24;
        let x, y;

        if (y1 === y2) {
            x = (x2 - x1) * 0.5 + x1 - iconWidth * 0.5;
            y = y2 - iconHeight * 0.5;
        } else {
            x = (x2 - x1) * 0.5 + x1 - iconWidth * 0.5;
            y = y2 - iconHeight * 0.5;
        }

        iconContainer.setAttributeNS(null, 'transform', `translate(${x}, ${y})`);
    };

    drawJoinIcon = ({x1, y1, x2, y2}, lineType, {onClickJoinIcon, joinType}) => {
        const {iconData: JoinIcon} = JOIN_TYPES_ICONS[joinType];

        if (JoinIcon && React.isValidElement(<JoinIcon />)) {
            const iconContainer = document.createElementNS(SVG_NAMESPACE_URI, 'g');
            iconContainer.setAttributeNS(null, 'class', b('join', {error: lineType === 'error'}));
            this.setIconPosition(iconContainer, {x1, y1, x2, y2});
            iconContainer.addEventListener('click', onClickJoinIcon, false);

            ReactDOM.render(<JoinIcon />, iconContainer);

            this.svgCanvasElement.appendChild(iconContainer);
        }
    };

    calculatePoints = (leftElement, rightElement) => {
        const {right: leftPointX1, top: leftPointY1, height, width} = leftElement;
        const {left: rightPointX2, top: rightPointY2} = rightElement;
        const {top: topOffset, left: leftOffset} = this.relationsMap.getBoundingClientRect();

        return {
            width,
            height,
            x1: leftPointX1 - leftOffset,
            x2: rightPointX2 - leftOffset,
            y1: leftPointY1 - topOffset + height * 0.5,
            y2: rightPointY2 - topOffset + height * 0.5,
        };
    };

    isRelationWithError = (relation) => {
        const {id: relationId} = relation;
        const {relationsErrors} = this.props;

        return Boolean(relationsErrors.find(({id}) => id === relationId));
    };

    getLineParams = (params) => {
        const {type = 'normal'} = params;

        switch (type) {
            case 'error':
                return {
                    stroke: 'var(--ds-color-error)',
                    strokeWidth: 2,
                    strokeDasharray: '4 2',
                };
            case 'normal':
            default:
                return {
                    stroke: 'var(--ds-color-avatar)',
                    strokeWidth: 2,
                    strokeDasharray: '0',
                };
        }
    };

    displayRelation = (relation) => {
        const {openRelationDialog} = this.props;
        const {
            id: relationId,
            left_avatar_id: leftAvatarId,
            right_avatar_id: rightAvatarId,
            join_type: joinType,
        } = relation;

        const leftElement = this.getAvatarRect(leftAvatarId);
        const rightElement = this.getAvatarRect(rightAvatarId);

        if (leftElement && rightElement) {
            const calculationsPoints = this.calculatePoints(leftElement, rightElement);

            const isRelationWithError = this.isRelationWithError(relation);
            const lineType = isRelationWithError ? 'error' : 'normal';

            const lineParams = this.getLineParams({type: lineType});

            const onClickJoinIcon = () =>
                this.props.readonly ? _noop : openRelationDialog({relationId});

            this.drawLine(calculationsPoints, lineParams);
            this.drawJoinIcon(calculationsPoints, lineType, {onClickJoinIcon, joinType});
        }
    };

    displayRelations = () => {
        const {relations} = this.props;

        relations.forEach(this.displayRelation);
    };

    getDirectChildren = (parentSource) => {
        const {id: parentSourceId} = parentSource;
        const {avatars, relations} = this.props;

        const directChildrenIds = relations
            .filter(({left_avatar_id: leftAvatarId}) => leftAvatarId === parentSourceId)
            .map(({right_avatar_id: rightAvatarId}) => rightAvatarId);

        return avatars.filter(({id}) => directChildrenIds.includes(id));
    };

    clearSVGCanvas = () => {
        while (this.svgCanvasElement.lastChild) {
            this.svgCanvasElement.removeChild(this.svgCanvasElement.lastChild);
        }
    };

    onDrop = (...data) => {
        const {onDrop} = this.props;

        onDrop(...data);
    };

    onDeleteAvatar = (...data) => {
        const {onDeleteAvatar} = this.props;

        onDeleteAvatar(...data);
    };

    render() {
        const {drop, replaceSource, isOver, isDisabledDropSource, readonly} = this.props;
        const avatar = this.rootSource;
        const {width, height} = this.treeLevelRect;

        return (
            <div
                ref={drop}
                id={b()}
                className={b({
                    over: isOver && !isDisabledDropSource,
                })}
                data-qa="ds-relations-map"
            >
                <div
                    ref={this._treeLevelRef}
                    data-qa={AvatarQA.RelationsMapContainer}
                    className={b('container', {empty: this.isEmptyMap})}
                >
                    {this.isEmptyMap ? (
                        <EmptyPlaceholder />
                    ) : (
                        <Avatars
                            readonly={readonly}
                            isDisplayReplaceSourceZone={isOver}
                            root={avatar}
                            onDrop={this.onDrop}
                            onDeleteAvatar={this.onDeleteAvatar}
                            getDirectChildren={this.getDirectChildren}
                            replaceSource={replaceSource}
                        />
                    )}
                </div>
                <SVGCanvasWithRef ref={this._svgCanvasRef} width={width} height={height} />
            </div>
        );
    }
}

SVGCanvas.propTypes = {
    forwardedRef: PropTypes.shape({
        current: PropTypes.instanceOf(Element),
    }).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
};

TreeLevel.propTypes = {
    onDrop: PropTypes.func.isRequired,
    onDeleteAvatar: PropTypes.func.isRequired,
    getDirectChildren: PropTypes.func.isRequired,
    avatar: PropTypes.object.isRequired,
};
TreeLevel.defaultProps = {
    directChildren: [],
};

SubTree.propTypes = {
    onDrop: PropTypes.func.isRequired,
    onDeleteAvatar: PropTypes.func.isRequired,
    getDirectChildren: PropTypes.func.isRequired,
    directChildren: PropTypes.array,
};

Avatars.propTypes = {
    onDrop: PropTypes.func.isRequired,
    onDeleteAvatar: PropTypes.func.isRequired,
    getDirectChildren: PropTypes.func.isRequired,
    root: PropTypes.object.isRequired,
};

RelationsMap.propTypes = {
    relations: PropTypes.array.isRequired,
    relationsErrors: PropTypes.array.isRequired,
    avatars: PropTypes.array.isRequired,
    onDrop: PropTypes.func.isRequired,
    onDeleteAvatar: PropTypes.func.isRequired,
    replaceSource: PropTypes.func.isRequired,
    openRelationDialog: PropTypes.func.isRequired,
    drop: PropTypes.func,
    isOver: PropTypes.bool,
    isDisabledDropSource: PropTypes.bool.isRequired,
    readonly: PropTypes.bool,
};

RelationsMap.defaultProps = {
    relations: [],
    avatars: [],
};

export default withDropping(RelationsMap);
