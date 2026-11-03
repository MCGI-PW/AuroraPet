const { Router } = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { badRequest, notFound } = require('../errors');
const { notifyUser, notifyClinicAdmins } = require('../services/notifications');
const { text } = require('../validation');

/** Solicitações administrativas do veterinário para a administração da clínica. */
const router = Router();
router.use(requireAuth, requireRole('veterinarian', 'clinic_admin'));

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const STATUSES = ['OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'FINISHED'];
const FINAL_STATUSES = ['APPROVED', 'REJECTED', 'FINISHED'];
const STATUS_LABEL = { IN_REVIEW: 'em análise', APPROVED: 'aprovada', REJECTED: 'recusada', FINISHED: 'finalizada', OPEN: 'reaberta' };

router.get('/', (req, res) => {
  const list = db.collection('requests');
  res.json(req.user.role === 'veterinarian' ? list.filter((r) => r.veterinarianUid === req.user.uid) : list);
});

router.post('/', requireRole('veterinarian'), (req, res) => {
  const { title, description, priority } = req.body || {};
  if (text(title).length < 4 || text(description).length < 10) {
    throw badRequest('Informe um título (mín. 4 caracteres) e uma descrição (mín. 10 caracteres).');
  }
  if (priority && !PRIORITIES.includes(priority)) throw badRequest('Prioridade inválida.');

  const clinic = db.getDoc('clinic');
  const request = {
    id: db.newId('req'),
    veterinarianUid: req.user.uid,
    veterinarianId: req.user.specialistId,
    veterinarianName: req.user.displayName,
    crmv: req.user.crmv || '',
    clinicId: clinic?.id,
    clinicName: clinic?.name,
    title: text(title),
    description: text(description),
    priority: priority || 'NORMAL',
    status: 'OPEN',
    createdAt: db.nowIso(),
  };
  db.collection('requests').unshift(request);

  notifyClinicAdmins({
    title: 'Nova solicitação administrativa',
    message: `${request.veterinarianName}: ${request.title}`,
    type: 'REQUEST_UPDATE',
    actionUrl: '/clinic/requests',
  });
  db.save();
  res.status(201).json(request);
});

router.put('/:id', requireRole('clinic_admin'), (req, res) => {
  const request = db.collection('requests').find((r) => r.id === req.params.id);
  if (!request) throw notFound('Solicitação não encontrada.');
  const { status, adminFeedback } = req.body || {};
  if (!STATUSES.includes(status)) throw badRequest('Status inválido.');
  if (status === 'REJECTED' && !text(adminFeedback)) {
    throw badRequest('Informe o motivo da recusa no parecer.');
  }

  Object.assign(request, {
    status,
    adminFeedback: text(adminFeedback) || request.adminFeedback,
    resolvedAt: FINAL_STATUSES.includes(status) ? db.nowIso() : undefined,
    resolvedByAdminName: req.user.displayName,
    updatedAt: db.nowIso(),
  });

  notifyUser(request.veterinarianUid, {
    title: `Solicitação ${STATUS_LABEL[status]}`,
    message: `"${request.title}" foi ${STATUS_LABEL[status]} pela administração.`,
    type: 'REQUEST_UPDATE',
    actionUrl: '/clinic/vet-portal',
  });
  db.save();
  res.json(request);
});

module.exports = router;
