const approot = require('app-root-path');
const TAG = __filename.slice(__dirname.length + 1, -3);
const logger = require(`${approot}/config/winston`)(TAG);
const User = require(`${approot}/models/User`);
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const config = require(`${approot}/config/config`);
const errorBuilder = require(`${approot}/controllers/utils/error_response_builder`);
const passwordValidator = require(`${approot}/utils/users/validators/password_validator`);

module.exports = async (req, res, next) => {
    try {
        logger.setId(req.id);

        const response = {};

        if (!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password')) {
            return next(errorBuilder('Missing username/password', 400));
        }

        const password = req.body.password;
        const username = req.body.username.toLowerCase();

        // Validate password
        if (!passwordValidator.test(password)) {
            return next(errorBuilder('Invalid password', 400));
        }

        const hashed_password = await argon2.hash(password);

        const token_key = randomstring.generate(config.app.token_key_length);

        const user = new User({
            username,
            token_key,
            password: hashed_password,
            last_login_at: new Date(),
        });

        await user.save();

        logger.verbose(`Created user ${username}`);
        response.data = jwt.sign({username, token_key}, config.secret, {expiresIn: '3h'});
        res.status(201)
            .send(response);
    } catch (err) {
        return next(err);
    }
};
