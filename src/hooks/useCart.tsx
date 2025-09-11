import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId?: string;
  providerName?: string;
  price: number;
  quantity: number;
  serviceDetails?: any;
  // Add scheduling properties
  date?: string;
  time?: string;
  displayDate?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate or get session ID for guest users
const getGuestSessionId = (): string => {
  let sessionId = sessionStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLock, setLoadingLock] = useState(false);

  // Memoize computed values to prevent re-renders
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0), [items]);

  // Stable user ID and auth state references
  const userId = useMemo(() => user?.id, [user?.id]);
  const isAuthStable = useMemo(() => Boolean(isAuthenticated), [isAuthenticated]);

  const loadCartItems = useCallback(async () => {
    if (loadingLock || isLoading) return; // Prevent concurrent loads
    
    setLoadingLock(true);
    setIsLoading(true);
    
    try {
      console.log('🔄 Loading cart items. Authenticated:', isAuthStable, 'User ID:', userId, 'Time:', new Date().toISOString());
      
      if (isAuthStable && userId) {
        // Load from authenticated user cart
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Database error loading cart:', error);
          throw error;
        }

        const cartItems: CartItem[] = (data || []).map(item => ({
          id: item.id,
          serviceId: item.service_id,
          serviceName: item.service_name,
          providerId: item.provider_id,
          providerName: item.provider_name,
          price: Number(item.price),
          quantity: item.quantity,
          serviceDetails: item.service_details
        }));

        console.log('Loaded authenticated cart items:', cartItems.length);
        setItems(cartItems);
      } else {
        // Load from guest cart
        const guestSessionId = getGuestSessionId();
        console.log('Loading guest cart with session ID:', guestSessionId);
        
        try {
          const { data, error } = await supabase
            .from('guest_cart_items')
            .select('*')
            .eq('session_id', guestSessionId);

          if (error) {
            console.error('Database error loading guest cart:', error);
            throw error;
          }

          const cartItems: CartItem[] = (data || []).map(item => ({
            id: item.id,
            serviceId: item.service_id,
            serviceName: item.service_name,
            providerId: item.provider_id,
            providerName: item.provider_name,
            price: Number(item.price),
            quantity: item.quantity,
            serviceDetails: item.service_details
          }));

          console.log('Loaded guest cart items:', cartItems.length);
          setItems(cartItems);
        } catch (error) {
          console.log('Fallback to localStorage for guest cart');
          // Fallback to localStorage if database fails
          const localCart = localStorage.getItem('guest_cart');
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              setItems(Array.isArray(parsedCart) ? parsedCart : []);
              console.log('Loaded cart from localStorage:', parsedCart.length);
            } catch (parseError) {
              console.error('Error parsing localStorage cart:', parseError);
              setItems([]);
            }
          } else {
            setItems([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]); // Set empty array on error
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setLoadingLock(false);
    }
  }, [isAuthStable, userId, toast]);

  // Transfer guest cart to authenticated user
  const transferGuestCartToUser = useCallback(async () => {
    // Only proceed when authenticated and we have a userId
    if (!isAuthStable || !userId) return;
    
    try {
      const guestSessionId = getGuestSessionId();
      
      // 1) Transfer DB-based guest cart items
      const { data: guestItems, error: guestLoadError } = await supabase
        .from('guest_cart_items')
        .select('*')
        .eq('session_id', guestSessionId);

      if (guestLoadError) {
        console.warn('Error loading guest cart for transfer (will still try localStorage):', guestLoadError);
      }

      if (guestItems && guestItems.length > 0) {
        const userCartItems = guestItems.map(item => ({
          user_id: userId,
          service_id: item.service_id,
          service_name: item.service_name,
          provider_id: item.provider_id,
          provider_name: item.provider_name,
          price: item.price,
          quantity: item.quantity,
          service_details: item.service_details
        }));

        await supabase.from('cart_items').insert(userCartItems);

        // Clear guest cart table
        await supabase
          .from('guest_cart_items')
          .delete()
          .eq('session_id', guestSessionId);
      }

      // 2) Transfer any localStorage fallback items
      const localCartRaw = localStorage.getItem('guest_cart');
      if (localCartRaw) {
        try {
          const localCart: any[] = JSON.parse(localCartRaw);
          if (Array.isArray(localCart) && localCart.length > 0) {
            const userCartItemsFromLocal = localCart.map(it => ({
              user_id: userId,
              service_id: it.serviceId,
              service_name: it.serviceName,
              provider_id: it.providerId || null,
              provider_name: it.providerName || null,
              price: it.price,
              quantity: it.quantity || 1,
              service_details: it.serviceDetails || {}
            }));

            await supabase.from('cart_items').insert(userCartItemsFromLocal);
          }
        } catch (e) {
          console.warn('Failed parsing localStorage guest_cart during transfer:', e);
        }
        // Clear local storage cart regardless
        localStorage.removeItem('guest_cart');
      }

      // Reload cart items for the authenticated user
      await loadCartItems();
    } catch (error) {
      console.error('Error transferring guest cart:', error);
    }
  }, [isAuthStable, userId, loadCartItems]);

  // Load cart items on mount and auth changes, but wait for auth to finish loading
  useEffect(() => {
    if (!authLoading) {
      console.log('🚀 Auth loading finished, loading cart items...');
      // Add a small delay to ensure auth state is properly initialized
      const timer = setTimeout(() => {
        loadCartItems();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loadCartItems, authLoading]);

  // Transfer guest cart when user logs in
  useEffect(() => {
    if (isAuthStable && userId) {
      transferGuestCartToUser();
    }
  }, [isAuthStable, userId, transferGuestCartToUser]);

  const addToCart = useCallback(async (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('🛒 Cart Debug Info:', {
        isAuthenticated: isAuthStable,
        userId: userId,
        newItem: newItem,
        timestamp: new Date().toISOString()
      });
      
      console.log('🔍 Detailed item inspection:', {
        serviceId: newItem.serviceId,
        serviceIdType: typeof newItem.serviceId,
        serviceIdLength: newItem.serviceId?.length,
        providerId: newItem.providerId,
        providerIdType: typeof newItem.providerId,
        serviceName: newItem.serviceName,
        price: newItem.price,
        priceType: typeof newItem.price
      });
  
      // Check if item already exists
      const existingItem = items.find(item => 
        item.serviceId === newItem.serviceId && 
        item.providerId === newItem.providerId
      );
  
      if (existingItem) {
        // Update quantity - we'll implement this separately to avoid recursion
        const newQuantity = existingItem.quantity + 1;
        
        if (isAuthStable && userId) {
          await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id);
        } else {
          const guestSessionId = getGuestSessionId();
          await supabase
            .from('guest_cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id);
        }
        
        setItems(prev => prev.map(item => 
          item.id === existingItem.id ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        // Add new item
        if (isAuthStable && userId) {
          // For authenticated users, validate serviceId is UUID
          if (!newItem.serviceId) {
            throw new Error('Service ID is required');
          }
          
          // Ensure serviceId is a valid UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(newItem.serviceId)) {
            console.error('Invalid serviceId format:', newItem.serviceId);
            throw new Error('Invalid service ID format');
          }
          
          const insertData = {
            user_id: userId,
            service_id: newItem.serviceId,
            service_name: newItem.serviceName || 'Service',
            provider_id: uuidRegex.test(newItem.providerId ?? '') ? newItem.providerId : null,
            provider_name: newItem.providerName || null,
            price: newItem.price,
            quantity: 1,
            service_details: newItem.serviceDetails || {}
          };
            
          console.log('📊 Insert data for authenticated user:', insertData);
            
          const { data: insertedData, error: insertError } = await supabase
            .from('cart_items')
            .insert(insertData)
            .select()
            .single();
  
          if (insertError) {
            console.error('❌ Database insert error:', {
              error: insertError,
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              originalInsertData: insertData
            });
            throw insertError;
          }
            
          console.log('✅ Successfully inserted:', insertedData);
          const cartItem: CartItem = {
            id: insertedData.id,
            serviceId: insertedData.service_id,
            serviceName: insertedData.service_name,
            providerId: insertedData.provider_id,
            providerName: insertedData.provider_name,
            price: Number(insertedData.price),
            quantity: insertedData.quantity,
            serviceDetails: insertedData.service_details
          };
  
          setItems(prev => [...prev, cartItem]);
        } else {
          // Guest user
          const guestSessionId = getGuestSessionId();
          
          try {
            // Validate that we have a proper serviceId for guest users too
            if (!newItem.serviceId) {
              throw new Error('Service ID is required');
            }
            
            const { data: guestData, error: guestError } = await supabase
              .from('guest_cart_items')
              .insert({
                session_id: guestSessionId,
                service_id: newItem.serviceId,
                service_name: newItem.serviceName || 'Service',
                provider_id: (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).test(newItem.providerId ?? '') ? newItem.providerId : null,
                provider_name: newItem.providerName || null,
                price: newItem.price,
                quantity: 1,
                service_details: newItem.serviceDetails || {}
              })
              .select()
              .single();
  
            if (guestError) throw guestError;
  
            const cartItem: CartItem = {
              id: guestData.id,
              serviceId: guestData.service_id,
              serviceName: guestData.service_name,
              providerId: guestData.provider_id,
              providerName: guestData.provider_name,
              price: Number(guestData.price),
              quantity: guestData.quantity,
              serviceDetails: guestData.service_details
            };
  
            setItems(prev => [...prev, cartItem]);
          } catch (error) {
            // Fallback to localStorage
            const cartItem: CartItem = {
              id: `temp_${Date.now()}`,
              serviceId: newItem.serviceId,
              serviceName: newItem.serviceName,
              providerId: newItem.providerId,
              providerName: newItem.providerName,
              price: newItem.price,
              quantity: 1,
              serviceDetails: newItem.serviceDetails || {}
            };
  
            const updatedItems = [...items, cartItem];
            setItems(updatedItems);
            localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
          }
        }
      }
  
      toast({
        title: 'Added to cart',
        description: `${newItem.serviceName || 'Service'} has been added to your cart`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [items, isAuthStable, userId, isLoading, toast]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      if (isAuthStable && userId) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
      } else {
        const guestSessionId = getGuestSessionId();
        try {
          const { error } = await supabase
            .from('guest_cart_items')
            .delete()
            .eq('id', itemId);

          if (error) throw error;
        } catch (error) {
          // Fallback to localStorage
          const updatedItems = items.filter(item => item.id !== itemId);
          localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        }
      }

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthStable, userId, items, toast]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    setIsLoading(true);
    try {
      if (isAuthStable && userId) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);

        if (error) throw error;
      } else {
        const guestSessionId = getGuestSessionId();
        try {
          const { error } = await supabase
            .from('guest_cart_items')
            .update({ quantity })
            .eq('id', itemId);

          if (error) throw error;
        } catch (error) {
          // Fallback to localStorage
          const updatedItems = items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
          localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        }
      }

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthStable, userId, items, toast, removeFromCart]);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthStable && userId) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const guestSessionId = getGuestSessionId();
        try {
          const { error } = await supabase
            .from('guest_cart_items')
            .delete()
            .eq('session_id', guestSessionId);

          if (error) throw error;
        } catch (error) {
          // Clear localStorage
          localStorage.removeItem('guest_cart');
        }
      }

      setItems([]);
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthStable, userId, toast]);

  // Memoize context value to prevent re-renders
  const contextValue = useMemo(() => ({
    items,
    itemCount,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading
  }), [items, itemCount, totalAmount, addToCart, removeFromCart, updateQuantity, clearCart, isLoading]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};