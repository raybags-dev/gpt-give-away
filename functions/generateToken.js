const token = require("crypto").randomBytes(64).toString('hex');

module.exports = {
    GenToken: () => {
        const secretToken = token;
        return secretToken;
    }
}