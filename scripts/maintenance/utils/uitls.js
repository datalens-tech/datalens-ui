function sleep(time) {
    return new Promise((res) => setTimeout(res, time));
}

module.exports = {
    sleep,
};
