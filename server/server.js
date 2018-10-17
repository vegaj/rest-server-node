require('./config/config')

const express = require('express')
const mongoose = require('mongoose');

const app = express()
const bodyParser = require('body-parser')

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

app.use(require('./routes/user'))

const port = process.env.PORT || 3000;


mongoose.connect("mongodb://localhost:27017/node-tuto", { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('Connected to database.');
})


app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})