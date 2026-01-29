import { Platform } from 'react-native';
import { BASE_URL } from '../services/api';

/**
 * Fixes the image URL for Android Emulator (localhost -> 10.0.2.2)
 * and optionally adds a timestamp for cache busting.
 * Also handles relative paths from DB.
 */
export const getAvatarUrl = (url?: string | null, bustCache = false) => {
    if (!url) return null;

    let finalUrl = url;

    // Handle relative paths (e.g., /uploads/...)
    if (finalUrl.startsWith('/')) {
        finalUrl = `${BASE_URL}${finalUrl}`;
    }

    // Fix localhost on Android (if somehow it's still absolute localhost)
    if (Platform.OS === 'android' && finalUrl.includes('localhost')) {
        finalUrl = finalUrl.replace('localhost', '10.0.2.2');
    }

    // Add cache busting
    if (bustCache) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl = `${finalUrl}${separator}t=${new Date().getTime()}`;
    }

    return finalUrl;
};
