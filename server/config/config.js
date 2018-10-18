//===================================
// Port
//===================================
process.env.PORT = process.env.PORT || 3000

//===================================
// Entorno
//===================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

//==================================
// Database
//==================================
let urlDB;

if (process.env.NODE_ENV == 'dev') {
    urlDB = 'mongodb://localhost:27017/node-tuto'
} else {
    urlDB =
        `mongodb://${process.env.userdb}:${process.env.dbpassword}@ds219983.mlab.com:19983/node-test`
}
process.env.URL_DB = urlDB;

//==================================
// JWT SEED
//==================================
process.env.SEED = process.env.SEED || 'seed-for-development'