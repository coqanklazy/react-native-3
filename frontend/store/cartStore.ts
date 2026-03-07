import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/api';

export interface CartItem {
    product: Product;
    quantity: number;
    selected?: boolean;
}

interface CartState {
    carts: Record<string, CartItem[]>; // Map of userId to CartItem array
    addToCart: (userId: string | number, product: Product, quantity?: number) => void;
    removeFromCart: (userId: string | number, productId: number) => void;
    updateQuantity: (userId: string | number, productId: number, quantity: number) => void;
    clearCart: (userId: string | number) => void;
    getTotalItems: (userId: string | number) => number;
    getTotalPrice: (userId: string | number) => number;
    getCartItems: (userId: string | number) => CartItem[];
    toggleItemSelection: (userId: string | number, productId: number) => void;
    toggleAllSelection: (userId: string | number, isSelected: boolean) => void;
    getSelectedTotalItems: (userId: string | number) => number;
    getSelectedTotalPrice: (userId: string | number) => number;
    clearSelectedCart: (userId: string | number) => void;
    resetStore: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            carts: {},
            getCartItems: (userId: string | number) => {
                return get().carts[String(userId)] || [];
            },
            addToCart: (userId: string | number, product: Product, quantity: number = 1) => {
                set((state) => {
                    const uid = String(userId);
                    const userCart = state.carts[uid] || [];
                    const newItems = [...userCart];
                    // Since React Native state updates are asynchronous, using functional updates (state) ensures we have latest values
                    const existingItemIndex = newItems.findIndex(item => item.product.id === product.id);

                    if (existingItemIndex >= 0) {
                        newItems[existingItemIndex].quantity += quantity;
                        newItems[existingItemIndex].product = product; // Update with latest product data
                    } else {
                        newItems.push({ product, quantity, selected: true });
                    }

                    return { carts: { ...state.carts, [uid]: newItems } };
                });
            },
            removeFromCart: (userId: string | number, productId: number) => {
                set((state) => {
                    const uid = String(userId);
                    const userCart = state.carts[uid] || [];
                    return {
                        carts: {
                            ...state.carts,
                            [uid]: userCart.filter(item => item.product.id !== productId)
                        }
                    };
                });
            },
            updateQuantity: (userId: string | number, productId: number, quantity: number) => {
                set((state) => {
                    const uid = String(userId);
                    const userCart = state.carts[uid] || [];
                    return {
                        carts: {
                            ...state.carts,
                            [uid]: userCart.map(item =>
                                item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
                            )
                        }
                    };
                });
            },
            clearCart: (userId: string | number) => {
                set((state) => ({
                    carts: { ...state.carts, [String(userId)]: [] }
                }));
            },
            getTotalItems: (userId: string | number) => {
                const userCart = get().carts[String(userId)] || [];
                // Return total number of unique products in cart
                return userCart.length;
            },
            getTotalPrice: (userId: string | number) => {
                const userCart = get().carts[String(userId)] || [];
                return userCart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
            },
            toggleItemSelection: (userId: string | number, productId: number) => {
                set((state) => {
                    const uid = String(userId);
                    const userCart = state.carts[uid] || [];
                    return {
                        carts: {
                            ...state.carts,
                            [uid]: userCart.map(item =>
                                item.product.id === productId ? { ...item, selected: !item.selected } : item
                            )
                        }
                    };
                });
            },
            toggleAllSelection: (userId: string | number, isSelected: boolean) => {
                set((state) => {
                    const uid = String(userId);
                    const userCart = state.carts[uid] || [];
                    return {
                        carts: {
                            ...state.carts,
                            [uid]: userCart.map(item => ({ ...item, selected: isSelected }))
                        }
                    };
                });
            },
            getSelectedTotalItems: (userId: string | number) => {
                const userCart = get().carts[String(userId)] || [];
                return userCart.filter(item => item.selected !== false).length;
            },
            getSelectedTotalPrice: (userId: string | number) => {
                const userCart = get().carts[String(userId)] || [];
                return userCart.filter(item => item.selected !== false).reduce((total, item) => total + (item.product.price * item.quantity), 0);
            },
            clearSelectedCart: (userId: string | number) => {
                set((state) => {
                    const uid = String(userId);
                    const userCart = state.carts[uid] || [];
                    return {
                        carts: {
                            ...state.carts,
                            [uid]: userCart.filter(item => item.selected === false)
                        }
                    };
                });
            },
            resetStore: () => {
                set({ carts: {} });
            }
        }),
        {
            name: 'cart-storage-v2',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
