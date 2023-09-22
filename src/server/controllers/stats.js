const getTime = () => new Date().toISOString().replace('T', ' ').split('.')[0];

module.exports = async (req, res) => {
    try {
        req.ctx.log('ChartKit stats collect', {rowsCount: req.body.length});

        req.body.forEach((data) => {
            req.ctx.stats('chartKitStats', {
                datetime: getTime(),
                ...data,
            });
        });

        return res.status(200).send({status: 'success', rowsCount: req.body.length});
    } catch (error) {
        req.ctx.logError('ChartKit stats collect failed', error);

        return res.status(500).send({status: 'error', message: error.message, requestId: req.id});
    }
};
