const { Router } = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { badRequest, notFound, conflict } = require('../errors');
const { usersWithRole } = require('../services/users');
const { text } = require('../validation');

const router = Router();

const CLINIC_FIELDS = ['name', 'tradeName', 'cnpj', 'mode', 'address', 'phone', 'emergencyPhone', 'openingHours', 'description'];
const SPECIALIST_FIELDS = ['name', 'specialty', 'crmv', 'bio', 'photoUrl', 'email', 'phone', 'availableDays', 'availableHours', 'active'];

function pick(body, fields) {
  return fields.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    return acc;
  }, {});
}

/** Uso atual dos limites do plano, calculado a partir dos dados reais. */
function subscriptionWithUsage() {
  const subscription = db.getDoc('subscription');
  if (!subscription) return null;
  const plan = db.collection('plans').find((p) => p.id === subscription.planId);
  return {
    ...subscription,
    limits: {
      maxVeterinarians: plan?.maxVeterinarians ?? 0,
      usedVeterinarians: db.collection('specialists').filter((s) => s.active !== false).length,
      maxAdmins: plan?.maxAdmins ?? 0,
      usedAdmins: usersWithRole('clinic_admin').length,
      maxPatients: plan?.maxPatients ?? 0,
      usedPatients: db.collection('pets').length,
    },
  };
}

// ---------- Dados da clínica (leitura pública, edição pela administração) ----------
router.get('/clinic', (_req, res) => {
  res.json(db.getDoc('clinic'));
});

router.put('/clinic', requireAuth, requireRole('clinic_admin'), (req, res) => {
  const changes = pick(req.body || {}, CLINIC_FIELDS);
  if (changes.name !== undefined && !changes.name) throw badRequest('O nome da clínica é obrigatório.');
  if (changes.mode && !['multi_vet', 'solo_vet'].includes(changes.mode)) throw badRequest('Modo de operação inválido.');
  const clinic = db.setDoc('clinic', { ...db.getDoc('clinic'), ...changes, updatedAt: db.nowIso() });
  res.json(clinic);
});

// ---------- Corpo clínico ----------
router.get('/specialists', (_req, res) => {
  res.json(db.collection('specialists'));
});

router.get('/specialists/:id', (req, res) => {
  const specialist = db.collection('specialists').find((s) => s.id === req.params.id);
  if (!specialist) throw notFound('Veterinário não encontrado.');
  res.json(specialist);
});

/** Horários já reservados do veterinário em uma data (sem dados pessoais). */
router.get('/specialists/:id/busy-slots', requireAuth, (req, res) => {
  const { date } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw badRequest('Informe a data no formato AAAA-MM-DD.');
  const times = db
    .collection('appointments')
    .filter((a) => a.specialistId === req.params.id && a.date === date && a.status === 'scheduled')
    .map((a) => a.time);
  res.json(times);
});

router.post('/specialists', requireAuth, requireRole('clinic_admin'), (req, res) => {
  const data = pick(req.body || {}, SPECIALIST_FIELDS);
  if (!data.name || !data.crmv || !data.specialty) {
    throw badRequest('Nome, CRMV e especialidade são obrigatórios.');
  }

  const usage = subscriptionWithUsage();
  if (usage && usage.limits.usedVeterinarians >= usage.limits.maxVeterinarians) {
    throw conflict(`O plano ${usage.planName} permite até ${usage.limits.maxVeterinarians} veterinários. Faça upgrade para cadastrar mais.`);
  }

  const specialists = db.collection('specialists');
  if (specialists.some((s) => s.crmv.toLowerCase() === data.crmv.toLowerCase())) {
    throw conflict('Já existe um veterinário cadastrado com este CRMV.');
  }

  const specialist = {
    id: db.newId('spec'),
    bio: 'Médico veterinário dedicado ao cuidado e bem-estar animal.',
    photoUrl: '',
    email: '',
    phone: '',
    availableDays: ['Segunda', 'Quarta', 'Sexta'],
    availableHours: ['09:00', '10:00', '14:00', '15:00'],
    active: true,
    ...data,
    createdAt: db.nowIso(),
  };
  specialists.push(specialist);
  db.save();
  res.status(201).json(specialist);
});

router.put('/specialists/:id', requireAuth, requireRole('clinic_admin'), (req, res) => {
  const specialists = db.collection('specialists');
  const index = specialists.findIndex((s) => s.id === req.params.id);
  if (index === -1) throw notFound('Veterinário não encontrado.');
  const changes = pick(req.body || {}, SPECIALIST_FIELDS);
  if (changes.name === '' || changes.crmv === '' || changes.specialty === '') {
    throw badRequest('Nome, CRMV e especialidade não podem ficar em branco.');
  }
  specialists[index] = { ...specialists[index], ...changes, updatedAt: db.nowIso() };
  db.save();
  res.json(specialists[index]);
});

router.delete('/specialists/:id', requireAuth, requireRole('clinic_admin'), (req, res) => {
  const specialists = db.collection('specialists');
  const index = specialists.findIndex((s) => s.id === req.params.id);
  if (index === -1) throw notFound('Veterinário não encontrado.');
  const hasUpcoming = db
    .collection('appointments')
    .some((a) => a.specialistId === req.params.id && a.status === 'scheduled');
  if (hasUpcoming) {
    throw conflict('Este veterinário possui consultas agendadas. Cancele ou reatribua antes de removê-lo.');
  }
  specialists.splice(index, 1);
  db.save();
  res.json({ message: 'Veterinário removido do corpo clínico.', id: req.params.id });
});

// ---------- Serviços e planos ----------
router.get('/services', (_req, res) => {
  res.json(db.collection('services'));
});

router.get('/plans', (_req, res) => {
  res.json(db.collection('plans'));
});

router.get('/clinic/subscription', requireAuth, requireRole('clinic_admin', 'veterinarian'), (_req, res) => {
  res.json(subscriptionWithUsage());
});

router.put('/clinic/subscription', requireAuth, requireRole('clinic_admin'), (req, res) => {
  const plan = db.collection('plans').find((p) => p.id === text(req.body?.planId));
  if (!plan) throw badRequest('Plano selecionado não existe.');

  const current = subscriptionWithUsage();
  if (current && current.limits.usedVeterinarians > plan.maxVeterinarians) {
    throw conflict(`A clínica possui ${current.limits.usedVeterinarians} veterinários; o plano ${plan.name} permite ${plan.maxVeterinarians}.`);
  }

  const renewal = new Date();
  renewal.setFullYear(renewal.getFullYear() + 1);
  db.setDoc('subscription', {
    ...db.getDoc('subscription'),
    planId: plan.id,
    planName: plan.name,
    planCode: plan.code,
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: renewal.toISOString().split('T')[0],
    updatedAt: db.nowIso(),
  });
  res.json(subscriptionWithUsage());
});

module.exports = router;
