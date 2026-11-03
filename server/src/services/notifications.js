const db = require('../db');
const { usersWithRole, userBySpecialist } = require('./users');

/**
 * Notificações geradas pelos eventos do sistema (agendamento, laudo,
 * autorização de acesso, solicitações). O app consulta /api/notifications
 * e exibe as novas como notificação local no aparelho; o campo actionUrl
 * indica a tela que deve ser aberta ao tocar na notificação.
 */
function notifyUser(userId, { title, message, type, actionUrl }) {
  if (!userId) return null;
  const notification = {
    id: db.newId('notif'),
    userId,
    title,
    message,
    type,
    actionUrl,
    read: false,
    createdAt: db.nowIso(),
  };
  db.collection('notifications').unshift(notification);
  return notification;
}

function notifyClinicAdmins(payload, exceptUid) {
  usersWithRole('clinic_admin')
    .filter((u) => u.uid !== exceptUid)
    .forEach((u) => notifyUser(u.uid, payload));
}

function notifySpecialist(specialistId, payload, exceptUid) {
  const vet = userBySpecialist(specialistId);
  if (vet && vet.uid !== exceptUid) notifyUser(vet.uid, payload);
}

module.exports = { notifyUser, notifyClinicAdmins, notifySpecialist };
