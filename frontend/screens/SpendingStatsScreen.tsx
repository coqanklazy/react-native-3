import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ApiService } from '../services/api';

const { width } = Dimensions.get('window');

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const STAT_CARDS = [
  { key: 'pendingAmount', countKey: 'pendingCount', label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fffbeb', icon: 'clock-outline' },
  { key: 'shippingAmount', countKey: 'shippingCount', label: 'Đang giao', color: '#3b82f6', bg: '#eff6ff', icon: 'truck-delivery-outline' },
  { key: 'deliveredAmount', countKey: 'deliveredCount', label: 'Đã giao', color: '#16a34a', bg: '#f0fdf4', icon: 'check-circle-outline' },
  { key: 'cancelledAmount', countKey: 'cancelledCount', label: 'Đã huỷ', color: '#ef4444', bg: '#fef2f2', icon: 'close-circle-outline' },
];

const SpendingStatsScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const res = await ApiService.getSpendingStats();
      if (res.success && res.data) setStats(res.data);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  // Bar chart helpers
  const maxAmount = stats?.monthlySpending?.length
    ? Math.max(...stats.monthlySpending.map((m: any) => m.amount), 1)
    : 1;

  const formatMonth = (m: string) => {
    const [y, mo] = m.split('-');
    return `T${parseInt(mo)}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#dc2626', '#b91c1c']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>Thống kê dòng tiền</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : !stats ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Không thể tải dữ liệu</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStats(); }} colors={['#dc2626']} />}
        >
          {/* Summary card - Now only shows Delivered Amount */}
          <LinearGradient colors={['#dc2626', '#b91c1c']} style={{ marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 }}>Tổng chi tiêu</Text>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '800' }}>{formatCurrency(stats.deliveredAmount)}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>{stats.deliveredCount} đơn hàng giao thành công</Text>
          </LinearGradient>

          {/* Status breakdown - Only showing active/pending categories */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 16, gap: 12 }}>
            {STAT_CARDS.filter(c => c.key !== 'cancelledAmount' && c.key !== 'deliveredAmount').map((card) => (
              <View key={card.key} style={{
                width: width - 32,
                backgroundColor: card.bg,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: `${card.color}22`,
                shadowColor: card.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ backgroundColor: 'white', padding: 6, borderRadius: 8 }}>
                    <MaterialCommunityIcons name={card.icon as any} size={20} color={card.color} />
                  </View>
                  <Text style={{ fontSize: 14, color: card.color, fontWeight: '700', marginLeft: 10 }}>{card.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#1f2937' }}>
                    {formatCurrency(stats[card.key] || 0)}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
                    {stats[card.countKey] || 0} đơn hàng
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Monthly ledger - Showing trend of SHIPPED/DELIVERED spending only */}
          {stats.monthlySpending?.length > 0 && (
            <View style={{ backgroundColor: 'white', marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#1f2937' }}>Chi tiêu thành công (%)</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Dự trên đơn hàng đã giao hoàn tất</Text>
                </View>
                <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#dc2626' }}>Tháng</Text>
                </View>
              </View>

              {/* Chart Container */}
              <View style={{ height: 220, width: '100%', position: 'relative' }}>
                {/* Y-Axis Labels & Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                  <View key={idx} style={{ position: 'absolute', top: `${(1 - p) * 100}%`, left: 0, right: 0, borderTopWidth: 1, borderTopColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#9ca3af', width: 35, textAlign: 'left', marginTop: -12 }}>
                      {Math.round((maxAmount * p) / 1000)}k
                    </Text>
                  </View>
                ))}

                {/* The Chart (Simple Line & Area Simulation) */}
                <View style={{ flex: 1, marginLeft: 35, marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  {stats.monthlySpending.map((m: any, i: number) => {
                    const height = (m.amount / maxAmount) * 160;
                    const isLast = i === stats.monthlySpending.length - 1;
                    const isMax = m.amount === maxAmount;

                    return (
                      <View key={i} style={{ flex: 1, alignItems: 'center', position: 'relative' }}>
                        {/* Vertical line connection simulation */}
                        <View style={{
                          height: height,
                          width: 2,
                          backgroundColor: isMax ? '#dc2626' : '#fee2e2',
                          position: 'relative'
                        }}>
                          {/* Dot at top */}
                          <View style={{
                            position: 'absolute', top: -4, left: -3, width: 8, height: 8, borderRadius: 4,
                            backgroundColor: isMax ? '#dc2626' : '#fca5a5',
                            borderWidth: 2, borderColor: 'white',
                            zIndex: 10
                          }} />
                        </View>

                        {/* Month Label */}
                        <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 8, fontWeight: isMax ? '700' : '400' }}>
                          T{m.month.split('-')[1]}
                        </Text>

                        {/* Highlighting Card for Max Month */}
                        {isMax && (
                          <View style={{
                            position: 'absolute', top: -45,
                            backgroundColor: 'white', padding: 6, borderRadius: 8,
                            shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
                            borderWidth: 1, borderColor: '#f3f4f6', width: 80, alignItems: 'center',
                            zIndex: 20
                          }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#1f2937' }}>{formatCurrency(m.amount)}</Text>
                            <View style={{ width: 0, height: 0, borderLeftWidth: 5, borderLeftColor: 'transparent', borderRightWidth: 5, borderRightColor: 'transparent', borderTopWidth: 5, borderTopColor: 'white', position: 'absolute', bottom: -5 }} />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 10, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="trending-up" size={16} color="#16a34a" />
                  <Text style={{ fontSize: 13, color: '#374151', marginLeft: 6 }}>
                    Mức chi tiêu cao nhất đạt <Text style={{ fontWeight: '800', color: '#dc2626' }}>{formatCurrency(maxAmount)}</Text>
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
};

export default SpendingStatsScreen;
