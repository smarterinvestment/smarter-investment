// ============================================
// 🔐 AUTH PAGE - LOGIN & REGISTER
// ============================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, TrendingUp, PiggyBank, Target } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { cn } from '../../utils/cn';
import { showSuccess, showError } from '../../lib/errorHandler';

type AuthMode = 'login' | 'register' | 'forgot';

// Feature cards for landing
const FEATURES = [
  { icon: <TrendingUp className="w-6 h-6" />, title: 'Control de Gastos', description: 'Registra y categoriza todos tus movimientos' },
  { icon: <PiggyBank className="w-6 h-6" />, title: 'Presupuestos', description: 'Establece límites y recibe alertas' },
  { icon: <Target className="w-6 h-6" />, title: 'Metas de Ahorro', description: 'Alcanza tus objetivos financieros' },
  { icon: <Sparkles className="w-6 h-6" />, title: 'Asistente IA', description: 'Consejos personalizados para ti' },
];

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        showSuccess('¡Bienvenido de vuelta!');
      } else if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        showSuccess('¡Cuenta creada exitosamente!');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        showSuccess('Se envió un correo para restablecer tu contraseña');
        setMode('login');
      }
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'El correo electrónico no es válido',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/user-not-found': 'No existe una cuenta con este correo',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Ya existe una cuenta con este correo',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      };
      showError(errorMessages[error.code] || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showSuccess('¡Bienvenido!');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        showError('Error al iniciar sesión con Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-800 to-dark-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Smarter</h1>
              <p className="text-primary-400 text-sm font-medium">Investment</p>
            </div>
          </div>
          <p className="text-white/60 text-lg max-w-md">
            Tu gestor financiero personal inteligente. Toma el control de tus finanzas hoy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 mb-3">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/30 text-sm">
          © 2025 Smarter Investment. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Smarter Investment</h1>
            <p className="text-white/50">Tu gestor financiero personal</p>
          </div>

          {/* Auth Card */}
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {mode === 'login' && '¡Bienvenido!'}
                    {mode === 'register' && 'Crear Cuenta'}
                    {mode === 'forgot' && 'Recuperar Contraseña'}
                  </h2>
                  <p className="text-white/50">
                    {mode === 'login' && 'Inicia sesión para continuar'}
                    {mode === 'register' && 'Regístrate gratis en segundos'}
                    {mode === 'forgot' && 'Te enviaremos un enlace de recuperación'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <Input
                      label="Nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      leftIcon={<User className="w-4 h-4" />}
                    />
                  )}

                  <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />

                  {mode !== 'forgot' && (
                    <Input
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      required
                    />
                  )}

                  {mode === 'login' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="mt-6"
                  >
                    {mode === 'login' && 'Iniciar Sesión'}
                    {mode === 'register' && 'Crear Cuenta'}
                    {mode === 'forgot' && 'Enviar Enlace'}
                  </Button>
                </form>

                {/* Divider */}
                {mode !== 'forgot' && (
                  <>
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-sm text-white/40">o continúa con</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Google Login */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white font-medium disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar con Google
                    </button>
                  </>
                )}

                {/* Mode Toggle */}
                <div className="text-center mt-6">
                  {mode === 'login' && (
                    <p className="text-white/50">
                      ¿No tienes cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                      >
                        Regístrate
                      </button>
                    </p>
                  )}
                  {mode === 'register' && (
                    <p className="text-white/50">
                      ¿Ya tienes cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                      >
                        Inicia Sesión
                      </button>
                    </p>
                  )}
                  {mode === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                      Volver al inicio de sesión
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Terms */}
          <p className="text-center text-white/30 text-xs mt-6">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="text-primary-400 hover:underline">Términos de Servicio</a>
            {' '}y{' '}
            <a href="#" className="text-primary-400 hover:underline">Política de Privacidad</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
