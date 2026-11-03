const { Router } = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { badRequest, notFound, forbidden } = require('../errors');
const { STAFF_ROLES } = require('../services/users');
const { text } = require('../validation');

const router = Router();
router.use(requireAuth, requireRole('tutor', ...STAFF_ROLES));

const SPECIES = ['dog', 'cat', 'bird', 'other'];

function normalizeWeight(weight) {
  if (weight === undefined || weight === null || weight === '') return undefined;
  const value = String(weight).replace(',', '.').replace(/kg/i, '').trim();
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 200) {
    throw badRequest('Peso inválido. Informe um valor entre 0 e 200 kg.');
  }
  return `${number} kg`;
}

/**
 * LGPD: o veterinário só lê o prontuário de pets que autorizaram o acesso
 * a ele (autorização ativa e no prazo) ou que têm consulta com ele.
 */
function vetCanRead(user, petId) {
  const today = new Date().toISOString().split('T')[0];
  const authorized = db
    .collection('authorizations')
    .some((a) => a.petId === petId && a.veterinarianId === user.specialistId && a.status === 'ACTIVE' && (!a.expiresAt || a.expiresAt >= today));
  const hasAppointment = db
    .collection('appointments')
    .some((a) => a.petId === petId && a.specialistId === user.specialistId);
  return authorized || hasAppointment;
}

function canRead(user, pet) {
  if (pet.userId === user.uid || user.role === 'clinic_admin') return true;
  return user.role === 'veterinarian' && vetCanRead(user, pet.id);
}

function findOwnedPet(req) {
  const pet = db.collection('pets').find((p) => p.id === req.params.id);
  if (!pet) throw notFound('Pet não encontrado.');
  const allowed = req.method === 'GET' ? canRead(req.user, pet) : pet.userId === req.user.uid;
  if (!allowed) throw forbidden('Você não tem autorização para acessar este prontuário.');
  return pet;
}

// Tutor: os próprios pets. Clínica: todos os pacientes. Veterinário: os autorizados.
router.get('/', (req, res) => {
  res.json(db.collection('pets').filter((p) => canRead(req.user, p)));
});

router.get('/:id', (req, res) => {
  res.json(findOwnedPet(req));
});

router.post('/', requireRole('tutor'), (req, res) => {
  const { name, species, breed, age, weight, notes, photoUrl } = req.body || {};
  if (!text(name)) throw badRequest('O nome do pet é obrigatório.');
  if (!SPECIES.includes(species)) throw badRequest('Espécie inválida.');

  const pet = {
    id: db.newId('pet'),
    userId: req.user.uid,
    name: text(name),
    species,
    breed: text(breed) || 'SRD (sem raça definida)',
    age: text(age) || 'Não informada',
    weight: normalizeWeight(weight),
    notes: text(notes),
    photoUrl: text(photoUrl),
    createdAt: db.nowIso(),
  };
  db.collection('pets').unshift(pet);
  db.save();
  res.status(201).json(pet);
});

router.put('/:id', (req, res) => {
  const pet = findOwnedPet(req);
  const { name, species, breed, age, weight, notes, photoUrl } = req.body || {};
  if (name !== undefined && !text(name)) throw badRequest('O nome do pet é obrigatório.');
  if (species !== undefined && !SPECIES.includes(species)) throw badRequest('Espécie inválida.');

  Object.assign(pet, {
    ...(name !== undefined && { name: text(name) }),
    ...(species !== undefined && { species }),
    ...(breed !== undefined && { breed: text(breed) }),
    ...(age !== undefined && { age: text(age) }),
    ...(weight !== undefined && { weight: normalizeWeight(weight) }),
    ...(notes !== undefined && { notes: text(notes) }),
    ...(photoUrl !== undefined && { photoUrl: text(photoUrl) }),
    updatedAt: db.nowIso(),
  });

  // mantém o nome do pet atualizado nas consultas e autorizações
  db.collection('appointments').filter((a) => a.petId === pet.id).forEach((a) => (a.petName = pet.name));
  db.collection('authorizations').filter((a) => a.petId === pet.id).forEach((a) => (a.petName = pet.name));
  db.save();
  res.json(pet);
});

router.delete('/:id', (req, res) => {
  const pet = findOwnedPet(req);
  const pets = db.collection('pets');
  pets.splice(pets.indexOf(pet), 1);

  // consultas futuras do pet são canceladas e os acessos concedidos revogados
  db.collection('appointments')
    .filter((a) => a.petId === pet.id && a.status === 'scheduled')
    .forEach((a) => Object.assign(a, { status: 'cancelled', updatedAt: db.nowIso() }));
  db.collection('authorizations')
    .filter((a) => a.petId === pet.id && a.status === 'ACTIVE')
    .forEach((a) => Object.assign(a, { status: 'REVOKED', revocationReason: 'Pet removido pelo tutor.', revokedAt: db.nowIso() }));

  db.save();
  res.json({ message: 'Pet excluído com sucesso.', id: pet.id });
});

module.exports = router;
