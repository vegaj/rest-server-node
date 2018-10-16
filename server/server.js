require('./config/config')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ msg: "Hello, World!!" })
})

app.post('/', (req, res) => {

    let body = req.body;

    if (body.name === undefined) {
        res.status(400).json({ ok: false, err: 'name required' })
    } else {
        res.json({
            body
        });
    }
})


app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})