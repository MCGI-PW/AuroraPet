export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface VitalSigns {
  weight?: string;
  temperature?: string;     // e.g. "38.5 °C"
  heartRate?: string;       // e.g. "120 bpm"
  respiratoryRate?: string; // e.g. "24 rpm"
}

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface ConsultationReport {
  completedAt: string;
  veterinarianName: string;
  crmv: string;
  specialty?: string;
  anamnesis: string;
  physicalExam?: string;
  vitalSigns: VitalSigns;
  diagnosis: string;
  prescriptions: PrescriptionItem[];
  instructions: string;
  followUpDate?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  tutorName?: string;
  petId: string;
  petName: string;
  specialistId: string;
  specialistName: string;
  serviceId?: string;
  serviceName: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
  report?: ConsultationReport;
}

export interface CreateAppointmentInput {
  petId: string;
  specialistId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  status?: Exclude<AppointmentStatus, 'completed'>;
  date?: string;
  time?: string;
  notes?: string;
}

