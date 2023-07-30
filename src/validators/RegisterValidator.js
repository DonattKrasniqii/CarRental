const { body, validationResult } = require('express-validator');


//fullname, email, username and password.
const RegisterValidator = [
    body('fullname').exists().withMessage('Full Name is required in order to register'),
    body('password').isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
    body('email').isEmail().withMessage('Invalid email address.').exists().withMessage("Please write your email."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
        next();
    },
];

module.exports = RegisterValidator;