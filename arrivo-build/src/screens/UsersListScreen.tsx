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
import { usersApi } from '../api/users';
import { User, UsersStackParamList } from '../types';
import { colors, fontSize, radius, spacing } from '../components/theme';

type Props = {
  navigation: NativeStackNavigationProp<UsersStackParamList, 'UsersList'>;
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#7c3aed',
  manager: '#0f3460',
  staff: '#0891b2',
  user: '#374151',
};

const STATUS_COLORS: Record<string, string> = {
  active: colors.success,
  inactive: colors.textMuted,
  suspended: colors.error,
};

function UserRow({ user, onPress }: { user: User; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[user.role] ?? '#374151' }]}>
        <Text style={styles.avatarText}>
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{user.name ?? '—'}</Text>
        <Text style={styles.rowEmail} numberOfLines={1}>{user.email}</Text>
      </View>
      <View style={styles.rowBadges}>
        <View style={[styles.badge, { backgroundColor: ROLE_COLORS[user.role] + '30' }]}>
          <Text style={[styles.badgeText, { color: ROLE_COLORS[user.role] }]}>
            {user.role}
          </Text>
        </View>
        <View style={[styles.dot, { backgroundColor: STATUS_COLORS[user.status] }]} />
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function UsersListScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  const loadUsers = useCallback(async (p = 1, q = search, reset = false) => {
    if (p === 1) setIsLoading(true);
    else setLoadingMore(true);

    try {
      const res = await usersApi.list({ page: p, pageSize: PAGE_SIZE, search: q || undefined });
      const list = res.users ?? [];
      setUsers(reset || p === 1 ? list : (prev) => [...prev, ...list]);
      setTotal(res.total ?? 0);
      setPage(p);
      setHasMore(list.length === PAGE_SIZE);
    } catch {
      // silenzioso
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers(1, search, true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(1, search, true);
  }, [loadUsers, search]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadUsers(page + 1, search);
    }
  }, [loadingMore, hasMore, page, loadUsers, search]);

  const onSearch = useCallback((text: string) => {
    setSearch(text);
    loadUsers(1, text, true);
  }, [loadUsers]);

  return (
    <View style={styles.container}>
      {/* Searchbar */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearch}
          placeholder="Cerca utente..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <Text style={styles.total}>{total} utenti totali</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.highlight} size="large" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
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
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.highlight} style={{ margin: spacing.md }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nessun utente trovato</Text>
            </View>
          }
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  rowEmail: { fontSize: fontSize.xs, color: colors.textSecondary },
  rowBadges: { alignItems: 'flex-end', gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chevron: { color: colors.textMuted, fontSize: 22, marginLeft: -spacing.sm },
  separator: { height: 1, backgroundColor: colors.divider },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.md },
});
