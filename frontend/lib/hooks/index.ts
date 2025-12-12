// Re-export hooks for easier imports
// useAuth is now exported from @/contexts/AuthContext
export { useTriageSessions, useTriageSession, usePendingSessions } from './useTriage';
export {
  useTriageSubmit,
  usePatientHistory,
  useDoctorNote,
  useFormValidation,
  useDebounce,
  useModal,
  useAsyncOperation,
  usePagination,
} from './useCommon';

