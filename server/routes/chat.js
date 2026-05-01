const router = require('express').Router();
const auth   = require('../middleware/auth');
const { history, get, send, remove, pin, clearAll } = require('../controllers/chatController');

router.use(auth);
router.get('/history', history);
router.post('/message', send);
router.delete('/all', clearAll);
router.patch('/:id/pin', pin);
router.get('/:id', get);
router.delete('/:id', remove);

module.exports = router;
