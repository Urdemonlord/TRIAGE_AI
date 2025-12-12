// Comprehensive hooks for patient & doctor functionality
'use client';

import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { triageAPI } from '@/lib/api';
import { dbService } from '@/lib/supabase';
import type { TriageRecord } from '@/lib/supabase';

/**
 * Hook untuk mengelola triage form submission
 */
export function useTriageSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(
    async (complaint: string, patientData?: Record<string, any>) => {
      setLoading(true);
      setError('');

      try {
        const result = await triageAPI.performTriage({
          complaint,
          patient_data: patientData || {},
        });

        return { success: true, data: result };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.detail ||
          err.message ||
          'Terjadi kesalahan saat menganalisis gejala';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submit, loading, error, setError };
}

/**
 * Hook untuk fetch patient triage history
 */
export function usePatientHistory(patientId?: string) {
  const [records, setRecords] = useState<TriageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!patientId) {
      setError('Patient ID not provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await dbService.getTriageRecords(
        patientId,
        50
      );

      if (dbError) {
        throw dbError;
      }

      setRecords(data || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Gagal memuat riwayat triase';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const filterByUrgency = useCallback((urgency: 'Red' | 'Yellow' | 'Green' | 'all') => {
    if (urgency === 'all') return records;
    return records.filter((r) => r.urgency_level === urgency);
  }, [records]);

  return {
    records,
    loading,
    error,
    fetchHistory,
    filterByUrgency,
  };
}

/**
 * Hook untuk manage doctor note creation
 */
export function useDoctorNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createNote = useCallback(
    async (triageId: string, doctorId: string, noteData: Record<string, any>) => {
      setLoading(true);
      setError('');

      try {
        const { data, error: dbError } = await dbService.createDoctorNote({
          triage_id: triageId,
          doctor_id: doctorId,
          ...noteData,
        });

        if (dbError) {
          throw dbError;
        }

        return { success: true, data };
      } catch (err: any) {
        const errorMsg = err.message || 'Gagal membuat catatan dokter';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createNote, loading, error, setError };
}

/**
 * Hook untuk manage form validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<any>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    },
    []
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        await onSubmit(values);
        setValues(initialValues);
        setErrors({});
        setTouched({});
      } catch (err: any) {
        const errorMsg = err.message || 'Terjadi kesalahan';
        setErrors((prev) => ({
          ...prev,
          _form: errorMsg,
        }));
      } finally {
        setLoading(false);
      }
    },
    [values, initialValues, onSubmit]
  );

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    setValues,
  };
}

/**
 * Hook untuk debounce search
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook untuk manage modal state
 */
export function useModal(initialOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

/**
 * Hook untuk manage loading state dengan timeout
 */
export function useAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  timeout?: number
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result: T;

      if (timeout) {
        result = await Promise.race([
          asyncFn(),
          new Promise<T>((_, reject) =>
            setTimeout(
              () => reject(new Error('Operation timeout')),
              timeout
            )
          ),
        ]);
      } else {
        result = await asyncFn();
      }

      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, timeout]);

  return { execute, loading, data, error };
}

/**
 * Hook untuk manage pagination
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
