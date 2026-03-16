import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons }     from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList }       from '../types/navigation';
import { ApiService }               from '../services/api';
import { PendingReviewItem, CreateReviewResponse } from '../types/api';

type Props = StackScreenProps<RootStackParamList, 'WriteReview'>;

const MIN_CHARS = 20;

// ─── StarRating ───────────────────────────────────────────────────────────────
const STAR_LABELS = ['', 'Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời!'];

interface StarRatingProps { rating: number; onRate: (r: number) => void; }

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate }) => (
  <View style={st.starWrap}>
    <View style={st.starRow}>
      {[1, 2, 3, 4, 5].map(s => (
        <TouchableOpacity key={s} onPress={() => onRate(s)} activeOpacity={0.7} style={st.starBtn}>
          <Ionicons
            name={s <= rating ? 'star' : 'star-outline'}
            size={40}
            color={s <= rating ? '#F59E0B' : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
    {rating > 0 && (
      <Text style={st.starLabel}>{STAR_LABELS[rating]}</Text>
    )}
  </View>
);

// ─── RewardModal ──────────────────────────────────────────────────────────────
interface RewardModalProps {
  visible: boolean; points: number; couponCode: string; couponDesc: string; onClose: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ visible, points, couponCode, couponDesc, onClose }) => {
  const scale = React.useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14 }).start();
    } else {
      scale.setValue(0.7);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={st.overlay}>
        <Animated.View style={[st.rewardCard, { transform: [{ scale }] }]}>
          <Text style={st.rewardEmoji}>🎉</Text>
          <Text style={st.rewardTitle}>Đánh giá thành công!</Text>
          <Text style={st.rewardSub}>Cảm ơn bạn đã chia sẻ cảm nhận</Text>

          <View style={st.rewardPoints}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={st.rewardPointsText}>+{points} điểm thưởng</Text>
          </View>
          <Text style={st.rewardPointsNote}>Đã cộng vào ví điểm của bạn</Text>

          <View style={st.rewardCouponBox}>
            <Text style={st.rewardCouponTitle}>🎟️ Mã giảm giá tặng bạn</Text>
            <View style={st.rewardCouponCode}>
              <Text style={st.rewardCouponCodeText}>{couponCode}</Text>
            </View>
            <Text style={st.rewardCouponDesc}>{couponDesc}</Text>
          </View>

          <TouchableOpacity style={st.rewardBtn} onPress={onClose}>
            <Text style={st.rewardBtnText}>Tuyệt! Đóng</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── ReviewCard ───────────────────────────────────────────────────────────────
interface ReviewCardProps { item: PendingReviewItem; orderId_numeric: number; onReviewed: () => void; }

const ReviewCard: React.FC<ReviewCardProps> = ({ item, orderId_numeric, onReviewed }) => {
  const [rating, setRating]         = useState(0);
  const [comment, setComment]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(item.alreadyReviewed);
  const [reward, setReward]         = useState<CreateReviewResponse | null>(null);
  const [showReward, setShowReward] = useState(false);

  const charCount   = comment.trim().length;
  const canSubmit   = rating > 0 && !submitting;

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Chú ý', 'Vui lòng chọn số sao (1–5)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ApiService.createReview({
        productId: item.productId,
        orderId:   orderId_numeric,
        rating,
        comment:   comment.trim(),
      });
      if (res.success && res.data) {
        setReward(res.data);
        setDone(true);
        if (res.data.reward) {
          setShowReward(true);
        } else {
          Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá sản phẩm!');
          onReviewed();
        }
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể gửi đánh giá');
      }
    } catch {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Locked: expired ──
  if (item.reviewExpired && !item.alreadyReviewed) {
    return (
      <View style={st.card}>
        <ProductRow item={item} />
        <View style={[st.badge, { backgroundColor: '#F3F4F6' }]}>
          <Ionicons name="time-outline" size={16} color="#9CA3AF" />
          <Text style={[st.badgeText, { color: '#9CA3AF' }]}>Đã hết thời hạn đánh giá (10 ngày)</Text>
        </View>
      </View>
    );
  }

  if (done) {
    return (
      <View style={st.card}>
        {reward && reward.reward && (
          <RewardModal
            visible={showReward}
            points={reward.reward.points}
            couponCode={reward.reward.couponCode}
            couponDesc={reward.reward.couponDescription}
            onClose={() => { setShowReward(false); onReviewed(); }}
          />
        )}
        <ProductRow item={item} />
        <View style={[st.badge, { backgroundColor: '#ECFDF5' }]}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={[st.badgeText, { color: '#059669' }]}>Đã đánh giá ✓</Text>
        </View>
      </View>
    );
  }

  // ── Active review form ──
  return (
    <>
      {reward && reward.reward && (
        <RewardModal
          visible={showReward}
          points={reward.reward.points}
          couponCode={reward.reward.couponCode}
          couponDesc={reward.reward.couponDescription}
          onClose={() => { setShowReward(false); onReviewed(); }}
        />
      )}

      <View style={st.card}>
        <ProductRow item={item} />

        {/* Countdown */}
        {item.daysLeft <= 3 && item.daysLeft > 0 && (
          <View style={st.urgentBanner}>
            <Ionicons name="alarm-outline" size={14} color="#EF4444" />
            <Text style={st.urgentText}>Còn {item.daysLeft} ngày để đánh giá – đừng bỏ lỡ thưởng!</Text>
          </View>
        )}

        {/* Stars */}
        <Text style={st.label}>Chất lượng sản phẩm *</Text>
        <StarRating rating={rating} onRate={setRating} />

        {/* Comment */}
        <Text style={st.label}>
          Nhận xét của bạn *
          <Text style={{ color: '#9CA3AF', fontWeight: '400' }}> (tối thiểu {MIN_CHARS} ký tự)</Text>
        </Text>
        <TextInput
          style={[
            st.textArea,
            charCount > 0 && charCount < MIN_CHARS && { borderColor: '#FCA5A5' },
            charCount >= MIN_CHARS && { borderColor: '#6EE7B7' },
          ]}
          placeholder="Chia sẻ cảm nhận thật của bạn về sản phẩm này..."
          placeholderTextColor="#9CA3AF"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          maxLength={500}
          textAlignVertical="top"
        />

        {/* Char counter */}
        <View style={st.charRow}>
          {charCount < MIN_CHARS && charCount > 0 ? (
            <Text style={st.charWarn}>Còn {MIN_CHARS - charCount} ký tự để đủ điều kiện nhận thưởng</Text>
          ) : charCount >= MIN_CHARS ? (
            <Text style={st.charOk}>✓ Đủ điều kiện nhận thưởng</Text>
          ) : (
            <Text style={st.charHint}>0/{MIN_CHARS} ký tự tối thiểu</Text>
          )}
          <Text style={st.charCount}>{comment.length}/500</Text>
        </View>

        {/* Reward hint */}
        <View style={st.rewardHint}>
          <Ionicons name="gift-outline" size={14} color="#DC2626" />
          <Text style={st.rewardHintText}>
            Chọn đủ sao + viết đủ {MIN_CHARS} ký tự → nhận <Text style={{ fontWeight: '800' }}>500 điểm</Text> + <Text style={{ fontWeight: '800' }}>mã giảm 10%</Text>
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[st.submitBtn, !canSubmit && st.submitBtnOff]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={st.submitText}>Gửi đánh giá</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

// Mini component for product image + name row
const ProductRow = ({ item }: { item: PendingReviewItem }) => (
  <View style={st.productRow}>
    <Image
      source={{ uri: item.productImage || 'https://via.placeholder.com/80' }}
      style={st.productImg}
      resizeMode="contain"
    />
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={st.productName} numberOfLines={2}>{item.productName}</Text>
      <Text style={st.productQty}>Số lượng: {item.quantity}</Text>
      {item.daysLeft > 3 && !item.alreadyReviewed && !item.reviewExpired && (
        <Text style={st.daysLeft}>⏳ Còn {item.daysLeft} ngày để đánh giá</Text>
      )}
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const WriteReviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId, orderId_numeric } = route.params;
  const [items, setItems]           = useState<PendingReviewItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [reviewedCount, setReviewed] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getPendingReviews(orderId_numeric);
      if (res.success && res.data) {
        setItems(res.data);
        setReviewed(res.data.filter(i => i.alreadyReviewed).length);
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [orderId_numeric]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const pendingCount = items.filter(i => !i.alreadyReviewed && !i.reviewExpired).length;
  const totalCount   = items.length;

  if (loading) {
    return (
      <View style={st.centered}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={{ color: '#9CA3AF', marginTop: 12 }}>Đang tải sản phẩm cần đánh giá...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={st.headerTitle}>Đánh giá sản phẩm</Text>
          <Text style={st.headerSub}>Đơn hàng #{orderId}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Reward banner */}
      <View style={st.topBanner}>
        <Ionicons name="gift-outline" size={16} color="#DC2626" />
        <Text style={st.topBannerText}>Mỗi đánh giá nhận ngay </Text>
        <Text style={st.topBannerBadge}>🌟 500 điểm</Text>
        <Text style={st.topBannerText}> + </Text>
        <Text style={st.topBannerBadge}>🎟️ Mã 10%</Text>
      </View>

      {/* Progress */}
      {totalCount > 0 && (
        <View style={st.progressWrap}>
          <View style={st.progressTrack}>
            <View style={[st.progressFill, { width: `${(reviewedCount / totalCount) * 100}%` }]} />
          </View>
          <Text style={st.progressText}>{reviewedCount}/{totalCount} sản phẩm đã đánh giá</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          /* Empty: order not delivered or no items */
          <View style={st.empty}>
            <Ionicons name="alert-circle-outline" size={60} color="#FCA5A5" />
            <Text style={st.emptyTitle}>Chưa có sản phẩm nào để đánh giá</Text>
            <Text style={st.emptySub}>
              Đơn hàng chưa được giao hoặc thời hạn đánh giá đã qua.
            </Text>
            <TouchableOpacity style={st.goBack} onPress={() => navigation.goBack()}>
              <Text style={st.goBackText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item, i) => (
            <ReviewCard
              key={`${item.productId}-${i}`}
              item={item}
              orderId_numeric={orderId_numeric}
              onReviewed={() => setReviewed(c => c + 1)}
            />
          ))
        )}

        {/* All done */}
        {pendingCount === 0 && totalCount > 0 && (
          <View style={st.allDone}>
            <Ionicons name="trophy-outline" size={36} color="#F59E0B" />
            <Text style={st.allDoneTitle}>
              {reviewedCount >= totalCount
                ? '🎉 Bạn đã đánh giá tất cả sản phẩm!'
                : 'Không còn sản phẩm nào có thể đánh giá'}
            </Text>
            <TouchableOpacity style={st.goBack} onPress={() => navigation.goBack()}>
              <Text style={st.goBackText}>Quay lại đơn hàng</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F3F4F6' },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },

  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  headerSub:   { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  topBanner: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: '#FECACA', gap: 4,
  },
  topBannerText:  { fontSize: 13, color: '#B91C1C' },
  topBannerBadge: {
    fontSize: 12, fontWeight: '700', color: '#DC2626',
    backgroundColor: '#FFF', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1, borderColor: '#FECACA',
  },

  progressWrap: {
    backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  progressTrack: {
    height: 6, backgroundColor: '#E5E7EB', borderRadius: 3,
    marginBottom: 6, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6B7280' },

  scroll: { padding: 12, paddingBottom: 40, gap: 12 },

  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  productRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  productImg:  { width: 68, height: 68, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  productName: { fontSize: 14, fontWeight: '600', color: '#1F2937', lineHeight: 20 },
  productQty:  { fontSize: 12, color: '#9CA3AF', marginTop: 3 },
  daysLeft:    { fontSize: 11, color: '#D97706', marginTop: 4, fontWeight: '600' },

  badge: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },

  urgentBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8, marginBottom: 12,
  },
  urgentText: { fontSize: 12, color: '#EF4444', flex: 1, marginLeft: 4 },

  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 4 },

  // Stars
  starWrap:  { alignItems: 'center', marginBottom: 14 },
  starRow:   { flexDirection: 'row', gap: 8 },
  starBtn:   { padding: 4 },
  starLabel: { marginTop: 8, fontSize: 15, color: '#F59E0B', fontWeight: '700' },

  // Text area
  textArea: {
    backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5E7EB', padding: 12, fontSize: 14, color: '#1F2937',
    minHeight: 110, lineHeight: 22,
  },

  charRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 10 },
  charHint:  { fontSize: 11, color: '#9CA3AF' },
  charWarn:  { fontSize: 11, color: '#EF4444', fontWeight: '500' },
  charOk:    { fontSize: 11, color: '#10B981', fontWeight: '600' },
  charCount: { fontSize: 11, color: '#9CA3AF' },

  rewardHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#FFF7ED', borderRadius: 10, padding: 10, marginBottom: 14,
  },
  rewardHintText: { fontSize: 12, color: '#92400E', flex: 1, lineHeight: 18, marginLeft: 4 },

  submitBtn: {
    flexDirection: 'row', backgroundColor: '#DC2626', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center', justifyContent: 'center',
  },
  submitBtnOff: { backgroundColor: '#FCA5A5' },
  submitText:   { fontSize: 15, color: '#FFF', fontWeight: '700' },

  // Empty
  empty:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginTop: 16, textAlign: 'center' },
  emptySub:   { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 20 },

  // All done
  allDone:      { alignItems: 'center', backgroundColor: '#FFF7ED', borderRadius: 16, padding: 24, marginTop: 8 },
  allDoneTitle: { fontSize: 15, fontWeight: '700', color: '#92400E', marginTop: 12, marginBottom: 16, textAlign: 'center' },

  goBack: {
    backgroundColor: '#DC2626', borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 12, marginTop: 8,
  },
  goBackText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Reward Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  rewardCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24,
    width: '100%', maxWidth: 360, alignItems: 'center',
  },
  rewardEmoji:       { fontSize: 52, marginBottom: 6 },
  rewardTitle:       { fontSize: 22, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  rewardSub:         { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20, textAlign: 'center' },
  rewardPoints:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  rewardPointsText:  { fontSize: 22, fontWeight: '800', color: '#D97706', marginLeft: 4 },
  rewardPointsNote:  { fontSize: 12, color: '#92400E', marginBottom: 16 },
  rewardCouponBox: {
    width: '100%', backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: '#FECACA', borderStyle: 'dashed',
    alignItems: 'center', marginBottom: 20,
  },
  rewardCouponTitle:    { fontSize: 13, fontWeight: '600', color: '#B91C1C', marginBottom: 10 },
  rewardCouponCode:     { backgroundColor: '#FFF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: '#FCA5A5', marginBottom: 8 },
  rewardCouponCodeText: { fontSize: 22, fontWeight: '900', color: '#DC2626', letterSpacing: 2 },
  rewardCouponDesc:     { fontSize: 11, color: '#EF4444', textAlign: 'center' },
  rewardBtn: {
    backgroundColor: '#DC2626', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center',
  },
  rewardBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default WriteReviewScreen;
