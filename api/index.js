const express = require('express')
const cors = require('cors')
const  mongoose  = require('mongoose')
const User = require('./models/user/User')
const app = express()
require('dotenv').config()
const bcrypt = require('bcryptjs')
const  jwt  = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3300;

const salt= bcrypt.genSaltSync(10);
const secret = 'randomSecret'

app.use(cors({credentials: true, origin:'http://127.0.0.1:5173' }))
app.use(express.json())
app.use(cookieParser())


mongoose.connect(process.env.MONGOOSE_URL)
.then(() => {
    console.log('Connected to MongoDB Atlas!')
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!')
    console.error(error)
  })

  app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body
      const userDoc = await User.create({ username, password: bcrypt.hashSync(password, salt) })
      res.json(userDoc)
    } catch (error) {
      console.error(error)
      res.status(500).send('An error occurred while creating the user.')
    }
  })

  app.post('/login', async (req, res) => {
      const { username, password } = req.body
      const userDoc = await User.findOne({ username })
      const passOk = bcrypt.compareSync(password, userDoc?.password)
      if(passOk){
        //logged in 
        jwt.sign({username, id: userDoc._id},secret, {}, (err, token)=>{
          if(err) throw err;           
          res.cookie('token', token, { sameSite: 'none', secure: true }).json('ok');
          // console.log(token)
        } )
      }else{
      res.status(500).json('An error occurred while creating the user.')
      }
    })

app.get('/profile', (req, res)=>{
  const {token} = req.cookies  //JWT Token with us  ername and id tha we can read only if we have the secret  
  jwt.verify(token, secret, {}, (err, info)=>{
    if(err) throw err;
    res.json(info)
  })
  // console.log(req.cookies, 'profile cookie')
})

app.post('/logout', (req, res)=>{
  res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok')
})

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}.` )
})