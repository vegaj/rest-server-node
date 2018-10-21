const jwt = require('jsonwebtoken')

const cte = require('../config/constants')

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

        if (!req.user) {
            return resp.status(400).json({ ok: false, err: 'malformed token' })
        }

        next();
    })
}

function forActiveUsersOnly(req, resp, next) {

    let user = req.user;
    if (!user) {
        return resp.status(401).json({ ok: false, err: 'log in first' })
    }

    console.log(`User input ${user}`)
    if (user.status) {
        return next()
    } else {
        return resp.status(403).json({ ok: false, err: 'this account has been disabled' })
    }
}

function forAdminOnly(req, resp, next) {
    let user = req.user

    if (user.role !== cte.ADMIN) {
        return resp.status(403).json({ ok: false, err: 'forbidden' })
    }

    return next();
}

function ifNotLoggedIn(req, resp, next) {

    let token = req.get('Authorization')

    if (!token) {
        return next()
    }

    return resp.status(404).json({ ok: false, err: 'you are already logged in' })
}

module.exports = {
    verifyJWT,
    ifNotLoggedIn,
    forAdminOnly,
    forActiveUsersOnly
}