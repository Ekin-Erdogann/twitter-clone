import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import { createPost ,deletePost,likeUnlikePost,commentOnPost,getPosts,getLikes,getFollowingPosts,getUserPosts} from '../controllers/postController.js';

const router= express.Router();
router.get('/all',protectedRoute,getPosts);
router.get('/following',protectedRoute,getFollowingPosts);
router.get('/likes/:id',protectedRoute,getLikes);
router.get('/user/:username',protectedRoute,getUserPosts);
router.post('/create',protectedRoute,createPost);
router.post('/like/:id',protectedRoute,likeUnlikePost);
router.post('/comment/:id',protectedRoute,commentOnPost);
router.delete('/:id',protectedRoute,deletePost);

export default router;
