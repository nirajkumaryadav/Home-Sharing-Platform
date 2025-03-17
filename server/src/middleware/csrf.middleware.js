const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const csrfProtection = csrf({ 
    cookie: { 
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    } 
});

module.exports = {
    cookieParser,
    csrfProtection
};