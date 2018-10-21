const express = require('express');
const _ = require('underscore');

const auth = require('../middlewares/auth');
const Product = require('../model/product');
const cte = require('../config/constants')

const app = express();



//====================
// Get all products with pagination
//====================
app.get('/product', auth.verifyJWT, (req, resp) => {

    let from = Number.parseInt(req.query.from);
    let show = Number.parseInt(req.query.show);

    from = isNaN(from) ? 0 : from;
    show = isNaN(show) ? cte.DEF_PAGE : show;

    Product.find({})
        .skip(from)
        .limit(show)
        .populate('user', 'name')
        .populate('category', 'name')
        .exec((err, products) => {


            if (err) {
                console.log(`GET /product encountered ${err}`)
                return resp.status(500).json({ ok: false, err: 'Internal Server Error' })
            }

            return resp.json({ ok: true, products });
        });
});


//====================
// Create a new product
//====================
app.post('/product', auth.verifyJWT, (req, resp) => {
    let body = req.body;

    let user = req.user;
    if (!user) {
        console.log(`POST: /product required a user wich couldn't be found.`)
        return resp.status(500).json({ ok: false, err: 'Internal Server Error' })
    }

    let prod = new Product();
    prod.name = body.name;
    prod.description = body.description;
    prod.unitPrice = body.unitPrice;
    prod.category = body.category;
    prod.user = user.id;

    prod.save((err, proDB) => {
        if (err) {
            resp.status(500).json({ ok: false, err });
        } else {
            resp.json({ ok: true, product: proDB });
        }
    });
});

///====================
// Alter an existing product
//====================
app.put('/product/:id', auth.verifyJWT, (req, resp) => {

    let id = req.params.id;
    if (!id) {
        return resp.status(400).json({ ok: false, err: 'provide a product id' })
    }

    let body = _.pick(req.body, ['name', 'description', 'unitPrice', 'category'])

    Product.findOneAndUpdate({ _id: id }, body, { runValidators: true, new: true },
        (err, proDB) => {
            if (err) {
                console.log(`Internal ${err}`);
                return resp.status(400).json({ ok: false, err });
            }

            if (!proDB) {
                return resp.status(404).json({ ok: false, err: 'not found' })
            }

            return resp.json({ ok: true, product: proDB })
        });

});

//====================
// Soft delete an existing product
//====================



//====================
// Get one product by id
//====================


module.exports = app;