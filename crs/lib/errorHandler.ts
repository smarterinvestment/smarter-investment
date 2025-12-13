// ============================================
// ⚠️ ERROR HANDLER & TOAST NOTIFICATIONS
// ============================================
import toast from 'react-hot-toast';

// ========================================
// ERROR TYPES
// ========================================
interface AppError {
  code: string;
  message: string;
  originalError?: unknown;
}

// Firebase error messages in Spanish
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'auth/email-already-in-use': 'Este correo ya está registrado',
  'auth/invalid-email': 'Correo electrónico inválido',
  'auth/operation-not-allowed': 'Operación no permitida',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/user-not-found': 'No existe una cuenta con este correo',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
  'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
  'auth/requires-recent-login': 'Debes iniciar sesión nuevamente para esta acción',
  
  // Firestore errors
  'permission-denied': 'No tienes permiso para realizar esta acción',
  'not-found': 'Documento no encontrado',
  'already-exists': 'El documento ya existe',
  'resource-exhausted': 'Límite de operaciones excedido',
  'failed-precondition': 'Operación no válida en este estado',
  'aborted': 'Operación cancelada',
  'out-of-range': 'Valor fuera de rango',
  'unimplemented': 'Función no implementada',
  'internal': 'Error interno del servidor',
  'unavailable': 'Servicio no disponible',
  'data-loss': 'Error de datos',
  'unauthenticated': 'Debes iniciar sesión',
  
  // Generic
  'unknown': 'Ha ocurrido un error inesperado',
};

// ========================================
// ERROR PARSER
// ========================================
export const parseError = (error: unknown): AppError => {
  // Firebase error
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    const message = FIREBASE_ERROR_MESSAGES[code] || 
                   FIREBASE_ERROR_MESSAGES['unknown'];
    return { code, message, originalError: error };
  }
  
  // Standard Error
  if (error instanceof Error) {
    return { 
      code: 'error', 
      message: error.message, 
      originalError: error 
    };
  }
  
  // String error
  if (typeof error === 'string') {
    return { code: 'error', message: error };
  }
  
  // Unknown error
  return { 
    code: 'unknown', 
    message: FIREBASE_ERROR_MESSAGES['unknown'],
    originalError: error 
  };
};

// ========================================
// TOAST HELPERS
// ========================================
const toastStyles = {
  style: {
    background: '#001845',
    color: '#fff',
    borderRadius: '12px',
    padding: '12px 16px',
    border: '1px solid rgba(5, 191, 219, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    ...toastStyles,
    iconTheme: {
      primary: '#22C55E',
      secondary: '#fff',
    },
  });
};

export const showError = (error: unknown) => {
  const { message } = parseError(error);
  toast.error(message, {
    ...toastStyles,
    iconTheme: {
      primary: '#EF4444',
      secondary: '#fff',
    },
    duration: 5000,
  });
};

export const showWarning = (message: string) => {
  toast(message, {
    ...toastStyles,
    icon: '⚠️',
    duration: 4000,
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    ...toastStyles,
    icon: 'ℹ️',
    duration: 3000,
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, toastStyles);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// ========================================
// ASYNC ERROR WRAPPER
// ========================================
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  options?: {
    loadingMessage?: string;
    successMessage?: string;
    onError?: (error: AppError) => void;
  }
): Promise<T | null> => {
  let toastId: string | undefined;
  
  try {
    if (options?.loadingMessage) {
      toastId = showLoading(options.loadingMessage);
    }
    
    const result = await fn();
    
    if (toastId) {
      dismissToast(toastId);
    }
    
    if (options?.successMessage) {
      showSuccess(options.successMessage);
    }
    
    return result;
  } catch (error) {
    if (toastId) {
      dismissToast(toastId);
    }
    
    const appError = parseError(error);
    showError(error);
    
    if (options?.onError) {
      options.onError(appError);
    }
    
    console.error('Error:', appError);
    return null;
  }
};

// ========================================
// NETWORK STATUS
// ========================================
export const isOnline = () => navigator.onLine;

export const onNetworkChange = (callback: (online: boolean) => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// ========================================
// RETRY MECHANISM
// ========================================
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
};
