export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type RequestStatus = 'OPEN' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'FINISHED';

export interface AdministrativeRequest {
  id: string;
  veterinarianUid: string;
  veterinarianId: string;
  veterinarianName: string;
  crmv: string;
  clinicId: string;
  clinicName: string;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  resolvedAt?: string;
  adminFeedback?: string;
  resolvedByAdminName?: string;
}

export interface CreateAdministrativeRequestInput {
  title: string;
  description: string;
  priority: RequestPriority;
}
