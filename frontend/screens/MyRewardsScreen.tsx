import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView }        from 'react-native-safe-area-context';
import { Ionicons }            from '@expo/vector-icons';
import { StackScreenProps }    from '@react-navigation/stack';
import { RootStackParamList }  from '../types/navigation';
import { ApiService }          from '../services/api';
import { useFocusEffect }      from '@react-navigation/native';

type Props = StackScreenProps<RootStackParamList, 'MyRewards'>;

interface RewardData {
  points:  { total: number; used: number; balance: number };
  coupons: Array<{
    id: number; code: string; discount_type: string;
    discount_value: number; max_discount_amount: number;
    min_order_amount: number;
    is_used: number; expires_at: string | null; source: string;
  }>;
  history: Array<{
    id: number; points: number; type: string;
    description: string; created_at: string;
  }>;
}

const TAB_KEYS = ['coupons', 'history'] as const;
type TabKey = typeof TAB_KEYS[number];

const MyRewardsScreen: React.FC<Props> = ({ navigation }) => {
  const [data, setData]           = useState<RewardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]             = useState<TabKey>('coupons');

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await ApiService.getMyRewards();
      if (res.success && res.data) setData(res.data as RewardData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const activeCoupons  = data?.coupons.filter(c => !c.is_used && (!c.expires_at || new Date(c.expires_at) > new Date())) ?? [];
  const usedCoupons    = data?.coupons.filter(c => c.is_used || (c.expires_at && new Date(c.expires_at) <= new Date())) ?? [];

  if (loading) {
    return (
      <View style={st.centered}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  const pts = data?.points ?? { balance: 0 };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Điểm & Ưu đãi của tôi</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} colors={['#DC2626']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Points card */}
        <View style={st.pointsCard}>
          <View style={st.pointsTop}>
            <Ionicons name="star" size={28} color="#F59E0B" />
            <Text style={st.pointsBalance}>{pts.balance.toLocaleString()}</Text>
            <Text style={st.pointsUnit}>điểm hiện có</Text>
          </View>
          <Text style={st.pointsNote}>💡 Dùng điểm khi thanh toán – 1 điểm = 1đ</Text>
        </View>

        {/* Tabs */}
        <View style={st.tabs}>
          <TouchableOpacity
            style={[st.tab, tab === 'coupons' && st.tabActive]}
            onPress={() => setTab('coupons')}
          >
            <Text style={[st.tabText, tab === 'coupons' && st.tabTextActive]}>
              🎟️ Mã giảm giá ({activeCoupons.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.tab, tab === 'history' && st.tabActive]}
            onPress={() => setTab('history')}
          >
            <Text style={[st.tabText, tab === 'history' && st.tabTextActive]}>
              📋 Lịch sử điểm
            </Text>
          </TouchableOpacity>
        </View>

        <View style={st.listPad}>
          {/* ── Coupons tab ── */}
          {tab === 'coupons' && (
            <>
              {activeCoupons.length === 0 && usedCoupons.length === 0 ? (
                <EmptyBox icon="ticket-outline" text="Bạn chưa có mã giảm giá nào" sub="Hãy đánh giá sản phẩm để nhận mã ngay!" />
              ) : (
                <>
                  {activeCoupons.map(c => (
                    <CouponCard key={c.id} coupon={c} active />
                  ))}
                  {usedCoupons.length > 0 && (
                    <>
                      <Text style={st.sectionTitle}>Đã dùng / Hết hạn</Text>
                      {usedCoupons.map(c => (
                        <CouponCard key={c.id} coupon={c} active={false} />
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ── History tab ── */}
          {tab === 'history' && (
            <>
              {(data?.history ?? []).length === 0 ? (
                <EmptyBox icon="time-outline" text="Chưa có lịch sử điểm" sub="Đánh giá sản phẩm hoặc hoàn thành đơn hàng để tích điểm!" />
              ) : (
                data!.history.map(h => (
                  <View key={h.id} style={st.historyRow}>
                    <View style={[st.historyDot, { backgroundColor: h.points > 0 ? '#10B981' : '#EF4444' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={st.historyDesc}>{h.description}</Text>
                      <Text style={st.historyDate}>
                        {new Date(h.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Text>
                    </View>
                    <Text style={[st.historyPoints, { color: h.points > 0 ? '#10B981' : '#EF4444' }]}>
                      {h.points > 0 ? '+' : ''}{h.points.toLocaleString()} điểm
                    </Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── CouponCard ─────────────────────────────────────────────────────────────────
const CouponCard = ({ coupon, active }: { coupon: any; active: boolean }) => {
  const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
  const daysLeft  = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Toast.show({
      type: 'success',
      text1: 'Sao chép thành công',
      text2: `Mã ${code} đã được lưu vào bộ nhớ tạm`,
      position: 'bottom',
    });
  };

  return (
    <View style={[st.couponCard, !active && st.couponCardUsed]}>
      {/* Left ticket stub */}
      <View style={[st.couponLeft, !active && { backgroundColor: '#F3F4F6' }]}>
        <Text style={[st.couponPct, !active && { color: '#9CA3AF' }]}>
          {coupon.discount_type === 'PERCENT' ? `${coupon.discount_value}%` : `${parseInt(coupon.discount_value).toLocaleString()}đ`}
        </Text>
        <Text style={[st.couponOff, !active && { color: '#9CA3AF' }]}>GIẢM</Text>
      </View>

      {/* Divider */}
      <View style={st.couponDivider} />

      {/* Right info */}
      <View style={st.couponRight}>
        <View style={st.couponCodeWrap}>
          <Text style={[st.couponCode, !active && { color: '#9CA3AF' }]}>{coupon.code}</Text>
          {active && <View style={st.activeDot} />}
          {active && (
            <TouchableOpacity 
              onPress={() => handleCopy(coupon.code)}
              style={st.copyBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="copy-outline" size={16} color="#DC2626" />
              <Text style={st.copyText}>Sao chép</Text>
            </TouchableOpacity>
          )}
        </View>

        {parseInt(coupon.min_order_amount) > 0 && (
          <Text style={st.couponRequirement}>
            📍 Đơn tối thiểu {parseInt(coupon.min_order_amount).toLocaleString()}đ
          </Text>
        )}
        {coupon.max_discount_amount > 0 && (
          <Text style={st.couponSub}>
            🎁 Giảm tối đa {parseInt(coupon.max_discount_amount).toLocaleString()}đ
          </Text>
        )}
        {coupon.source === 'REVIEW_REWARD' && (
          <Text style={st.couponSource}>🌟 Thưởng đánh giá sản phẩm</Text>
        )}

        {active && expiresAt && (
          <Text style={[st.couponExpiry, !!daysLeft && daysLeft <= 5 && { color: '#EF4444' }]}>
          {!!daysLeft && daysLeft <= 5 ? `⚠️ Còn ${daysLeft} ngày` : `HSD: ${expiresAt!.toLocaleDateString('vi-VN')}`}
          </Text>
        )}
        {!active && (
          <Text style={st.couponUsed}>{coupon.is_used ? '✓ Đã sử dụng' : '✗ Hết hạn'}</Text>
        )}
      </View>
    </View>
  );
};

const EmptyBox = ({ icon, text, sub }: { icon: any; text: string; sub: string }) => (
  <View style={st.empty}>
    <Ionicons name={icon} size={56} color="#D1D5DB" />
    <Text style={st.emptyTitle}>{text}</Text>
    <Text style={st.emptySub}>{sub}</Text>
  </View>
);

// ── Styles ─────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },

  // Points card
  pointsCard: {
    margin: 12, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626', shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  pointsTop: {
    alignItems: 'center', paddingTop: 24, paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  pointsBalance: { fontSize: 52, fontWeight: '900', color: '#FFF', marginVertical: 4 },
  pointsUnit:    { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  pointsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 14, paddingHorizontal: 20,
  },
  pointsStat:    { flex: 1, alignItems: 'center' },
  pointsStatVal: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  pointsStatLbl: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  pointsDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  pointsNote: {
    textAlign: 'center', paddingVertical: 10,
    fontSize: 12, color: 'rgba(255,255,255,0.8)',
  },

  // Tabs
  tabs:         { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 12, borderRadius: 14, padding: 4, marginBottom: 4 },
  tab:          { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabActive:    { backgroundColor: '#FEF2F2' },
  tabText:      { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabTextActive:{ color: '#DC2626', fontWeight: '700' },

  listPad: { paddingHorizontal: 12, paddingBottom: 40, paddingTop: 4, gap: 10 },
  sectionTitle: { fontSize: 13, color: '#9CA3AF', fontWeight: '600', marginTop: 8, marginBottom: 2 },

  // Coupon card
  couponCard: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: '#FECACA',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  couponCardUsed: { borderColor: '#E5E7EB', opacity: 0.65 },
  couponLeft: {
    width: 80, backgroundColor: '#DC2626',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  couponPct:  { fontSize: 22, fontWeight: '900', color: '#FFF' },
  couponOff:  { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: 1 },
  couponDivider: {
    width: 1, borderStyle: 'dashed', borderWidth: 1,
    borderColor: '#E5E7EB', marginVertical: 10,
  },
  couponRight:    { flex: 1, padding: 12, justifyContent: 'center' },
  couponCodeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  couponCode:     { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  activeDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  copyBtn:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 'auto' },
  copyText:       { fontSize: 11, fontWeight: '700', color: '#DC2626', marginLeft: 4 },
  couponRequirement: { fontSize: 11, color: '#DC2626', fontWeight: '600', marginBottom: 2 },
  couponSub:      { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  couponSource:   { fontSize: 11, color: '#D97706' },
  couponExpiry:   { fontSize: 11, color: '#6B7280', marginTop: 4 },
  couponUsed:     { fontSize: 11, color: '#9CA3AF', marginTop: 4 },

  // History
  historyRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, padding: 14, gap: 10,
  },
  historyDot:    { width: 10, height: 10, borderRadius: 5 },
  historyDesc:   { fontSize: 13, color: '#1F2937', fontWeight: '500' },
  historyDate:   { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  historyPoints: { fontSize: 14, fontWeight: '800' },

  // Empty
  empty:      { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginTop: 14, textAlign: 'center' },
  emptySub:   { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

export default MyRewardsScreen;
