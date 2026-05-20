import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { localiApi } from '../api/locali';
import { Locale, LocaliStackParamList } from '../types';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { colors, fontSize, radius, spacing } from '../components/theme';

type Props = {
  navigation: NativeStackNavigationProp<LocaliStackParamList, 'LocaleDetail'>;
  route: RouteProp<LocaliStackParamList, 'LocaleDetail'>;
};

const STATUSES: Locale['status'][] = ['active', 'inactive', 'maintenance'];

export function LocaleDetailScreen({ navigation, route }: Props) {
  const { localeId } = route.params;
  const [locale, setLocale] = useState<Locale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editStatus, setEditStatus] = useState<Locale['status']>('active');
  const [editCapacity, setEditCapacity] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await localiApi.getById(localeId);
      setLocale(data);
      setEditName(data.name ?? '');
      setEditAddress(data.address ?? '');
      setEditCity(data.city ?? '');
      setEditStatus(data.status);
      setEditCapacity(data.capacity?.toString() ?? '');
    } catch {
      Alert.alert('Errore', 'Impossibile caricare locale');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [localeId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await localiApi.update(localeId, {
        name: editName,
        address: editAddress,
        city: editCity,
        status: editStatus,
        capacity: editCapacity ? parseInt(editCapacity, 10) : undefined,
      });
      setLocale(updated);
      setEditing(false);
      Alert.alert('Salvato', 'Locale aggiornato');
    } catch {
      Alert.alert('Errore', 'Salvataggio fallito');
    } finally {
      setSaving(false);
    }
  };

  const statusLevel =
    locale?.status === 'active' ? 'ok' : locale?.status === 'maintenance' ? 'warning' : 'error';

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.highlight} size="large" />
      </View>
    );
  }

  if (!locale) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.iconBig}>🏢</Text>
        <Text style={styles.name}>{locale.name}</Text>
        <Text style={styles.city}>{locale.city ?? '—'}</Text>
        <StatusBadge level={statusLevel} label={locale.status.toUpperCase()} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Dettagli</Text>
        {[
          ['ID', locale.id],
          ['Indirizzo', locale.address ?? '—'],
          ['Città', locale.city ?? '—'],
          ['Tipo', locale.type ?? '—'],
          ['Capienza', locale.capacity?.toString() ?? '—'],
          ['Creato', new Date(locale.createdAt).toLocaleDateString('it-IT')],
        ].map(([label, value]) => (
          <View key={label} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
          </View>
        ))}
      </Card>

      {editing ? (
        <Card>
          <Text style={styles.sectionTitle}>Modifica</Text>

          {[
            ['Nome', editName, setEditName, undefined, 'default'],
            ['Indirizzo', editAddress, setEditAddress, undefined, 'default'],
            ['Città', editCity, setEditCity, undefined, 'default'],
            ['Capienza', editCapacity, setEditCapacity, 'numeric', 'numeric'],
          ].map(([label, value, setter, kb]) => (
            <View key={label as string}>
              <Text style={styles.inputLabel}>{label as string}</Text>
              <TextInput
                style={styles.input}
                value={value as string}
                onChangeText={setter as (t: string) => void}
                placeholder={label as string}
                placeholderTextColor={colors.textMuted}
                keyboardType={(kb as 'numeric' | 'default') ?? 'default'}
              />
            </View>
          ))}

          <Text style={styles.inputLabel}>Stato</Text>
          <View style={styles.chips}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, editStatus === s && styles.chipActive]}
                onPress={() => setEditStatus(s)}
              >
                <Text style={[styles.chipText, editStatus === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)} disabled={saving}>
              <Text style={styles.cancelBtnText}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Salva</Text>}
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
          <Text style={styles.editBtnText}>✏️  Modifica Locale</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { alignItems: 'center', gap: spacing.sm },
  iconBig: { fontSize: 56 },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  city: { fontSize: fontSize.sm, color: colors.textSecondary },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  fieldLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  fieldValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  inputLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.highlight, borderColor: colors.highlight },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  editActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  cancelBtn: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.highlight, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  editBtn: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});
