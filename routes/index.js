var express = require('express');
var router = express.Router();

/* import models and mongoose*/
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/*  

RESTFUL ROUTES

The plan -

With our backend models in place, it's now time to open some routes 
that the frontend client can interact with. 
The following are a list of actions a user can perform:

a) View all posts
b) Add a new post
c) upvote a post
d) view comments associated with a post
e) add a comment
f) upvote a comment

The actions map directly to several routes, which are described as follows:

GET /posts - return a list of posts and associated metadata
POST /posts - create a new post
GET /posts/:id - return an individual post with associated comments
PUT /posts/:id/upvote - upvote a post, notice we use the post ID in the URL
POST /posts/:id/comments - add a new comment to a post by ID
PUT /posts/:id/comments/:id/upvote - upvote a comment

*/


// READ
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }
    res.json(posts);
  });
});

//CREATE
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }
    res.json(post);
  });
});

//FIND A POST BY ID - need this for :POST
//Create a route for preloading post objects in routes/index.js:
//Use param when loading ID
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

//READ post by id 

/*Because the post object was retrieved using the middleware 
function and attached to the req object, 
all our request handler has to do is 
return the JSON back to the client.*/
//GET-POSTS WITH COMMENTS
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

//POST-CREATE COMMENTS
//Create comments route for a particular post:
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express -- BITCH!' });
});

module.exports = router;
