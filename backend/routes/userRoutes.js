import express from "express";
import User from '../models/User.js';

const router = express.Router();

// signup

router.post('/signup', async(req, res)=> {
  const {name, email, password, isAdmin} = req.body;

  try {
    const user = await User.create({name, email, password, isAdmin});
    res.json(user);
  } catch (e) {
    if(e.code === 11000) return res.status(400).send('Email already exists');
    res.status(400).send(e.message)
  }
})

// login

router.post('/login', async(req, res) => {
  const {email, password} = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    res.json(user)
  } catch (e) {
    res.status(400).send(e.message)
  }
})

// get users;

router.get('/', async(req, res)=> {
  try {
    const users = await User.find({ isAdmin: false }).populate('orders');
    res.json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// get specific user

router.get('/:id', async(req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user)
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get user orders

router.get('/:id/orders', async (req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id).populate('orders');
    res.json(user.orders);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// update user notifications
router.post('/:id/updateNotifications', async(req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    user.notifications.forEach((notif) => {
      notif.status = "read"
    });
    user.markModified('notifications');
    await user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message)
  }
})

// delete user

router.delete('/:id', async(req, res)=> {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    if(!user.isAdmin) return res.status(401).json("You don't have permission");
    await User.findByIdAndDelete(id);
    res.status(200).json("User Deleted");
  } catch (e) {
    res.status(400).send(e.message);
  }
})

export default router;
