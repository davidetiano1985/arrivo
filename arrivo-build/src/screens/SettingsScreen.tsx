import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/Card';
import { colors, fontSize, radius, spacing } from '../components/theme';

function SettingRow({
  label,
  value,
  onPress,
  danger,
  toggle,
  toggled,
  onToggle,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggled?: boolean;
  onToggle?: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !toggle}
    >
      <Text style={[styles.settingLabel, danger && { color: colors.error }]}>{label}</Text>
      {toggle ? (
        <Switch
          value={toggled}
          onValueChange={onToggle}
          trackColor={{ true: colors.highlight, false: colors.border }}
          thumbColor="#fff"
        />
      ) : value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name ?? user?.email ?? 'A').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
          <Text style={styles.profileRole}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Account */}
      <Card>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingRow label="Nome" value={user?.name ?? '—'} />
        <SettingRow label="Email" value={user?.email ?? '—'} />
        <SettingRow label="Ruolo" value={user?.role ?? '—'} />
        <SettingRow label="Stato account" value={user?.status ?? '—'} />
      </Card>

      {/* Preferenze */}
      <Card>
        <Text style={styles.sectionTitle}>Preferenze</Text>
        <SettingRow
          label="Notifiche push"
          toggle
          toggled={notificationsEnabled}
          onToggle={setNotificationsEnabled}
        />
        <SettingRow
          label="Aggiornamento automatico"
          toggle
          toggled={autoRefresh}
          onToggle={setAutoRefresh}
        />
      </Card>

      {/* Sistema */}
      <Card>
        <Text style={styles.sectionTitle}>Sistema</Text>
        <SettingRow label="Backend" value="arrivoapp.it/api" />
        <SettingRow label="Versione app" value="1.0.0" />
        <SettingRow label="Ambiente" value="Production" />
        <SettingRow label="Token" value="Criptato (SecureStore)" />
      </Card>

      {/* Sicurezza */}
      <Card>
        <Text style={styles.sectionTitle}>Sicurezza</Text>
        <View style={styles.securityItem}>
          <Text style={styles.securityIcon}>🔒</Text>
          <View style={styles.securityText}>
            <Text style={styles.securityLabel}>Token JWT criptato</Text>
            <Text style={styles.securityDesc}>Salvato con expo-secure-store</Text>
          </View>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityIcon}>🛡️</Text>
          <View style={styles.securityText}>
            <Text style={styles.securityLabel}>Connessione HTTPS</Text>
            <Text style={styles.securityDesc}>Tutti i dati trasmessi su TLS</Text>
          </View>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityIcon}>⏱️</Text>
          <View style={styles.securityText}>
            <Text style={styles.securityLabel}>Sessione automatica</Text>
            <Text style={styles.securityDesc}>Logout su token scaduto</Text>
          </View>
        </View>
      </Card>

      {/* Azioni */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪  Disconnetti</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>ARRIVO Admin · v1.0.0 · © 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  profileName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  profileEmail: { fontSize: fontSize.sm, color: colors.textSecondary },
  profileRole: { fontSize: fontSize.xs, color: colors.highlight, fontWeight: '600', letterSpacing: 1 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingLabel: { fontSize: fontSize.sm, color: colors.text },
  settingValue: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1, textAlign: 'right' },
  chevron: { color: colors.textMuted, fontSize: 20 },
  securityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
  securityIcon: { fontSize: 22, marginTop: 2 },
  securityText: { flex: 1, gap: 2 },
  securityLabel: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  securityDesc: { fontSize: fontSize.xs, color: colors.textSecondary },
  logoutBtn: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: fontSize.md },
  footer: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.xs },
});
