const { Router } = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { badRequest, notFound, forbidden, conflict } = require('../errors');
const { STAFF_ROLES } = require('../services/users');
const { notifyUser, notifyClinicAdmins, notifySpecialist } = require('../services/notifications');
const { text, isIsoDate, isTime, formatDayMonth } = require('../validation');

const router = Router();
router.use(requireAuth, requireRole('tutor', ...STAFF_ROLES));

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const isStaff = (user) => STAFF_ROLES.includes(user.role);

function findAccessibleAppointment(req) {
  const appointment = db.collection('appointments').find((a) => a.id === req.params.id);
  if (!appointment) throw notFound('Consulta não encontrada.');
  if (appointment.userId !== req.user.uid && !isStaff(req.user)) {
    throw forbidden('Esta consulta pertence a outro tutor.');
  }
  return appointment;
}

/** Regras de agenda: data futura, dia/horário de atendimento e horário livre. */
function assertSlotAvailable({ specialist, date, time, ignoreId }) {
  if (!isIsoDate(date) || !isTime(time)) throw badRequest('Data ou horário inválido.');
  const start = new Date(`${date}T${time}:00`);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
    throw badRequest('Escolha uma data e horário futuros.');
  }
  const weekday = WEEKDAYS[new Date(`${date}T12:00:00`).getDay()];
  if (specialist.availableDays?.length && !specialist.availableDays.includes(weekday)) {
    throw badRequest(`${specialist.name} não atende às ${weekday.toLowerCase()}s.`);
  }
  if (specialist.availableHours?.length && !specialist.availableHours.includes(time)) {
    throw badRequest(`Horário ${time} indisponível para ${specialist.name}.`);
  }
  const taken = db
    .collection('appointments')
    .some((a) => a.id !== ignoreId && a.specialistId === specialist.id && a.date === date && a.time === time && a.status === 'scheduled');
  if (taken) throw conflict('Este horário já está reservado. Escolha outro horário.');
}

router.get('/', (req, res) => {
  const { specialistId } = req.query;
  let list = db.collection('appointments');
  if (!isStaff(req.user)) list = list.filter((a) => a.userId === req.user.uid);
  if (specialistId) list = list.filter((a) => a.specialistId === specialistId);
  res.json([...list].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
});

router.get('/:id', (req, res) => {
  res.json(findAccessibleAppointment(req));
});

router.post('/', requireRole('tutor'), (req, res) => {
  const { petId, specialistId, serviceId, date, time, notes } = req.body || {};
  const pet = db.collection('pets').find((p) => p.id === petId && p.userId === req.user.uid);
  if (!pet) throw badRequest('Selecione um pet cadastrado na sua conta.');
  const specialist = db.collection('specialists').find((s) => s.id === specialistId && s.active !== false);
  if (!specialist) throw badRequest('Selecione um veterinário disponível.');
  const service = db.collection('services').find((s) => s.id === serviceId);
  if (!service) throw badRequest('Selecione o tipo de atendimento.');

  assertSlotAvailable({ specialist, date, time });

  const appointment = {
    id: db.newId('app'),
    userId: req.user.uid,
    tutorName: req.user.displayName,
    petId: pet.id,
    petName: pet.name,
    specialistId: specialist.id,
    specialistName: specialist.name,
    serviceId: service.id,
    serviceName: service.name || service.title,
    date,
    time,
    notes: text(notes),
    status: 'scheduled',
    createdAt: db.nowIso(),
  };
  db.collection('appointments').unshift(appointment);

  const payload = {
    title: 'Nova consulta agendada',
    message: `${pet.name} • ${appointment.serviceName} em ${formatDayMonth(date)} às ${time}.`,
    type: 'APPOINTMENT',
    actionUrl: `/clinic/attendance/${appointment.id}`,
  };
  notifySpecialist(specialist.id, payload);
  notifyClinicAdmins(payload);
  db.save();
  res.status(201).json(appointment);
});

router.put('/:id', (req, res) => {
  const appointment = findAccessibleAppointment(req);
  const { status, date, time, notes } = req.body || {};
  const staff = isStaff(req.user);

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    throw conflict('Consultas concluídas ou canceladas não podem ser alteradas.');
  }
  if (status !== undefined && !['scheduled', 'in_progress', 'cancelled'].includes(status)) {
    throw badRequest('Status inválido. A conclusão é feita pela emissão do laudo.');
  }
  if (status === 'in_progress' && !staff) throw forbidden('Somente a clínica inicia o atendimento.');

  const rescheduled = (date !== undefined && date !== appointment.date) || (time !== undefined && time !== appointment.time);
  if (rescheduled) {
    const specialist = db.collection('specialists').find((s) => s.id === appointment.specialistId);
    if (!specialist) throw conflict('O veterinário desta consulta não está mais disponível.');
    assertSlotAvailable({ specialist, date: date ?? appointment.date, time: time ?? appointment.time, ignoreId: appointment.id });
  }

  Object.assign(appointment, {
    ...(status !== undefined && { status }),
    ...(date !== undefined && { date }),
    ...(time !== undefined && { time }),
    ...(notes !== undefined && { notes: text(notes) }),
    updatedAt: db.nowIso(),
  });

  const when = `${formatDayMonth(appointment.date)} às ${appointment.time}`;
  if (status === 'cancelled' || rescheduled) {
    const verb = status === 'cancelled' ? 'cancelada' : 'remarcada';
    if (staff) {
      notifyUser(appointment.userId, {
        title: `Consulta ${verb} pela clínica`,
        message: `A consulta de ${appointment.petName} (${when}) foi ${verb}.`,
        type: 'APPOINTMENT',
        actionUrl: `/tutor/appointments/${appointment.id}`,
      });
    } else {
      const payload = {
        title: `Consulta ${verb} pelo tutor`,
        message: `${appointment.petName} • ${appointment.serviceName} (${when}).`,
        type: 'APPOINTMENT',
        actionUrl: '/clinic/agenda',
      };
      notifySpecialist(appointment.specialistId, payload);
      notifyClinicAdmins(payload);
    }
  }
  db.save();
  res.json(appointment);
});

router.delete('/:id', (req, res) => {
  const appointment = findAccessibleAppointment(req);
  if (req.user.role === 'veterinarian') throw forbidden('Somente o tutor ou a administração podem excluir registros.');
  const list = db.collection('appointments');
  list.splice(list.indexOf(appointment), 1);
  db.save();
  res.json({ message: 'Agendamento excluído com sucesso.', id: appointment.id });
});

// ---------- Laudo / prontuário da consulta ----------
router.get('/:id/report', (req, res) => {
  const appointment = findAccessibleAppointment(req);
  if (!appointment.report) throw notFound('Nenhum laudo emitido para esta consulta ainda.');
  res.json(appointment.report);
});

router.post('/:id/report', requireRole(...STAFF_ROLES), (req, res) => {
  const appointment = findAccessibleAppointment(req);
  if (appointment.status === 'cancelled') throw conflict('Não é possível emitir laudo de consulta cancelada.');

  const body = req.body || {};
  if (!text(body.anamnesis) || !text(body.diagnosis)) {
    throw badRequest('Anamnese e diagnóstico são obrigatórios para emitir o laudo.');
  }

  const prescriptions = Array.isArray(body.prescriptions)
    ? body.prescriptions.filter((p) => text(p?.medication))
    : [];

  appointment.report = {
    completedAt: db.nowIso(),
    veterinarianName: text(body.veterinarianName) || appointment.specialistName,
    crmv: text(body.crmv) || req.user.crmv || '',
    specialty: text(body.specialty) || req.user.specialty || '',
    anamnesis: text(body.anamnesis),
    physicalExam: text(body.physicalExam),
    vitalSigns: body.vitalSigns || {},
    diagnosis: text(body.diagnosis),
    prescriptions,
    instructions: text(body.instructions),
    followUpDate: text(body.followUpDate),
  };
  appointment.status = 'completed';
  appointment.updatedAt = db.nowIso();

  // peso aferido na consulta atualiza o prontuário do pet
  const pet = db.collection('pets').find((p) => p.id === appointment.petId);
  if (pet && body.vitalSigns?.weight) pet.weight = text(body.vitalSigns.weight);

  notifyUser(appointment.userId, {
    title: `Laudo de ${appointment.petName} disponível`,
    message: `${appointment.report.veterinarianName} concluiu o atendimento. Toque para ver diagnóstico e receita.`,
    type: 'APPOINTMENT',
    actionUrl: `/tutor/appointments/${appointment.id}`,
  });
  db.save();
  res.json(appointment);
});

module.exports = router;
