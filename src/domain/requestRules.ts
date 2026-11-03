import { RequestPriority, RequestStatus } from '../types/administrativeRequest';

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const PRIORITY_COLORS: Record<RequestPriority, string> = {
  LOW: '#64748b',
  NORMAL: '#0284c7',
  HIGH: '#f97316',
  URGENT: '#ef4444',
};

export const REQUEST_STATUS: Record<RequestStatus, { label: string; color: string; background: string }> = {
  OPEN: { label: 'Aberta', color: '#1e40af', background: '#dbeafe' },
  IN_REVIEW: { label: 'Em análise', color: '#92400e', background: '#fef3c7' },
  APPROVED: { label: 'Aprovada', color: '#065f46', background: '#d1fae5' },
  REJECTED: { label: 'Recusada', color: '#991b1b', background: '#fee2e2' },
  FINISHED: { label: 'Finalizada', color: '#334155', background: '#e2e8f0' },
};

export const isPendingRequest = (status: RequestStatus) => status === 'OPEN' || status === 'IN_REVIEW';
