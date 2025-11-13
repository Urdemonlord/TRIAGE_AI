'use client';

import { useEffect, useState } from 'react';
import { triageSessionService, triageNoteService } from '@/lib/db';
import type { TriageSession, TriageNote } from '@/lib/db';

export function useTriageSessions(patientId: string | null) {
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data, error } = await triageSessionService.getByPatientId(patientId);
        if (error) throw error;
        setSessions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [patientId]);

  return { sessions, loading, error, refetch: () => {} };
}

export function useTriageSession(sessionId: string | null) {
  const [session, setSession] = useState<TriageSession | null>(null);
  const [notes, setNotes] = useState<TriageNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      setLoading(true);
      try {
        const { data: sessionData, error: sessionError } = await triageSessionService.getById(sessionId);
        if (sessionError) throw sessionError;
        setSession(sessionData);

        const { data: notesData, error: notesError } = await triageNoteService.getBySessionId(sessionId);
        if (notesError) throw notesError;
        setNotes(notesData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return { session, notes, loading, error };
}

export function usePendingSessions() {
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingSessions = async () => {
      setLoading(true);
      try {
        const { data, error } = await triageSessionService.getPendingSessions();
        if (error) throw error;
        setSessions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSessions();
  }, []);

  return { sessions, loading, error };
}
