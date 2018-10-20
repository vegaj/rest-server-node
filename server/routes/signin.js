const express = require('express');
const auth = require('../middlewares/auth');
const { hasValidGoogleToken } = require('../middlewares/google');
const User = require('../model/user');
const cte = require('../config/constants');
const jwt = require('jsonwebtoken');

const _ = require('underscore');


const app = express();


app.post('/google', [auth.ifNotLoggedIn, hasValidGoogleToken], (req, resp) => {

    let oauthInfo = req.oauthInfo;
    if (!oauthInfo) {
        console.log('POST /google expected oauthInfo set from middleware.');
        return resp.status(500).json({ ok: false, err: 'Internal Server Error' });
    }

    User.findOne({ email: oauthInfo.email }, (err, userDB) => {

        if (err) {
            console.log(`Error finding user by email: ${err}`);
            return resp.status(500).json({ ok: false, err: 'Internal Server Error' });
        }


        if (!userDB) { //That email has not been used before.
            let userInfo = {
                google: true,
                name: oauthInfo.name,
                email: oauthInfo.email,
                img: oauthInfo.img,
                status: true,
                role: cte.USER,
                password: 'not-required-with-oauth',
            }
            return registerUser(userInfo, resp)
        }


        //If the user is meant to use the google sign in
        if (userDB.google) {
            let payload = { user: { id: userDB._id, email: userDB.email, img: userDB.img, role: userDB.role, google: userDB.google } };
            let token = jwt.sign(payload,
                process.env.SEED, {
                    jwtid: 'node-server-auth',
                    expiresIn: '1h',
                    subject: JSON.stringify(userDB._id),
                })

            resp.json({
                ok: true,
                user: _.pick(userDB, ['name', 'email', 'img']),
                token
            });
        } else {
            resp.status(401).json({
                ok: false,
                err: {
                    message: `${userDB.email} must use the default login.`
                }
            })
        }
    })
});


const registerUser = (userInfo, resp) => {

    let user = new User(userInfo)
    user.save((err, userDB) => {
        if (err) {
            resp.status(400).json({ ok: false, err })
        } else {
            resp.status(200).json({ ok: true, user: userDB, justRegistered: true, })
        }
    })
}


/**
app.post('/google2', [auth.ifNotLoggedIn, verifyGoogleToken], (req, resp) => {

    let data = req.oauthInfo;

    let user = new User()
    user.email = data.email;
    user.name = data.email;
    user.google = data.google;
    user.img = data.picture;
    user.password = 'signed-by-google' //The password is not required

    user.save((err, userDB) => {
        if (err) {
            res.status(400).json({ ok: false, err })
        } else {
            res.status(200).json({ ok: true, user: userDB })
        }
    })

});
*/
module.exports = app;