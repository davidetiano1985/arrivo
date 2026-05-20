import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { localiApi } from '../api/locali';
import { Locale, LocaliStackParamList } from '../types';
import { colors, fontSize, radius, spacing } from '../components/theme';

type Props = {
  navigation: NativeStackNavigationProp<LocaliStackParamList, 'LocaliList'>;
};

const STATUS_CONFIG = {
  active: { color: colors.success, icon: '🟢', label: 'Attivo' },
  inactive: { color: colors.textMuted, icon: '⚫', label: 'Inattivo' },
  maintenance: { color: colors.warning, icon: '🟡', label: 'Manutenzione' },
};

function LocaleRow({ locale, onPress }: { locale: Locale; onPress: () => void }) {
  const cfg = STATUS_CONFIG[locale.status] ?? STATUS_CONFIG.inactive;
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.rowIcon}>
        <Text style={styles.rowIconText}>🏢</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{locale.name}</Text>
        <Text style={styles.rowAddress} numberOfLines={1}>
          {locale.address ? `${locale.address}, ${locale.city ?? ''}` : locale.city ?? '—'}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.statusIcon}>{cfg.icon}</Text>
        <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        {locale.capacity && (
          <Text style={styles.capacity}>Cap. {locale.capacity}</Text>
        )}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function LocaliScreen({ navigation }: Props) {
  const [locali, setLocali] = useState<Locale[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q = search) => {
    try {
      const res = await localiApi.list({ pageSize: 100, search: q || undefined });
      setLocali(res.locali ?? []);
      setTotal(res.total ?? 0);
    } catch {
      // silenzioso
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const onSearch = (text: string) => {
    setSearch(text);
    load(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder="Cerca locale..."
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <Text style={styles.total}>{total} locali totali</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.highlight} size="large" />
        </View>
      ) : (
        <FlatList
          data={locali}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => (
            <LocaleRow
              locale={item}
              onPress={() => navigation.navigate('LocaleDetail', { localeId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.highlight}
              colors={[colors.highlight]}
            />
          }
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nessun locale trovato</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: { padding: spacing.md, paddingBottom: spacing.sm },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  total: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowIconText: { fontSize: 22 },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  rowAddress: { fontSize: fontSize.xs, color: colors.textSecondary },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  statusIcon: { fontSize: 12 },
  statusLabel: { fontSize: fontSize.xs, fontWeight: '600' },
  capacity: { fontSize: fontSize.xs, color: colors.textMuted },
  chevron: { color: colors.textMuted, fontSize: 22, marginLeft: -spacing.sm },
  separator: { height: 1, backgroundColor: colors.divider },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.md },
});
