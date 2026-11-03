import { Appointment } from '../types/appointment';
import { Specialist } from '../types/specialist';

/**
 * Regras de negócio da agenda (datas disponíveis, horários e lembretes).
 * Ficam fora das telas para serem reutilizadas e testadas isoladamente.
 */
export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const toIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const appointmentDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`);

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return d && m && y ? `${d}/${m}/${y}` : isoDate;
}

export function formatDayLabel(isoDate: string): { weekday: string; day: string } {
  const date = new Date(`${isoDate}T12:00:00`);
  return {
    weekday: WEEKDAYS[date.getDay()].slice(0, 3),
    day: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
  };
}

/** Próximos dias (a partir de hoje) em que o veterinário atende. */
export function availableDatesFor(specialist: Specialist | undefined, days = 21, from = new Date()): string[] {
  if (!specialist) return [];
  const result: string[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
    const weekday = WEEKDAYS[date.getDay()];
    if (!specialist.availableDays?.length || specialist.availableDays.includes(weekday)) {
      result.push(toIsoDate(date));
    }
  }
  return result;
}

/**
 * Horários livres do veterinário na data: remove os já reservados (busyTimes,
 * vindos da API) e, se a data for hoje, os horários que já passaram.
 */
export function availableTimesFor(
  specialist: Specialist | undefined,
  date: string,
  busyTimes: string[],
  now = new Date()
): string[] {
  if (!specialist || !date) return [];
  const taken = new Set(busyTimes);
  return (specialist.availableHours ?? []).filter(
    (time) => !taken.has(time) && appointmentDateTime(date, time).getTime() > now.getTime()
  );
}

export interface ReminderPlan {
  triggerAt: Date;
  title: string;
  body: string;
}

/**
 * Lembretes de uma consulta: 24 horas antes e 1 hora antes do horário.
 * Lembretes cujo horário já passou não são agendados.
 */
export function planAppointmentReminders(appointment: Appointment, now = new Date()): ReminderPlan[] {
  const start = appointmentDateTime(appointment.date, appointment.time);
  const who = `${appointment.petName} com ${appointment.specialistName}`;
  const plans: ReminderPlan[] = [
    {
      triggerAt: new Date(start.getTime() - 24 * 60 * 60 * 1000),
      title: 'Consulta amanhã',
      body: `${who} amanhã às ${appointment.time} (${appointment.serviceName}).`,
    },
    {
      triggerAt: new Date(start.getTime() - 60 * 60 * 1000),
      title: 'Sua consulta é daqui a 1 hora',
      body: `${who} às ${appointment.time}. Não se esqueça de levar a carteirinha de vacinação.`,
    },
  ];
  return plans.filter((plan) => plan.triggerAt.getTime() > now.getTime());
}

export const isUpcoming = (appointment: Appointment, now = new Date()) =>
  appointment.status === 'scheduled' &&
  appointmentDateTime(appointment.date, appointment.time).getTime() >= now.getTime();
