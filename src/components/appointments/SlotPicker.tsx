import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBusySlots } from '../../hooks/useClinic';
import { availableDatesFor, availableTimesFor, formatDayLabel } from '../../domain/appointmentRules';
import { Specialist } from '../../types/specialist';

interface SlotPickerProps {
  specialist?: Specialist;
  date: string;
  time: string;
  onChangeDate: (date: string) => void;
  onChangeTime: (time: string) => void;
}

/**
 * Seleção de data e horário: mostra apenas os dias de atendimento do
 * veterinário e os horários livres (consultando a API).
 */
export const SlotPicker: React.FC<SlotPickerProps> = ({ specialist, date, time, onChangeDate, onChangeTime }) => {
  const { colors } = useTheme();
  const dates = useMemo(() => availableDatesFor(specialist), [specialist]);
  const { data: busyTimes = [], isFetching } = useBusySlots(specialist?.id, date || undefined);
  const times = availableTimesFor(specialist, date, busyTimes);

  // mantém data/horário válidos quando o veterinário ou a agenda mudam
  useEffect(() => {
    if (dates.length && !dates.includes(date)) onChangeDate(dates[0]);
  }, [dates, date, onChangeDate]);

  useEffect(() => {
    if (!isFetching && time && !times.includes(time)) onChangeTime('');
  }, [isFetching, times, time, onChangeTime]);

  if (!specialist) {
    return <Text style={[styles.hint, { color: colors.textSecondary }]}>Escolha o veterinário para ver a agenda.</Text>;
  }

  const chip = (selected: boolean) => [
    styles.chip,
    { backgroundColor: selected ? colors.primaryLight : colors.surfaceSubtle, borderColor: selected ? colors.accent : colors.border },
  ];

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {dates.map((d) => {
          const { weekday, day } = formatDayLabel(d);
          const selected = d === date;
          return (
            <TouchableOpacity key={d} onPress={() => onChangeDate(d)} style={[chip(selected), styles.dateChip]}>
              <Text style={[styles.weekday, { color: selected ? colors.accent : colors.textMuted }]}>{weekday}</Text>
              <Text style={[styles.day, { color: selected ? colors.accent : colors.text }]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.timesWrap}>
        {isFetching ? (
          <ActivityIndicator color={colors.accent} />
        ) : times.length === 0 ? (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Sem horários livres nesta data. Escolha outro dia.</Text>
        ) : (
          times.map((t) => (
            <TouchableOpacity key={t} onPress={() => onChangeTime(t)} style={chip(t === time)}>
              <Text style={[styles.time, { color: t === time ? colors.accent : colors.text }]}>{t}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  dateChip: { alignItems: 'center', minWidth: 62 },
  weekday: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  day: { fontSize: 14, fontWeight: '800' },
  timesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, minHeight: 40, alignItems: 'center' },
  time: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 13 },
});
