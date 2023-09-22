import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import Preview from '../../components/Preview/Preview';
import {setChartLoadedData} from '../../store/actions';
import {getChart} from '../../store/reducers/editor/editor';

const mapStateToProps = createStructuredSelector({
    chartData: getChart,
});

const mapDispatchToProps = {
    onLoadData: setChartLoadedData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Preview);
