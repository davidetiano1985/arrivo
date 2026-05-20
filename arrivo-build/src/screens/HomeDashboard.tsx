import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { dashboardApi } from '../api/alerts';
import { useAuth } from '../auth/AuthContext';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { colors, fontSize, spacing } from '../components/theme';
import { DashboardStats } from '../types';

export function HomeDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await dashboardApi.stats();
      setStats(data);
      setLastUpdated(new Date());
    } catch {
      // ignora errori di rete silenziosi
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Vuoi uscire dal pannello?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: logout },
    ]);
  };

  const systemStatus = stats
    ? stats.criticalAlerts > 0
      ? { label: 'CRITICO', color: colors.error }
      : stats.openAlerts > 0
      ? { label: 'ATTENZIONE', color: colors.warning }
      : { label: 'OPERATIVO', color: colors.success }
    : { label: 'CARICAMENTO', color: colors.textMuted };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Benvenuto, {user?.name ?? 'Admin'}</Text>
          <Text style={styles.role}>{user?.role?.toUpperCase() ?? '—'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Esci</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.highlight}
            colors={[colors.highlight]}
          />
        }
      >
        {/* Sistema Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Stato Sistema</Text>
            <View style={[styles.statusDot, { backgroundColor: systemStatus.color }]} />
          </View>
          <Text style={[styles.statusValue, { color: systemStatus.color }]}>
            {systemStatus.label}
          </Text>
          {lastUpdated && (
            <Text style={styles.updatedText}>
              Aggiornato: {lastUpdated.toLocaleTimeString('it-IT')}
            </Text>
          )}
        </Card>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Statistiche</Text>

        {isLoading ? (
          <View style={styles.loadingGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard
                label="Utenti Totali"
                value={stats?.totalUsers ?? 0}
                icon="👥"
                color={colors.info}
              />
              <StatCard
                label="Utenti Attivi"
                value={stats?.activeUsers ?? 0}
                icon="✅"
                color={colors.success}
              />
            </View>
            <View style={styles.grid}>
              <StatCard
                label="Locali Totali"
                value={stats?.totalLocali ?? 0}
                icon="🏢"
                color={colors.highlight}
              />
              <StatCard
                label="Locali Attivi"
                value={stats?.activeLocali ?? 0}
                icon="🟢"
                color={colors.success}
              />
            </View>
            <View style={styles.grid}>
              <StatCard
                label="Alert Aperti"
                value={stats?.openAlerts ?? 0}
                icon="🔔"
                color={stats?.openAlerts ? colors.warning : colors.success}
              />
              <StatCard
                label="Alert Critici"
                value={stats?.criticalAlerts ?? 0}
                icon="🚨"
                color={stats?.criticalAlerts ? colors.error : colors.success}
              />
            </View>
          </>
        )}

        {/* Quick Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>📡 ARRIVO Backend</Text>
          <Text style={styles.infoUrl}>arrivoapp.it/api</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Log recenti</Text>
            <Text style={styles.infoValue}>{stats?.recentLogs ?? '—'}</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  role: { fontSize: fontSize.xs, color: colors.highlight, marginTop: 2, letterSpacing: 1 },
  logoutBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: { color: colors.error, fontSize: fontSize.sm, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  statusCard: { gap: 4 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusValue: { fontSize: fontSize.xxl, fontWeight: '800' },
  updatedText: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  grid: { flexDirection: 'row', gap: spacing.md },
  loadingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  skeletonCard: {
    flex: 1,
    height: 110,
    backgroundColor: colors.card,
    borderRadius: 10,
    minWidth: 140,
    opacity: 0.5,
  },
  infoCard: { gap: 8 },
  infoTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  infoUrl: { fontSize: fontSize.sm, color: colors.highlight },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  infoLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  infoValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
});
