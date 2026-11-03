const { Router } = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { badRequest, notFound, forbidden, conflict } = require('../errors');
const { notifySpecialist } = require('../services/notifications');
const { text } = require('../validation');

/**
 * Autorização de acesso ao prontuário (LGPD): o tutor concede ou revoga o
 * acesso de um veterinário aos dados de um pet, com prazo de validade.
 */
const router = Router();
router.use(requireAuth);

const ALLOWED_DURATIONS = [30, 90, 365];
const today = () => new Date().toISOString().split('T')[0];

/** Marca como EXPIRED as autorizações cujo prazo terminou. */
function withCurrentStatus(authorization) {
  if (authorization.status === 'ACTIVE' && authorization.expiresAt && authorization.expiresAt < today()) {
    return { ...authorization, status: 'EXPIRED' };
  }
  return authorization;
}

router.get('/', requireRole('tutor', 'veterinarian', 'clinic_admin'), (req, res) => {
  const { petId } = req.query;
  let list = db.collection('authorizations');

  if (req.user.role === 'tutor') list = list.filter((a) => a.tutorId === req.user.uid);
  if (req.user.role === 'veterinarian') list = list.filter((a) => a.veterinarianId === req.user.specialistId);
  if (petId) list = list.filter((a) => a.petId === petId);

  res.json(list.map(withCurrentStatus));
});

router.post('/', requireRole('tutor'), (req, res) => {
  const { petId, veterinarianId, durationDays } = req.body || {};
  const pet = db.collection('pets').find((p) => p.id === petId && p.userId === req.user.uid);
  if (!pet) throw badRequest('Selecione um pet da sua conta.');
  const vet = db.collection('specialists').find((s) => s.id === veterinarianId && s.active !== false);
  if (!vet) throw badRequest('Selecione um veterinário do corpo clínico.');
  if (durationDays !== null && durationDays !== undefined && !ALLOWED_DURATIONS.includes(Number(durationDays))) {
    throw badRequest('Prazo de acesso inválido.');
  }

  const alreadyActive = db
    .collection('authorizations')
    .map(withCurrentStatus)
    .some((a) => a.petId === pet.id && a.veterinarianId === vet.id && a.status === 'ACTIVE');
  if (alreadyActive) throw conflict(`${vet.name} já possui acesso ativo ao prontuário de ${pet.name}.`);

  let expiresAt;
  if (durationDays) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(durationDays));
    expiresAt = expiry.toISOString().split('T')[0];
  }

  const clinic = db.getDoc('clinic');
  const authorization = {
    id: db.newId('auth'),
    petId: pet.id,
    petName: pet.name,
    tutorId: req.user.uid,
    tutorName: req.user.displayName,
    veterinarianId: vet.id,
    veterinarianName: vet.name,
    crmv: vet.crmv,
    clinicId: clinic?.id,
    clinicName: clinic?.name,
    authorizedAt: today(),
    expiresAt,
    status: 'ACTIVE',
  };
  db.collection('authorizations').unshift(authorization);

  notifySpecialist(vet.id, {
    title: 'Novo acesso a prontuário',
    message: `${req.user.displayName} autorizou seu acesso ao prontuário de ${pet.name}.`,
    type: 'ACCESS_GRANTED',
    actionUrl: '/clinic/vet-portal',
  });
  db.save();
  res.status(201).json(authorization);
});

router.put('/:id/revoke', requireRole('tutor'), (req, res) => {
  const authorization = db.collection('authorizations').find((a) => a.id === req.params.id);
  if (!authorization) throw notFound('Autorização não encontrada.');
  if (authorization.tutorId !== req.user.uid) throw forbidden();
  if (authorization.status !== 'ACTIVE') throw conflict('Esta autorização já não está ativa.');

  Object.assign(authorization, {
    status: 'REVOKED',
    revocationReason: text(req.body?.reason) || 'Revogado pelo tutor.',
    revokedAt: today(),
  });

  notifySpecialist(authorization.veterinarianId, {
    title: 'Acesso a prontuário revogado',
    message: `O tutor revogou seu acesso ao prontuário de ${authorization.petName}.`,
    type: 'ACCESS_REVOKED',
    actionUrl: '/clinic/vet-portal',
  });
  db.save();
  res.json(authorization);
});

module.exports = router;
