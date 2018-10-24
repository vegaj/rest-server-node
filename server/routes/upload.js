const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs')

const { verifyJWT } = require('../middlewares/auth');
const cte = require('../config/constants')
const User = require('../model/user')

const app = express();

const ROOT = process.env.WAREHOUSE_DIR;

const EXTENSIONS = ['jpg', 'png', 'ico', 'gif', 'PNG', 'JPEG', 'jpeg', ];
const TYPES = ['user', 'product'];


app.use(fileUpload({
    limits: {
        fileSize: cte.FILE_SIZE,
    },
    safeFileNames: true,
    preserveExtension: true,
    abortOnLimit: true,
}));

app.post('/upload/:type', verifyJWT, (req, resp) => {

    //===========================================
    //  Validate params
    //===========================================

    let type = req.params.type;

    if (!type)
        return resp.status(400).json({ ok: false, err: 'type is required' })

    if (TYPES.indexOf(type) < 0) {
        return resp.status(400).json({
            ok: false,
            err: {
                message: 'invalid type',
                hint: `valid types are ${TYPES.join(', ')}`
            }
        });
    }

    //===========================================
    //  Validate the file
    //===========================================

    if (!req.files || req.files.length === 0)
        return resp.status(400).json({ ok: false, err: 'no input files' });

    let inputFile = req.files.input;
    let res = isValidFile(inputFile);
    if (!res.ok) {
        return resp.status(res.code).json({ ok: false, err: res.err })
    }

    if (type === 'user') {
        res = uploadUserImage(inputFile, { user: req.user, basename: res.hashName, extension: res.extension }, resp);
    } else if (type === 'product') {
        return resp.status(500).json({ ok: false, msg: 'not implemented' });
    } else {
        console.log(`Invalid state: type was expected to be ${TYPES.join(', ')} but found ${type}`);
        return resp.status(500).json({ ok: false, err: 'internal server error' });
    }
});

const isValidFile = (file) => {
    let splittedName = file.name.split('.');

    if (splittedName.length < 2) {
        return { ok: false, err: 'file extension could not be retrieved', code: 400 };
    }

    let extension = splittedName[splittedName.length - 1];
    if (EXTENSIONS.indexOf(extension) < 0) {
        return { ok: false, err: 'file extension invalid', code: 400 };
    }

    return {
        ok: true,
        hashName: file.md5(),
        extension,
    }
}

function uploadUserImage(file, opt, resp) {

    let id = opt.user.id;

    if (opt.user === undefined) {
        return resp.status(500).json({ ok: false, err: 'user missing' });
    }


    let newpath = `${opt.basename}-${opt.user.id}-${new Date().getMilliseconds()}.${opt.extension}`
    newpath = path.join('assets', 'user', newpath);

    file.mv(path.join(ROOT, newpath), err => {
        if (err)
            return resp.status(500).json({ ok: false, err, code: 500 });

        User.findOneAndUpdate({ _id: id }, { img: useUnixSeparator(newpath) }, (err, userDB) => {

            let fullPath = path.join(ROOT, userDB.img || "none");
            //let fullPath = path.join(userDB.img || "none");
            console.log(fullPath)
            if (err) {
                deleteFile(fullPath);
                return resp.status(500).json({ ok: false, err });
            }

            if (!userDB) {
                deleteFile(fullPath);
                return resp.status(400).json({ ok: false, err: 'not found' });
            }

            if (userDB.img) {
                deleteFile(fullPath);
            }

            resp.json({ ok: true, msg: 'image updated' });
        })
    })
}

function useUnixSeparator(path) {
    let x = path;
    let y = undefined;
    while (x !== y) {
        y = x
        x = String(x).replace('\\', '/')
    }
    return x;
}

function deleteFile(filepath) {

    fs.exists(filepath, exists => {

        if (exists) {
            fs.unlink(filepath,
                err => err && console.log(`Error deleting ${filepath} - ${err}`)
            )
        }
    });

}
module.exports = app;