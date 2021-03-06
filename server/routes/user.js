const express = require('express')
const _ = require('underscore')

const app = express()

const SHOW_DEF = 5;

const User = require('../model/user')
const auth = require('../middlewares/auth')
const bcrypt = require('bcryptjs')

app.post('/user', auth.ifNotLoggedIn, (req, res) => {


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
        if (err) {
            res.status(400).json({ ok: false, err })
        } else {
            res.status(200).json({ ok: true, user: userDB })
        }
    });

})

//Modify the user itself.
app.put('/user/', [auth.verifyJWT, auth.forActiveUsersOnly], (req, res) => {

    let id = req.user.id;
    let body = _.pick(req.body, ['name', 'img', 'email'])

    User.findOneAndUpdate({ _id: id }, body, { runValidators: true, new: true }, (err, userDB) => {
        if (err) {
            res.status(400).json({ ok: false, err })
        } else {
            console.log(`User output ${userDB}`)
            res.json({ ok: true, user: userDB })
        }
    })
})


//Hard deletion
app.delete('/delete/:id', [auth.verifyJWT, auth.forActiveUsersOnly, auth.forAdminOnly], (req, resp) => {

    let id = req.params.id;
    if (id === undefined) {
        resp.status(404).json({ ok: false, err: 'expected id' })
        return;
    }

    User.findOneAndRemove({ _id: id }, (err, doc) => {
        if (err) {
            resp.status(404).json({ ok: false, err })
        } else {
            resp.status(200).json({ ok: true, deleted: doc })
        }
    })
})

//Not a switch status to active/inactive
app.patch('/user/:id', [auth.verifyJWT, auth.forActiveUsersOnly, auth.forAdminOnly], (req, resp) => {

    let id = req.params.id;
    let status = req.body.status;

    if (id === undefined) {
        resp.status(404).json({ ok: false, err: 'expected id' })
        return;
    }

    if (status === undefined) {
        return resp.status(400).json({ ok: false, err: 'specify the new status for the user (enabled = true / disabled = false)' })
    }

    User.findOneAndUpdate({ _id: id }, { status }, { new: true, runValidators: true }, (err, doc) => {
        if (err) {
            resp.status(404).json({ ok: false, err });
        } else {
            resp.json({ ok: true, user: doc })
        }
    })

})


//Get information from a certain user searched by name
app.get('/user', [auth.verifyJWT, auth.forActiveUsersOnly], (req, resp) => {

    let searchTerm = req.query.email;

    if (searchTerm === undefined) {
        return searchByID(req.user.id, resp)
    }

    if (!searchTerm) {
        console.log('On Get: /user. user._id field missing!');
        return resp.status(400).json({ ok: false, err: 'bad request' });
    }
    searchByEmail(searchTerm, resp);
});

const searchByEmail = (email, resp) => {
    User.findOne({ email }, 'email name img role', (err, userDB) => {
        if (err) {
            console.log(`On Get: /user. ${err}`)
            return resp.status(500).json({ ok: false, err: 'service unavailable. Try again later.' });
        }

        if (!userDB) {
            return resp.status(404).json({ ok: false, err: 'not found' });
        }

        resp.json({ ok: true, user: userDB })
    });
}

const searchByID = (id, resp) => {
    User.findOne({ _id: id }, 'email name img role', (err, userDB) => {

        if (err) {
            console.log(`On Get: /user. ${err}`)
            return resp.status(500).json({ ok: false, err: 'service unavailable. Try again later.' });
        }

        if (!userDB) {
            return resp.status(404).json({ ok: false, err: 'not found' });
        }

        return resp.json({ ok: true, user: userDB })
    })
}


app.get('/users', [auth.verifyJWT, auth.forActiveUsersOnly], (req, resp) => {

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

    User.find({ status: true }, 'name img email status')
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


module.exports = app;