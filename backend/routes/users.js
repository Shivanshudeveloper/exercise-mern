const router = require('express').Router();
const User = require('../models/User_Model');

const User_Model = require("../models/Users");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

// Bringing the auth token
const auth = require("../middleware/auth");


router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err))
});

router.route('/add').post((req, res) => {
    const username = req.body.username;
  
    const newUser = new User({username});
  
    newUser.save()
      .then(() => res.json('User added!'))
      .catch(err => res.status(400).json('Error: ' + err));
});

// For Restering a User
router.route('/register').post((req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg:'Please enter all fields' });
    } 
    // Check the User exist
    User_Model.findOne({ email })
        .then(user => {
            if (user) res.status(400).json({ msg: 'User already Exist' });

            const newUser = new User_Model({
                name,
                email, 
                password
            });

            // Create a salt & hash
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                            jwt.sign(
                                { id: user.id },
                                config.get('jwtSecret'),
                                { expiresIn: 3600 },
                                (err, token) => {
                                    if (err) throw err;
                                    res.json({
                                        token,
                                        user: {
                                            id: user.id,
                                            name: user.name,
                                            email: user.email
                                        }
                                    });
                                }
                            )


                            
                        });
                })
            })
        })
        .catch()
});


// For Login a User
router.route('/login').post((req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg:'Please enter all fields' });
    } 
    // Check the User exist
    User_Model.findOne({ email })
        .then(user => {
            if (!user) res.status(400).json({ msg: 'User Dose Not Exist' });

            // Validatig password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) res.status(400).json({ msg:'Invalid Credentials' });

                    jwt.sign(
                        { id: user.id },
                        config.get('jwtSecret'),
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) throw err;
                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email
                                }
                            });
                        }
                    )
                })
            
        })
        .catch()
});

// Authenticating a User by Session
router.get("/user", auth, (req, res) => {
    User_Model.findById(req.user.id )
        .select('-password')
        .then(user => res.json(user));
});


module.exports = router;