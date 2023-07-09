const User = require('../models/user');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (user) => {
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET);
}

const login = asyncHandler(
    async (req, res) => {
        const user = await User.findOne({username : req.body.username}).exec();
        
        if (user === null){
            res.status(403).json({
                err : ["User not found"]
            });
            return;
        }

        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result){
                const accessToken = generateAccessToken(user);
                res.json({
                    accessToken

                })
            }else {
                res.status(403).json({
                    err : ["Password does not match"]
                });
            }
        });
    }
)

const register = [
    body('username')
    .trim()
    .isLength({min : 3, max : 30})
    .withMessage("Username should be within 3 and 30 characters"),
    body('password')
    .isLength({min : 8, max : 128})
    .withMessage("Password should be within 8 and 128 characters"),
    asyncHandler(
        async (req, res) => {
            const error = validationResult(req);

            if (!error.isEmpty()){
                res.status(403).json({
                    err : [error.array().map(i => i.msg)]
                })
                return;
            }

            const user = await User.findOne({username : req.body.username}).exec();

            if (user !== null){
                res.status(403).json({
                    err : ["Username is unavailable"]
                })
                return;
            }

            bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT), async (err, hashed) => {
                const newUser = new User({
                    username : req.body.username,
                    password : hashed,
                })
                await newUser.save();
                res.json({
                    msg : "Successfully registered"
                });
            });
        }
    )
]


const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }else{
            req.user = authData.user;
            next();
        }
      });
    } else {
      res.sendStatus(403);
    }
}

module.exports = {
    login,
    register,
    verifyToken
}