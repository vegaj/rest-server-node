const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID);

const verifyGoogleToken = async(idToken) => {

    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,
    })

    const payload = ticket.payload
    return {
        name: payload.name,
        img: payload.picture,
        email: payload.email,
        google: true
    }
}


const hasValidGoogleToken = (req, resp, next) => {

    let token = req.get('OAuthorization')

    if (!token) {
        return resp.status(400).json({ ok: false, err: 'OAuthorization header not found' })
    }

    verifyGoogleToken(token)
        .then(googleIdentity => {
            req.oauthInfo = googleIdentity;
            next()
        })
        .catch(err => {
            return resp.status(401).json({ ok: false, err: { message: err.message } })
        })
}

module.exports = {
    hasValidGoogleToken,
    verifyGoogleToken
}