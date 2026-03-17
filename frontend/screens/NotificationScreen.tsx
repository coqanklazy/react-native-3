import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ApiService } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  ORDER_NEW:       { icon: 'cart-plus',          color: '#16a34a' },
  ORDER_CONFIRMED: { icon: 'check-circle',       color: '#2563eb' },
  ORDER_PREPARING: { icon: 'package-variant',    color: '#8b5cf6' },
  ORDER_SHIPPING:  { icon: 'truck-delivery',     color: '#f59e0b' },
  ORDER_DELIVERED: { icon: 'package-variant-closed', color: '#10b981' },
  ORDER_CANCELLED: { icon: 'close-circle',       color: '#ef4444' },
  ORDER_CANCEL_REQUESTED: { icon: 'alert-circle-outline', color: '#f97316' },
  NEW_REVIEW:      { icon: 'star',               color: '#fbbf24' },
  DEFAULT:         { icon: 'bell',               color: '#6b7280' },
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setUnreadCount: setStoreCount } = useNotificationStore();

  const loadData = async () => {
    try {
      const res = await ApiService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        const count = res.data.unreadCount || 0;
        setUnreadCount(count);
        setStoreCount(count); // sync store
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleMarkRead = async (id: number) => {
    await ApiService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    const newCount = Math.max(0, unreadCount - 1);
    setUnreadCount(newCount);
    setStoreCount(newCount);
  };

  const handleMarkAll = async () => {
    await ApiService.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setStoreCount(0);
  };

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return new Date(d).toLocaleDateString('vi-VN');
  };

  const getIconInfo = (type: string) => TYPE_ICON[type] || TYPE_ICON.DEFAULT;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#dc2626', '#b91c1c']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>
              Thông báo {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAll}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Đọc tất cả</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#dc2626']} />}
        >
          {notifications.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <MaterialCommunityIcons name="bell-off-outline" size={64} color="#d1d5db" />
              <Text style={{ color: '#6b7280', fontSize: 16, marginTop: 16 }}>Chưa có thông báo</Text>
            </View>
          ) : (
            notifications.map((n) => {
              const { icon, color } = getIconInfo(n.type);
              return (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => !n.isRead && handleMarkRead(n.id)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row', alignItems: 'flex-start',
                    backgroundColor: n.isRead ? 'white' : '#fef2f2',
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: `${color}18`,
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    <MaterialCommunityIcons name={icon as any} size={22} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: n.isRead ? '500' : '700', color: '#1f2937', marginBottom: 3 }}>
                      {n.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 18 }}>{n.body}</Text>
                    <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{formatTime(n.createdAt)}</Text>
                  </View>
                  {!n.isRead && (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#dc2626', marginTop: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
};

export default NotificationScreen;
