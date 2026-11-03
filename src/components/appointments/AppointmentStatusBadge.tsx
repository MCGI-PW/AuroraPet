import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppointmentStatus } from '../../types/appointment';

export const APPOINTMENT_STATUS: Record<AppointmentStatus, { label: string; color: string; background: string }> = {
  scheduled: { label: 'Agendada', color: '#1d4ed8', background: '#dbeafe' },
  in_progress: { label: 'Em atendimento', color: '#92400e', background: '#fef3c7' },
  completed: { label: 'Realizada', color: '#047857', background: '#d1fae5' },
  cancelled: { label: 'Cancelada', color: '#991b1b', background: '#fee2e2' },
};

/** Selo colorido com o status da consulta. */
export const AppointmentStatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const config = APPOINTMENT_STATUS[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});
