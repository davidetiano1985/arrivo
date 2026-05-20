import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import { alertsApi } from '../api/alerts';
import { Alert as AlertType } from '../types';
import { colors, fontSize, radius, spacing } from '../components/theme';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '../api/client';

const SEVERITY_CONFIG = {
  low: { color: colors.info, icon: '🔵', label: 'BASSO' },
  medium: { color: colors.warning, icon: '🟡', label: 'MEDIO' },
  high: { color: colors.error, icon: '🔴', label: 'ALTO' },
  critical: { color: '#ff0000', icon: '💀', label: 'CRITICO' },
};

const TYPE_ICONS: Record<string, string> = {
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  security: '🔐',
};

function AlertRow({ alert, onResolve }: { alert: AlertType; onResolve: (id: string) => void }) {
  const sev = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
  return (
    <View style={[styles.alertCard, { borderLeftColor: sev.color }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertMeta}>
          <Text style={styles.alertTypeIcon}>{TYPE_ICONS[alert.type] ?? 'ℹ️'}</Text>
          <Text style={[styles.alertSeverity, { color: sev.color }]}>{sev.label}</Text>
        </View>
        {!alert.resolved && (
          <TouchableOpacity style={styles.resolveBtn} onPress={() => onResolve(alert.id)}>
            <Text style={styles.resolveBtnText}>Risolvi</Text>
          </TouchableOpacity>
        )}
        {alert.resolved && (
          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedText}>✓ Risolto</Text>
          </View>
        )}
      </View>
      <Text style={styles.alertMsg}>{alert.message}</Text>
      <Text style={styles.alertTime}>
        {new Date(alert.createdAt).toLocaleString('it-IT')}
      </Text>
    </View>
  );
}

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [liveConnected, setLiveConnected] = useState(false);
  const evtSourceRef = useRef<EventSource | null>(null);

  const load = useCallback(async () => {
    try {
      const resolved = filter === 'resolved' ? true : filter === 'open' ? false : undefined;
      const res = await alertsApi.list({ pageSize: 50, resolved });
      setAlerts(res.alerts ?? []);
      setTotal(res.total ?? 0);
    } catch {
      // silenzioso
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // SSE realtime stream (EventSource disponibile su RN 0.79+ con Hermes)
  useEffect(() => {
    let active = true;

    const connectSSE = async () => {
      try {
        if (typeof EventSource === 'undefined') {
          setLiveConnected(false);
          return;
        }
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token || !active) return;

        const url = `https://arrivoapp.it/api/admin/stream?token=${encodeURIComponent(token)}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const es = new (EventSource as any)(url);
        evtSourceRef.current = es;

        es.addEventListener('alert', (e: { data: string }) => {
          try {
            const newAlert: AlertType = JSON.parse(e.data);
            setAlerts((prev) => [newAlert, ...prev]);
            setLiveConnected(true);
          } catch {
            // ignora parse errors
          }
        });

        es.onerror = () => {
          setLiveConnected(false);
          es.close();
          if (active) {
            setTimeout(connectSSE, 5000);
          }
        };

        es.onopen = () => setLiveConnected(true);
      } catch {
        setLiveConnected(false);
      }
    };

    connectSSE();
    return () => {
      active = false;
      evtSourceRef.current?.close();
    };
  }, []);

  const handleResolve = async (id: string) => {
    RNAlert.alert('Risolvi alert', 'Segnare come risolto?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Risolvi',
        onPress: async () => {
          try {
            await alertsApi.resolve(id);
            setAlerts((prev) =>
              prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
            );
          } catch {
            RNAlert.alert('Errore', 'Operazione fallita');
          }
        },
      },
    ]);
  };

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: 'open', label: 'Aperti' },
    { key: 'resolved', label: 'Risolti' },
    { key: 'all', label: 'Tutti' },
  ];

  return (
    <View style={styles.container}>
      {/* Live indicator */}
      <View style={styles.liveBar}>
        <View style={[styles.liveDot, { backgroundColor: liveConnected ? colors.success : colors.textMuted }]} />
        <Text style={styles.liveText}>
          {liveConnected ? 'LIVE — stream attivo' : 'Offline — aggiornamento manuale'}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.total}>{total} tot.</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.highlight} size="large" />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => <AlertRow alert={item} onResolve={handleResolve} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.highlight}
              colors={[colors.highlight]}
            />
          }
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {filter === 'open' ? '✅ Nessun alert aperto' : 'Nessun alert trovato'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '600' },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.highlight, borderColor: colors.highlight },
  filterText: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  total: { marginLeft: 'auto', fontSize: fontSize.xs, color: colors.textMuted },
  list: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.md,
    gap: spacing.xs,
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alertTypeIcon: { fontSize: 16 },
  alertSeverity: { fontSize: fontSize.xs, fontWeight: '800', letterSpacing: 1 },
  resolveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  resolveBtnText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700' },
  resolvedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.textMuted + '20',
  },
  resolvedText: { color: colors.textMuted, fontSize: fontSize.xs },
  alertMsg: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  alertTime: { fontSize: fontSize.xs, color: colors.textMuted },
  separator: { height: 1, backgroundColor: colors.divider },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center' },
});
