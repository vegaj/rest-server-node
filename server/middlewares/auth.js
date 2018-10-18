const jwt = require('jsonwebtoken')


function verifyJWT(req, resp, next) {


    let token = req.get('Authorization')

    if (!token) {
        return resp.status(401).json({ ok: false, err: 'must be authenticated' });
    }

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return resp.status(401).json({ ok: false, err })
        }

        req.user = decoded.user
        next();
    })
}

module.exports = {
    verifyJWT
}