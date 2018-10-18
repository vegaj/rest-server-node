const express = require('express')
const _ = require('underscore')

const app = express()

const SHOW_DEF = 5;

const User = require('../model/user')
const verifyJWT = require('../middlewares/auth').verifyJWT

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

    body = _.pick(body, ['name', 'email', 'img', 'role', 'google'])
    body.password = digest
    let user = new User(body);

    user.save((err, userDB) => {

        console.log(`error: ${err}.\n\n User: ${userDB}`)
        if (err) {
            res.status(400).json({ ok: false, err })
        } else {
            res.status(200).json({ ok: true, user: userDB })
        }
    })

})

app.put('/user/:id', (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'img'])

    console.log(state)
    User.findOneAndUpdate(id, body, { runValidators: true, new: true }, (err, userDB) => {
        if (err) {
            res.status(400).json({ ok: false, err })
        } else {
            res.json({ ok: true, user: userDB })
        }
    })
})

app.delete('/delete/:id', (req, resp) => {

    let id = req.param.id;

    if (id === undefined) {
        resp.status(404).json({ ok: false, err: 'expected id' })
        return;
    }

    User.findOneAndRemove({ id }, (err, doc) => {
        if (err) {
            resp.status(404).json({ ok: false, err })
        } else {
            resp.status(200).json({ ok: true, deleted: doc })
        }
    })
})

//Not a switch status to active/inactive
app.patch('/user/:id', (req, resp) => {

    let id = req.params.id;
    if (id === undefined) {
        resp.status(404).json({ ok: false, err: 'expected id' })
        return;
    }

    User.findOneAndUpdate(id, { status: false }, { new: true, runValidators: true }, (err, doc) => {
        if (err) {
            resp.status(404).json({ ok: false, err });
        } else {
            resp.json({ ok: true, user: doc })
        }
    })

})

app.get('/user', verifyJWT, (req, resp) => {

    let from;
    let show;
    try {

        from = req.query.from || 0;
        show = req.query.show || SHOW_DEF;
        from = Number.parseInt(from)
        show = Number.parseInt(show)
        if (isNaN(from) || isNaN(show) || from < 0 || show < 0)
            throw new Error('from and show must be positive numbers');
    } catch (err) {

        resp.status(400).json({
            ok: false,
            err: err.message
        });
        return;
    }

    User.find({ status: true }, 'name email status')
        .skip(from)
        .limit(show)
        .exec((err, docs) => {
            if (err) {
                resp.status(400).json({ ok: false, err })
            } else {
                resp.status(200).json({
                    ok: true,
                    from: from,
                    showing: show,
                    elems: docs
                })
            }
        })
})

/* Forma 1
app.put('/user/:id', (req, res) => {
    let body = req.body;
    let id = req.params.id;

    let dq = User.findById(id, (err, result) => {
        if (err) {
            res.status(404).json({ ok: false, err });
            return;
        }

        console.log(result)
        result.name = body.name || result.name;
        result.img = body.img || result.img;

        result.save((err, userDB) => {
            if (err) {
                res.status(400).json({ ok: false, err });
            } else {
                res.status(200).json({ ok: true, userDB })
            }
        });
    })
})
*/


module.exports = app;