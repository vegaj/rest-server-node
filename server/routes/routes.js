const express = require('express');
const app = express();

app.use(require('./login'));
app.use(require('./user'));
app.use(require('./signin'))
app.use(require('./category'))

module.exports = app;