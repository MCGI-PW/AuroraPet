const { Router } = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { notFound } = require('../errors');

/** Caixa de notificações do usuário autenticado. */
const router = Router();
router.use(requireAuth);

const mine = (req) => db.collection('notifications').filter((n) => n.userId === req.auth.uid);

router.get('/', (req, res) => {
  res.json(mine(req).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

router.put('/read-all', (req, res) => {
  mine(req).forEach((n) => (n.read = true));
  db.save();
  res.json({ success: true });
});

router.put('/:id/read', (req, res) => {
  const notification = mine(req).find((n) => n.id === req.params.id);
  if (!notification) throw notFound('Notificação não encontrada.');
  notification.read = true;
  db.save();
  res.json(notification);
});

module.exports = router;
