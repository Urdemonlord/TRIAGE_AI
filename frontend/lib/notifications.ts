/**
 * Notification Service
 * Handles notification creation, retrieval, and real-time updates
 */

import { supabase } from './supabase';
import { cacheService, cacheKeys, cacheTTL } from './redis';

export type NotificationType =
  | 'red_case'        // Critical triage case
  | 'doctor_note'     // Doctor added note
  | 'follow_up'       // Follow-up reminder
  | 'status_update'   // Triage status changed
  | 'general';        // General notification

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

export interface NotificationCreatePayload {
  patient_id?: string;
  doctor_id?: string;
  triage_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Notification Service
 */
export const notificationService = {
  /**
   * Create a new notification
   */
  async create(payload: NotificationCreatePayload): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          patient_id: payload.patient_id || null,
          doctor_id: payload.doctor_id || null,
          triage_id: payload.triage_id || null,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          read: false,
          metadata: payload.metadata || {},
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      // Invalidate cache
      if (payload.patient_id) {
        await cacheService.delete(cacheKeys.notifications(payload.patient_id));
        await cacheService.delete(cacheKeys.unreadNotifications(payload.patient_id));
      }
      if (payload.doctor_id) {
        await cacheService.delete(cacheKeys.notifications(payload.doctor_id));
        await cacheService.delete(cacheKeys.unreadNotifications(payload.doctor_id));
      }

      return data as Notification;
    } catch (error) {
      console.error('Exception creating notification:', error);
      return null;
    }
  },

  /**
   * Get notifications for a user (patient or doctor)
   */
  async getForUser(userId: string, userType: 'patient' | 'doctor', limit: number = 50): Promise<Notification[]> {
    try {
      // Try cache first
      const cacheKey = cacheKeys.notifications(userId);
      const cached = await cacheService.get<Notification[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from database
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

      const notifications = data as Notification[];

      // Cache the result
      await cacheService.set(cacheKey, notifications, cacheTTL.SHORT);

      return notifications;
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
      // Try cache first
      const cacheKey = cacheKeys.unreadNotifications(userId);
      const cached = await cacheService.get<number>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Fetch from database
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

      const unreadCount = count || 0;

      // Cache the result
      await cacheService.set(cacheKey, unreadCount, cacheTTL.SHORT);

      return unreadCount;
    } catch (error) {
      console.error('Exception fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      // Invalidate cache
      await cacheService.delete(cacheKeys.notifications(userId));
      await cacheService.delete(cacheKeys.unreadNotifications(userId));

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

      // Invalidate cache
      await cacheService.delete(cacheKeys.notifications(userId));
      await cacheService.delete(cacheKeys.unreadNotifications(userId));

      return true;
    } catch (error) {
      console.error('Exception marking all notifications as read:', error);
      return false;
    }
  },

  /**
   * Delete notification
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      // Invalidate cache
      await cacheService.delete(cacheKeys.notifications(userId));
      await cacheService.delete(cacheKeys.unreadNotifications(userId));

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

          // Invalidate cache when new notification arrives
          cacheService.delete(cacheKeys.notifications(userId));
          cacheService.delete(cacheKeys.unreadNotifications(userId));
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

/**
 * Notification Helper Functions
 */

/**
 * Create notification for red urgency triage
 */
export async function notifyRedUrgencyCase(
  triageId: string,
  patientName: string,
  complaint: string
): Promise<void> {
  // Notify all available doctors
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, user_id')
    .limit(100);

  if (!doctors) return;

  const notifications = doctors.map((doctor: any) => ({
    doctor_id: doctor.id,
    triage_id: triageId,
    type: 'red_case' as NotificationType,
    title: '🚨 Kasus Urgent',
    message: `Pasien ${patientName} membutuhkan penanganan segera: ${complaint.substring(0, 100)}...`,
    metadata: { urgency: 'Red', triageId },
  }));

  // Batch create notifications
  await supabase.from('notifications').insert(notifications);
}

/**
 * Create notification when doctor adds note
 */
export async function notifyDoctorNote(
  patientId: string,
  doctorName: string,
  triageId: string
): Promise<void> {
  await notificationService.create({
    patient_id: patientId,
    triage_id: triageId,
    type: 'doctor_note',
    title: '💬 Catatan Dokter',
    message: `Dr. ${doctorName} telah menambahkan catatan pada hasil triase Anda.`,
    metadata: { triageId },
  });
}

/**
 * Create notification for status update
 */
export async function notifyStatusUpdate(
  patientId: string,
  triageId: string,
  newStatus: string
): Promise<void> {
  await notificationService.create({
    patient_id: patientId,
    triage_id: triageId,
    type: 'status_update',
    title: '📋 Status Diperbarui',
    message: `Status triase Anda telah diperbarui menjadi: ${newStatus}`,
    metadata: { triageId, status: newStatus },
  });
}

/**
 * Create follow-up reminder notification
 */
export async function notifyFollowUp(
  patientId: string,
  triageId: string,
  message: string
): Promise<void> {
  await notificationService.create({
    patient_id: patientId,
    triage_id: triageId,
    type: 'follow_up',
    title: '⏰ Pengingat Follow-up',
    message,
    metadata: { triageId },
  });
}
