const createUuidV4 = require('uuid').v4;

const uuid = {
    create: () => {
        return createUuidV4().replace(/-/g, '');
    },
};

module.exports = uuid;