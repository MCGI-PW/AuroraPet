const { Router } = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { badRequest, conflict } = require('../errors');
const { ROLES, findUser, linkVeterinarian } = require('../services/users');
const { text } = require('../validation');

const router = Router();
router.use(requireAuth);

/**
 * Perfil do usuário autenticado. Na primeira chamada após o cadastro no
 * Firebase o perfil é criado com o papel padrão "tutor".
 */
router.get('/me', (req, res) => {
  // relê o perfil: uma requisição concorrente (PUT do cadastro) pode tê-lo criado
  req.user = findUser(req.auth.uid);
  if (!req.user) {
    const profile = {
      uid: req.auth.uid,
      email: req.auth.email,
      displayName: req.auth.name || req.auth.email.split('@')[0],
      role: 'tutor',
      profileCompleted: false,
      createdAt: db.nowIso(),
    };
    db.collection('users').push(profile);
    db.save();
    req.user = profile;
  }
  res.json(req.user);
});

/**
 * Atualiza o perfil. O papel (tutor, veterinário ou clínica) só pode ser
 * escolhido uma vez, na conclusão do cadastro.
 */
router.put('/me', (req, res) => {
  const users = db.collection('users');
  let profile = findUser(req.auth.uid);
  if (!profile) {
    profile = { uid: req.auth.uid, email: req.auth.email, role: 'tutor', profileCompleted: false, createdAt: db.nowIso() };
    users.push(profile);
  }

  const { displayName, phoneNumber, role, crmv, specialty } = req.body || {};

  if (displayName !== undefined) {
    const name = text(displayName);
    if (name.length < 3) throw badRequest('Informe o nome completo (mínimo de 3 caracteres).');
    profile.displayName = name;
  }
  if (phoneNumber !== undefined) profile.phoneNumber = text(phoneNumber);

  if (role !== undefined && role !== profile.role) {
    if (profile.profileCompleted) throw conflict('O tipo de conta não pode ser alterado após o cadastro.');
    if (!ROLES.includes(role)) throw badRequest('Tipo de conta inválido.');
    profile.role = role;
  }

  if (profile.role === 'veterinarian' && !profile.specialistId) {
    if (!text(crmv)) throw badRequest('Informe o CRMV para concluir o cadastro de veterinário.');
    const specialist = linkVeterinarian(profile, { crmv: text(crmv), specialty: text(specialty) });
    profile.specialistId = specialist.id;
    profile.crmv = specialist.crmv;
    profile.specialty = specialist.specialty;
  }

  profile.profileCompleted = true;
  profile.updatedAt = db.nowIso();
  db.save();
  res.json(profile);
});

module.exports = router;
