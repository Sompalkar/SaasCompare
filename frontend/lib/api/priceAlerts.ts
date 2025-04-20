import { apiClient } from './client';

export const priceAlertAPI = {
  /**
   * Subscribe to price alerts for a specific tool or all tools
   */
  subscribeToPriceAlerts: async (params: {
    toolId?: string;
    threshold?: number;
  }) => {
    try {
      const response = await apiClient.post('/api/price-alerts/subscribe', params);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to price alerts:', error);
      return { success: false, message: 'Failed to subscribe to price alerts' };
    }
  },

  /**
   * Unsubscribe from price alerts for a specific tool or all tools
   */
  unsubscribeFromPriceAlerts: async (params: {
    toolId?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/price-alerts/unsubscribe', params);
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from price alerts:', error);
      return { success: false, message: 'Failed to unsubscribe from price alerts' };
    }
  },

  /**
   * Update price alert threshold
   */
  updatePriceAlertThreshold: async (threshold: number) => {
    try {
      const response = await apiClient.patch('/api/price-alerts/threshold', { threshold });
      return response.data;
    } catch (error) {
      console.error('Error updating price alert threshold:', error);
      return { success: false, message: 'Failed to update price alert threshold' };
    }
  },

  /**
   * Get user's price alert preferences
   */
  getPriceAlertPreferences: async () => {
    try {
      const response = await apiClient.get('/api/price-alerts/preferences');
      return response.data;
    } catch (error) {
      console.error('Error getting price alert preferences:', error);
      return { success: false, message: 'Failed to get price alert preferences' };
    }
  },

  /**
   * Toggle weekly digest subscription
   */
  toggleWeeklyDigest: async (subscribe: boolean) => {
    try {
      const response = await apiClient.post('/api/price-alerts/weekly-digest', { subscribe });
      return response.data;
    } catch (error) {
      console.error('Error toggling weekly digest subscription:', error);
      return { success: false, message: 'Failed to toggle weekly digest subscription' };
    }
  },

  /**
   * Get user's price change notifications
   */
  getPriceChangeNotifications: async () => {
    try {
      const response = await apiClient.get('/api/price-alerts/notifications');
      return response.data;
    } catch (error) {
      console.error('Error getting price change notifications:', error);
      return { success: false, message: 'Failed to get price change notifications' };
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const response = await apiClient.patch(`/api/price-alerts/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'Failed to mark notification as read' };
    }
  }
}; 