import { useAuth as useAuthBase } from '../../context/AuthContext';

// Re-export so admin components can import from ../hooks/useAuth
export function useAuth() {
  const ctx = useAuthBase();
  return {
    ...ctx,
    // Keep compatibility with existing AdminRoute expectations
    isLoading: false,
  };
}

