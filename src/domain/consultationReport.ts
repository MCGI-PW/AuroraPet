import { ConsultationReport, PrescriptionItem } from '../types/appointment';

/** Campos do formulário de atendimento clínico. */
export interface ConsultationFormValues {
  veterinarianName: string;
  crmv: string;
  weight: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  anamnesis: string;
  physicalExam: string;
  diagnosis: string;
  instructions: string;
  followUpDate: string;
  prescriptions: PrescriptionItem[];
}

let prescriptionSeq = 0;
export const emptyPrescription = (): PrescriptionItem => ({
  id: `rx-${Date.now()}-${prescriptionSeq++}`,
  medication: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
});

export const emptyConsultationForm = (): ConsultationFormValues => ({
  veterinarianName: '',
  crmv: '',
  weight: '',
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  anamnesis: '',
  physicalExam: '',
  diagnosis: '',
  instructions: '',
  followUpDate: '',
  prescriptions: [emptyPrescription()],
});

export function validateConsultationForm(values: ConsultationFormValues): string | null {
  if (!values.anamnesis.trim() || !values.diagnosis.trim()) {
    return 'Preencha ao menos a anamnese e o diagnóstico clínico.';
  }
  if (values.followUpDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(values.followUpDate.trim())) {
    return 'Data de retorno inválida (use AAAA-MM-DD).';
  }
  const incomplete = values.prescriptions.find((p) => p.medication.trim() && (!p.dosage.trim() || !p.frequency.trim()));
  if (incomplete) return `Informe dose e frequência de ${incomplete.medication.trim()}.`;
  return null;
}

const withUnit = (value: string, unit: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.toLowerCase().includes(unit.toLowerCase()) ? trimmed : `${trimmed} ${unit}`;
};

/** Converte o formulário no laudo enviado à API (descarta receitas vazias). */
export function buildConsultationReport(values: ConsultationFormValues): Partial<ConsultationReport> {
  return {
    veterinarianName: values.veterinarianName.trim(),
    crmv: values.crmv.trim(),
    anamnesis: values.anamnesis.trim(),
    physicalExam: values.physicalExam.trim(),
    vitalSigns: {
      weight: withUnit(values.weight.replace(',', '.'), 'kg'),
      temperature: withUnit(values.temperature.replace(',', '.'), '°C'),
      heartRate: withUnit(values.heartRate, 'bpm'),
      respiratoryRate: withUnit(values.respiratoryRate, 'rpm'),
    },
    diagnosis: values.diagnosis.trim(),
    prescriptions: values.prescriptions
      .filter((p) => p.medication.trim())
      .map((p) => ({ ...p, medication: p.medication.trim(), dosage: p.dosage.trim(), frequency: p.frequency.trim(), duration: p.duration.trim() })),
    instructions: values.instructions.trim(),
    followUpDate: values.followUpDate.trim(),
  };
}
