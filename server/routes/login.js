const express = require('express');
const _ = require('underscore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const app = express();
const User = require('../model/user')

const auth = require('../middlewares/auth')

app.post('/login', auth.ifNotLoggedIn, (req, resp) => {

    let body = _.pick(req.body, ['password', 'email']);
    if (undefined === body.password || undefined === body.email) {
        resp.status(400).json({ ok: false, err: { message: 'email and password required' } })
        return;
    }

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            console.log(`Internal -> ${err}`)
            resp.status(500).json({ ok: false, err: 'Internal Server Error' })
            return;
        }

        if (!userDB) {
            resp.status(401).json({ ok: false, err: 'invalid email or password' })
            return;
        }

        bcrypt.compare(body.password, userDB.password)
            .then(ok => {

                if (!ok) {
                    resp.status(401).json({ ok: false, err: 'invalid email or password' })
                    return;
                }

                if (!userDB.status) {
                    return resp.status(403).json({
                        ok: false,
                        err: 'this account has been disabled'
                    })
                }

                let payload = { user: { id: userDB._id, email: userDB.email, img: userDB.img, role: userDB.role, google: userDB.google } };
                let token = jwt.sign(payload,
                    process.env.SEED, {
                        jwtid: 'node-server-auth',
                        expiresIn: '1h',
                        subject: JSON.stringify(userDB._id),
                    })


                resp.json({
                    ok: true,
                    user: userDB.name,
                    token
                })
            })
            .catch(err => {
                console.log(`Internal ${err}`);
                resp.status(500).json({ ok: false, err: 'Internal Server Error' })
            })
    })
});

module.exports = app;