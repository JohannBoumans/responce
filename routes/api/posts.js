const express = require('express');
const {check, validationResult} = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');

//@route POST api/posts
//@desc Create post route
//@access Private
router.post('/',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty()

    ]
  ],
 async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }

  try{
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });

    const post = await newPost.save();

    res.json(post)
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }

});

//@route GET api/posts
//@desc GET all posts
//@access Private
router.get('/', auth, async (req, res) => {
  try{
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
});

//@route GET api/posts/:id
//@desc GET posts by id
//@access Private

router.get('/:id', auth, async (req, res) => {
  try{
    const posts = await Post.findById(req.params.id);
    if(!posts){
      return res.status(404).json({msg: 'Post not Found'});
    }

    res.json(posts);
  }catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg: 'Post not Found'});
    }
    res.status(500).send('Server Error')
  }
});

//@route DELETE api/posts/:id
//@desc DELETE post
//@access Private

router.delete('/:id', auth, async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);

    if(!post){
      return res.status(404).json({msg: 'Post not Found'});
    }
    // Check user
    if(post.user.toString() !== req.user.id){
      return res.status(401).json({msg: 'User not authorized'})
    }
    await post.remove();

    res.json({msg: 'Post removed'});
  }catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg: 'Post not Found'});
    }
    res.status(500).send('Server Error')
  }
});

//@route PUT api/posts/like/:id
//@desc Like a post
//@access Private

router.put('/like/:id', auth, async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);

    //Check if the post has already been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
      return res.status(400).json({msg: 'Post already liked'})
    }

    post.likes.unshift({user: req.user.id});

    await post.save();

    res.json(post.likes)
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//@route PUT api/posts/unlike/:id
//@desc Unlike a post
//@access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    //Check if the post has already been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
      return res.status(400).json({msg: 'Post has not yet been liked'})
    }

    //get remove index
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes)
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route POST api/posts/comment/:id
//@desc ADD a comment
//@access Private
router.post('/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty()

    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }

    try{
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      post.comments.unshift(newComment);
      post.save();

      res.json(post.comments);
    }catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error')
    }

  });


//@route POST api/posts/comment/:id/:comment_id
//@desc Delete a comment
//@access Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    //pull out commment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    // make sure comment exists
    if(!comment){
      return res.status(404).json({msg: 'Comment does not exist'});
    }
    // check user
    if(comment.user.toString() !== req.user.id){
      return res.status(404).json({msg: 'User not authorized'});
    }
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;