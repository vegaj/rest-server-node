require('./config/config')

console.log(`Starting server in ${process.env.NODE_ENV} mode.`)

const express = require('express')
const mongoose = require('mongoose');
const path = require('path')

const app = express()
const bodyParser = require('body-parser')

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

//habilitar public
app.use(express.static(path.resolve(__dirname, '../public')));

app.use(require('./routes/routes'));

const port = process.env.PORT || 3000;


mongoose.connect(process.env.URL_DB, { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('Connected to database.');
})


app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})