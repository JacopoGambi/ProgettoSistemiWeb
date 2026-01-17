import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
  res.send('Chat server is active');
});

export default router;