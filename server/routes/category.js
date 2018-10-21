const express = require('express');
const auth = require('../middlewares/auth')
const Category = require('../model/category')

const app = express();


//==============================
//  Get a category
//==============================
app.get('/category/:id', auth.verifyJWT, (req, resp) => {

    let id = req.params.id;

    if (!id) {
        return resp.status(400).json({ ok: false, err: 'provide a category id' });
    }

    Category.findOne({ _id: id }, (err, catDB) => {
        if (err) {
            console.log(`Get /category/${id} - encountered ${err}`)
            return resp.status(500).json({ ok: false, err: 'Internal Server Error' });
        }

        if (!catDB) {
            return resp.status(404).json({ ok: false, err: 'not found' })
        }

        resp.json({ ok: true, category: catDB })
    })


});


//==============================
//  Create new category
//==============================
app.post('/category', auth.verifyJWT, (req, resp) => {

    let user = req.user;
    if (!user) {
        console.log(`POST: /category required a user wich couldn't be found.`)
        return resp.status(500).json({ ok: false, err: 'Internal Server Error' })
    }

    let name = req.body.name;
    if (!name) {
        return resp.status(400).json({ ok: false, err: 'category name is missing' })
    }

    let cat = new Category({
        name,
        user: user.id
    })

    cat.save((err, catDB) => {
        if (err) {
            resp.status(500).json({ ok: false, err });
        } else {
            resp.json({ ok: true, category: catDB })
        }
    });

})


//==============================
//  Edit an existing category
//==============================
app.put('/category/:id', auth.verifyJWT, (req, resp) => {


    let id = req.params.id;
    if (!id) {
        return resp.status(400).json({ ok: true, err: 'provide a category id' })
    }

    let newname = req.params.name;
    if (!newname) {
        return resp.status(400).json({ ok: true, err: 'a new name must be sent' })
    }

    Category.findOneAndUpdate({ _id: id }, { name: newname }, { runValidators: true, new: true }, (err, catDB) => {
        if (err) {
            console.log(`Get /category/${id} - encountered ${err}`)
            return resp.status(500).json({ ok: false, err: 'Internal Server Error' });
        }

        if (!catDB) {
            return resp.status(404).json({ ok: false, err: 'not found' })
        }

        resp.json({ ok: true, category: catDB })
    });

})

//==============================
//  Delete an existing category
//==============================
app.delete('/category/:id', [auth.verifyJWT, auth.forAdminOnly], (req, resp) => {

    let id = req.params.id;

    if (!id) {
        return resp.status(400).json({ ok: true, err: 'provide a category id' })
    }

    Category.findOneAndDelete({ _id: id }, (err, catDB) => {
        if (err) {
            console.log(`Internal ${err}`);
            return resp.status(500).json({ ok: false, err: 'Internal Server Error' });
        }

        if (!catDB) {
            return resp.status(404).json({ ok: false, err: 'not found' })
        }

        return resp.json({ ok: true, category: catDB })
    })
})

//==============================
//  List all the categories
//==============================
app.get('/category', auth.verifyJWT, (req, resp) => {

    Category.find({})
        .sort('name')
        .populate('user', 'name email')
        .exec((err, categories) => {
            if (err) {
                return resp.status(500).json({ ok: false, err })
            }

            categories = categories.length === 0 ? [] : categories;
            return resp.json({ ok: true, categories });
        })
})


module.exports = app;