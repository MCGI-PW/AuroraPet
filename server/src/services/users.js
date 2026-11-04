const db = require('../db');
const { conflict } = require('../errors');

const ROLES = ['tutor', 'veterinarian', 'clinic_admin'];
const STAFF_ROLES = ['veterinarian', 'clinic_admin'];

function findUser(uid) {
  return db.collection('users').find((u) => u.uid === uid) || null;
}

function usersWithRole(role) {
  return db.collection('users').filter((u) => u.role === role);
}

function userBySpecialist(specialistId) {
  return db.collection('users').find((u) => u.specialistId === specialistId) || null;
}

/**
 * Vincula o médico veterinário recém-cadastrado ao corpo clínico.
 * Se a clínica já cadastrou um especialista com o mesmo e-mail, o vínculo é
 * feito com ele; caso contrário um novo especialista é incluído na equipe.
 */
function linkVeterinarian(user, { crmv, specialty }) {
  const specialists = db.collection('specialists');
  const email = (user.email || '').toLowerCase();
  const normalizedCrmv = crmv.replace(/\s+/g, ' ').toLowerCase();

  // CRMV é único: se já existe no corpo clínico, só pode ser vinculado se estiver livre
  const sameCrmv = specialists.find((s) => (s.crmv || '').replace(/\s+/g, ' ').toLowerCase() === normalizedCrmv);
  if (sameCrmv) {
    if (userBySpecialist(sameCrmv.id)) throw conflict('Este CRMV já está vinculado a outra conta.');
    return sameCrmv;
  }

  let specialist = specialists.find((s) => (s.email || '').toLowerCase() === email && email);
  if (specialist && userBySpecialist(specialist.id)) specialist = undefined;

  if (!specialist) {
    specialist = {
      id: db.newId('spec'),
      name: user.displayName,
      specialty: specialty || 'Clínica Geral',
      crmv: crmv || '',
      bio: 'Médico veterinário do corpo clínico.',
      photoUrl: '',
      availableDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      email: user.email,
      phone: user.phoneNumber || '',
      active: true,
      createdAt: db.nowIso(),
    };
    specialists.push(specialist);
  }
  return specialist;
}

module.exports = { ROLES, STAFF_ROLES, findUser, usersWithRole, userBySpecialist, linkVeterinarian };
