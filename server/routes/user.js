const express = require('express')
const app = express()

const User = require('../model/user')

app.get('/', (req, res) => {
    res.json({ msg: "Hello, World!!" })
})

const bcrypt = require('bcryptjs')

app.post('/user', (req, res) => {

    let body = req.body;
    let digest
    try {
        digest = bcrypt.hashSync(body.password, 10)
    } catch (e) {
        res.status(400).json({ ok: false, error: 'password required' })
    }

    let user = new User({
        name: body.name,
        email: body.email,
        password: digest,
        role: body.role
    });

    user.save((err, userDB) => {

        console.log(`error: ${err}.\n\n User: ${userDB}`)
        if (err) {
            res.status(400).json({ ok: false, err })
        } else {
            res.status(200).json({ ok: true, user: userDB })
        }
    })

})

module.exports = app