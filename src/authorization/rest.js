import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import { SECRET } from '~/env';

import { User } from './document';

const router = Router();

// router.post('/register', (req, res, next) => {
//   const { name, email, password } = req.body;
//   const user = new User(req.body);
// });

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }, (err, user) => {
    if (!user) next(err);

    user.validPassword(password, (passwordError, isMatch) => {
      if (!isMatch) next(passwordError);

      const token = jwt.sign({ user }, SECRET);
      res.json({ token });
    });
  });
});

router.get('/users', (req, res, next) => {
  User.find({}, (err, docs) => {
    if (err) next(err);
    res.json(docs);
  });
});

router.get('/users/count', (req, res, next) => {
  User.count((err, count) => {
    if (err) next(err);
    res.json(count);
  });
});

router.get('/user/:id', (req, res, next) => {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) next(err);
    res.json(user);
  });
});

router.put('/user/:id', (req, res, next) => {
  User.findOneAndUpdate({ _id: req.params.id }, req.body, (err) => {
    if (err) next(err);
    res.json({ message: 'Updated' });
  });
});

router.delete('/user/:id', (req, res, next) => {
  User.findOneAndRemove({ _id: req.params.id }, (err) => {
    if (err) next(err);
    res.json({ message: 'Deleted' });
  });
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

router.get('/auth/twitter', passport.authenticate('twitter', { scope: ['include_email=true'] }));
router.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

export default router;
