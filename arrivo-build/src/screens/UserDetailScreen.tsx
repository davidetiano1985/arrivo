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
import { usersApi } from '../api/users';
import { User, UsersStackParamList } from '../types';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { colors, fontSize, radius, spacing } from '../components/theme';

type Props = {
  navigation: NativeStackNavigationProp<UsersStackParamList, 'UserDetail'>;
  route: RouteProp<UsersStackParamList, 'UserDetail'>;
};

const ROLES: User['role'][] = ['admin', 'manager', 'staff', 'user'];
const STATUSES: User['status'][] = ['active', 'inactive', 'suspended'];

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '—'}</Text>
    </View>
  );
}

export function UserDetailScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<User['role']>('user');
  const [editStatus, setEditStatus] = useState<User['status']>('active');

  const load = useCallback(async () => {
    try {
      const data = await usersApi.getById(userId);
      setUser(data);
      setEditName(data.name ?? '');
      setEditPhone(data.phone ?? '');
      setEditRole(data.role);
      setEditStatus(data.status);
    } catch {
      Alert.alert('Errore', 'Impossibile caricare utente');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.update(userId, {
        name: editName,
        phone: editPhone,
        role: editRole,
        status: editStatus,
      });
      setUser(updated);
      setEditing(false);
      Alert.alert('Salvato', 'Utente aggiornato con successo');
    } catch {
      Alert.alert('Errore', 'Salvataggio fallito');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = () => {
    Alert.alert('Sospendi utente', `Sospendere ${user?.name}?`, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Sospendi',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await usersApi.suspend(userId);
            setUser(updated);
          } catch {
            Alert.alert('Errore', 'Operazione fallita');
          }
        },
      },
    ]);
  };

  const statusLevel = user?.status === 'active' ? 'ok' : user?.status === 'inactive' ? 'warning' : 'error';

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.highlight} size="large" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name ?? user.email).charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name ?? '—'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <StatusBadge level={statusLevel} label={user.status.toUpperCase()} />
      </View>

      {/* Info Card */}
      <Card>
        <Text style={styles.sectionTitle}>Informazioni</Text>
        <FieldRow label="ID" value={user.id} />
        <FieldRow label="Ruolo" value={user.role} />
        <FieldRow label="Telefono" value={user.phone ?? '—'} />
        <FieldRow label="Creato" value={new Date(user.createdAt).toLocaleDateString('it-IT')} />
        <FieldRow label="Aggiornato" value={new Date(user.updatedAt).toLocaleDateString('it-IT')} />
      </Card>

      {/* Edit form */}
      {editing ? (
        <Card>
          <Text style={styles.sectionTitle}>Modifica</Text>

          <Text style={styles.inputLabel}>Nome</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="Nome"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.inputLabel}>Telefono</Text>
          <TextInput
            style={styles.input}
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="+39..."
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Ruolo</Text>
          <View style={styles.chips}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, editRole === r && styles.chipActive]}
                onPress={() => setEditRole(r)}
              >
                <Text style={[styles.chipText, editRole === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditing(false)}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Salva</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>✏️  Modifica</Text>
          </TouchableOpacity>
          {user.status !== 'suspended' && (
            <TouchableOpacity style={styles.suspendBtn} onPress={handleSuspend}>
              <Text style={styles.suspendBtnText}>⛔  Sospendi</Text>
            </TouchableOpacity>
          )}
          {user.status === 'suspended' && (
            <TouchableOpacity
              style={styles.activateBtn}
              onPress={async () => {
                try {
                  const updated = await usersApi.activate(userId);
                  setUser(updated);
                } catch {
                  Alert.alert('Errore', 'Operazione fallita');
                }
              }}
            >
              <Text style={styles.activateBtnText}>✅  Riattiva</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  profileHeader: { alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  email: { fontSize: fontSize.sm, color: colors.textSecondary },
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
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.highlight, borderColor: colors.highlight },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  editActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.highlight,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  actions: { gap: spacing.md },
  editBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
  suspendBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  suspendBtnText: { color: colors.error, fontWeight: '700', fontSize: fontSize.md },
  activateBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.success,
    alignItems: 'center',
  },
  activateBtnText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});
