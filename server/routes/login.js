const express = require('express');
const _ = require('underscore');
const bcrypt = require('bcryptjs');

const app = express();
const User = require('../model/user')


app.post('/login', (req, resp) => {

    let body = _.pick(req.body, ['password', 'email']);
    if (undefined === body.password || undefined === body.email) {
        resp.status(400).json({ ok: false, err: { message: 'email and password required' } })
        return;
    }

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            console.log(`Internal ${err}`)
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

                resp.json({
                    ok: true,
                    user: userDB.name,
                    token: '123'
                })
            })
            .catch(err => {
                console.log(`Internal ${err}`);
                resp.status(500).json({ ok: false, err: 'Internal Server Error' })
            })
    })
});

module.exports = app;