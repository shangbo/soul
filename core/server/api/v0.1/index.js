const shared = require('../shared');
const localUtils = require('../v2/utils');

module.exports = {
    get http() {
        return shared.http;
    },
    get configuration(){
        return shared.pipeline(require('./configuration'), localUtils);
    }
};
