import { createPost, getFeed, getPostById, likePost, commentPost, deletePostHard } from '../services/postService.js';

export async function create(req, res, next) {
  try {
    const post = await createPost(req.user.id, req.body || {});
    res.json({ post });
  } catch (e) { next(e); }
}

export async function feed(req, res, next) {
  try {
    const posts = await getFeed(req.user.id);
    res.json({ posts });
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (e) { next(e); }
}

export async function like(req, res, next) {
  try {
    const liked = await likePost(req.user.id, req.params.id);
    res.json({ liked: !!liked });
  } catch (e) { next(e); }
}

export async function comment(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') return res.status(422).json({ error: 'content required' });
    const c = await commentPost(req.user.id, req.params.id, content);
    res.json({ comment: c });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const ok = await deletePostHard(req.params.id);
    res.json({ deleted: ok });
  } catch (e) { next(e); }
}