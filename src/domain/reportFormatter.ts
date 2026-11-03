import { Appointment } from '../types/appointment';
import { formatDate } from './appointmentRules';

/** Gera o laudo da consulta em texto, para compartilhar (WhatsApp, e-mail...). */
export function formatReportAsText(appointment: Appointment): string {
  const report = appointment.report;
  if (!report) return '';
  const vitals = report.vitalSigns ?? {};
  const lines = [
    `LAUDO VETERINÁRIO — ${appointment.petName}`,
    `${appointment.serviceName} • ${formatDate(appointment.date)} às ${appointment.time}`,
    `Veterinário(a): ${report.veterinarianName}${report.crmv ? ` (${report.crmv})` : ''}`,
    '',
    `Anamnese: ${report.anamnesis}`,
    report.physicalExam ? `Exame físico: ${report.physicalExam}` : '',
    `Sinais vitais: ${[vitals.weight, vitals.temperature, vitals.heartRate, vitals.respiratoryRate].filter(Boolean).join(' • ') || '—'}`,
    `Diagnóstico: ${report.diagnosis}`,
    '',
    report.prescriptions.length ? 'Prescrição:' : '',
    ...report.prescriptions.map(
      (p) => `• ${p.medication} — ${p.dosage}, ${p.frequency}, por ${p.duration}${p.instructions ? ` (${p.instructions})` : ''}`
    ),
    report.instructions ? `\nOrientações: ${report.instructions}` : '',
    report.followUpDate ? `Retorno: ${formatDate(report.followUpDate)}` : '',
    '',
    'Emitido pelo AuroraPet',
  ];
  return lines.filter((line, i, all) => line !== '' || all[i - 1] !== '').join('\n');
}
