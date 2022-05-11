var express = require('express');
var router = express.Router();
var userModel = require('./users')
var postModel = require('./post')
const multer = require('multer')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage })

router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/register',function(req,res){
  var data = new userModel({
    username:req.body.username,
    name:req.body.name,
    email:req.body.email
    }) 
 userModel.register(data,req.body.password)
 .then(function(){
   passport.authenticate('local')(req,res,function(){
     res.redirect('/profile')
   })
 })
})

router.post('/login', passport.authenticate('local', {
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res,next){})

router.get('/profile',isLoggedIn, function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate({
    path:'post',
    populate:{path:'username'}
  })
  .then(function(data){
    res.render('profile',{data})
  })
})

router.post('/createpost',upload.single('image'), function(req,res){
  if (req.file !== undefined){
    userModel.findOne({username:req.session.passport.user})
    .then(function(foundUser){
      postModel.create({
        image:req.file.filename,
        caption:req.body.caption,
        username:foundUser._id
      })
      .then(function(createdPost){
        foundUser.post.push(createdPost)
        foundUser.save()
        .then(function(){
          res.redirect('/profile')
        })
      })
    })
  }
  else{
    res.send("Inputs should not be empty")
  }  
})

router.get('/allpost',isLoggedIn, function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.find()
    .populate({path:'username',populate:{path:'post'}})
    .then(function(allpost){
      res.render('allposts',{allpost})
    })
  })
  
})

router.get('/delete/:id', function (req, res) {
  postModel.findOneAndDelete({ _id: req.params.id })
     .then(function() {
        res.redirect('/profile')
     })
})

router.get('/like/:id', function (req, res) {
   userModel.findOne({ username: req.session.passport.user })
      .then(function (user) {
         postModel.findOne({ _id: req.params.id })
            .then(function (post) {
               if (post.likes.indexOf(user._id) === -1){
                  post.likes.push(user._id);
               }
               else{
                  post.likes.splice(user._id, 1);
               }
               post.save()
                  .then(function () {
                     res.redirect('/profile')
                  })
            })
      })
})

router.get('/update/:id', function (req, res) {
  postModel.findOne({ _id: req.params.id })
     .then(function (data) {
        res.render('update', { data })
     })
})

router.post('/update/:id', function (req, res) {
  var temp = {
     image: req.file.filename,
     caption: req.body.caption
  }
  postModel.findOneAndUpdate({ _id: req.params.id }, temp)
     .then(function (alldata) {
        res.render('profile',{alldata})
     })
})

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/')
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
     return next()
  }
  else {
     res.redirect('/')
  }
}

module.exports = router;
