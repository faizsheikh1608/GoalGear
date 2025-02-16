const express = require('express');
const userAuth = require('../middleware/userAuth');

const profileRouter = express.Router();


profileRouter.get('/profile/view',userAuth,async (req,res) => {
  try{
    const user = req.user;
    res.json(user)
  }catch(err){
    res.status(400).send(err.message)
  }
})



module.exports = profileRouter;