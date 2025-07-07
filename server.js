
const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

app.use(express.json());

const loadData = (filename) => {
  if (!fs.existsSync(filename)) fs.writeFileSync(filename, '[]');
  return JSON.parse(fs.readFileSync(filename));
};

const saveData = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};

app.post('/add-post', (req, res) => {
  const { type, text, imageUrl, videoUrl, voiceUrl, userId } = req.body;
  const posts = loadData('./data/posts.json');
  const newPost = {
    postId: uuidv4(),
    userId: userId || uuidv4(),
    type,
    text: text || '',
    imageUrl: imageUrl || '',
    videoUrl: videoUrl || '',
    voiceUrl: voiceUrl || '',
    timestamp: new Date().toISOString(),
    likeCount: 0,
    dislikeCount: 0,
    saveCount: 0,
    reportCount: 0
  };
  posts.push(newPost);
  saveData('./data/posts.json', posts);
  res.json({ success: true, post: newPost });
});

app.get('/get-posts', (req, res) => {
  const posts = loadData('./data/posts.json');
  res.json(posts);
});

app.post('/post-action', (req, res) => {
  const { postId, action } = req.body;
  const posts = loadData('./data/posts.json');
  const post = posts.find(p => p.postId === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (action === 'like') post.likeCount++;
  else if (action === 'dislike') post.dislikeCount++;
  else if (action === 'save') post.saveCount++;
  else if (action === 'report') post.reportCount++;

  saveData('./data/posts.json', posts);
  res.json({ success: true, updatedPost: post });
});

app.post('/view-ad', (req, res) => {
  const { adId } = req.body;
  const ads = loadData('./data/ads.json');
  let ad = ads.find(a => a.adId === adId);

  if (!ad) {
    ad = { adId, views: 1 };
    ads.push(ad);
  } else {
    ad.views++;
  }

  saveData('./data/ads.json', ads);
  res.json({ success: true, ad });
});

app.get('/get-ads', (req, res) => {
  const ads = loadData('./data/ads.json');
  res.json(ads);
});

app.listen(PORT, () => {
  console.log(`✅ API started at http://localhost:${PORT}`);
});
