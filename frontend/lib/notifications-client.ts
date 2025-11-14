/**
 * Client-side Notification Service
 * Handles notification operations without Redis cache
 */

import { supabase } from './supabase';

export type NotificationType =
  | 'red_case'
  | 'doctor_note'
  | 'follow_up'
  | 'status_update'
  | 'general';

export interface Notification {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  triage_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

/**
 * Client-side Notification Service (without caching)
 */
export const notificationService = {
  /**
   * Get notifications for a user (patient or doctor)
   */
  async getForUser(userId: string, userType: 'patient' | 'doctor', limit: number = 50): Promise<Notification[]> {
    try {
      const column = userType === 'patient' ? 'patient_id' : 'doctor_id';
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq(column, userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data as Notification[];
    } catch (error) {
      console.error('Exception fetching notifications:', error);
      return [];
    }
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string, userType: 'patient' | 'doctor'): Promise<number> {
    try {
      const column = userType === 'patient' ? 'patient_id' : 'doctor_id';
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq(column, userId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Exception fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception marking notification as read:', error);
      return false;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, userType: 'patient' | 'doctor'): Promise<boolean> {
    try {
      const column = userType === 'patient' ? 'patient_id' : 'doctor_id';
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq(column, userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception marking all notifications as read:', error);
      return false;
    }
  },

  /**
   * Delete notification
   */
  async delete(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception deleting notification:', error);
      return false;
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    userId: string,
    userType: 'patient' | 'doctor',
    callback: (notification: Notification) => void
  ) {
    const column = userType === 'patient' ? 'patient_id' : 'doctor_id';

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `${column}=eq.${userId}`,
        },
        (payload: any) => {
          const notification = payload.new as Notification;
          callback(notification);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from notifications
   */
  async unsubscribe(channel: any) {
    await supabase.removeChannel(channel);
  },
};
