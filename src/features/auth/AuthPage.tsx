// ============================================
// 🔐 AUTH PAGE - Login & Registration
// Premium dark glassmorphism design
// ============================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Wallet, Target, 
  PieChart, Bot, User, ChevronLeft
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Button, Input } from '../../components/ui';
import { showSuccess, showError } from '../../lib/errorHandler';
import { t } from '../../utils/i18n';

// Features to display
const FEATURES = [
  { icon: <Wallet className="w-6 h-6" />, titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: <PieChart className="w-6 h-6" />, titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: <Target className="w-6 h-6" />, titleKey: 'feature3Title', descKey: 'feature3Desc' },
  { icon: <Bot className="w-6 h-6" />, titleKey: 'feature4Title', descKey: 'feature4Desc' },
];

export const AuthPage: React.FC = () => {
  const { theme, language } = useStore();
  const themeColors = getThemeColors(theme);
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError(t(language, 'error'), 'Por favor completa todos los campos');
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        showError(t(language, 'error'), 'El nombre es requerido');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showError(t(language, 'error'), 'Las contraseñas no coinciden');
        return;
      }
      if (formData.password.length < 6) {
        showError(t(language, 'error'), 'La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        showSuccess('¡Bienvenido!', 'Sesión iniciada correctamente');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
        showSuccess('¡Cuenta creada!', 'Bienvenido a Smarter Investment');
      }
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        'auth/invalid-credential': 'Credenciales inválidas',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/weak-password': 'La contraseña es muy débil',
        'auth/invalid-email': 'Correo electrónico inválido',
      };
      showError('Error', errorMessages[error.code] || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showSuccess('¡Bienvenido!', 'Sesión iniciada con Google');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        showError('Error', 'No se pudo iniciar sesión con Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #000408 0%, #000810 50%, #000000 100%)' }}
    >
      {/* Left Panel - Features */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #001018 0%, #000810 50%, #000000 100%)' }}
      >
        {/* Background effects */}
        <div 
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: `${themeColors.primary}15` }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"
          style={{ backgroundColor: `${themeColors.primary}10` }}
        />

        {/* Logo - LARGER */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl"
              style={{ 
                boxShadow: `0 0 40px ${themeColors.primary}40, 0 0 80px ${themeColors.primary}20`,
                border: `2px solid ${themeColors.primary}50`
              }}
            >
              <img 
                src="/logo-smarter.jpg" 
                alt="Smarter Investment" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Smarter</h1>
              <p className="text-lg font-medium" style={{ color: themeColors.primary }}>Investment</p>
            </div>
          </div>
          <p className="text-white/70 text-lg max-w-md leading-relaxed">
            {t(language, 'tagline')}
          </p>
        </div>

        {/* Features Grid - Glassmorphism */}
        <div className="relative z-10 grid grid-cols-2 gap-4 my-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.03]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
                boxShadow: `0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ 
                  backgroundColor: `${themeColors.primary}20`,
                  color: themeColors.primary,
                  boxShadow: `0 0 20px ${themeColors.primary}30`
                }}
              >
                {feature.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{t(language, feature.titleKey)}</h3>
              <p className="text-sm text-white/50">{t(language, feature.descKey)}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/30 text-sm">
          {t(language, 'copyright')}
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div 
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: 'linear-gradient(135deg, #000510 0%, #000408 50%, #000000 100%)' }}
      >
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
          <img 
            src="/logo-smarter.jpg" 
            alt="Smarter" 
            className="w-12 h-12 rounded-xl object-cover"
            style={{ boxShadow: `0 0 20px ${themeColors.primary}40` }}
          />
          <div>
            <h1 className="text-xl font-bold text-white">Smarter</h1>
            <p className="text-xs" style={{ color: themeColors.primary }}>Investment</p>
          </div>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div 
            className="backdrop-blur-xl rounded-3xl p-8 border"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.06)',
              boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 60px ${themeColors.primary}10`
            }}
          >
            {/* Logo centrado grande */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl"
                style={{ 
                  boxShadow: `0 0 50px ${themeColors.primary}50, 0 0 100px ${themeColors.primary}30`,
                  border: `3px solid ${themeColors.primary}60`
                }}
              >
                <img 
                  src="/logo-smarter.jpg" 
                  alt="Smarter Investment" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? t(language, 'welcome') : t(language, 'createAccount')}
              </h2>
              <p className="text-white/50">
                {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Name field (only for registration) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm text-white/60 mb-2">
                      {t(language, 'name')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t(language, 'namePlaceholder')}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  {t(language, 'email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t(language, 'emailPlaceholder')}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  {t(language, 'password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (only for registration) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm text-white/60 mb-2">
                      {t(language, 'confirmPassword')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot Password (only for login) */}
              {isLogin && (
                <div className="text-right">
                  <button 
                    type="button" 
                    className="text-sm hover:underline"
                    style={{ color: themeColors.primary }}
                  >
                    {t(language, 'forgotPassword')}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: themeColors.primary,
                  boxShadow: `0 4px 20px ${themeColors.primary}40`
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? t(language, 'login') : t(language, 'createAccount')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-sm">{t(language, 'continueWith')}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google Auth */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-medium text-white flex items-center justify-center gap-3 transition-all hover:bg-white/10 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <span className="text-white/50">
                {isLogin ? t(language, 'noAccount') : t(language, 'alreadyHaveAccount')}
              </span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                className="ml-2 font-semibold hover:underline"
                style={{ color: themeColors.primary }}
              >
                {isLogin ? t(language, 'register') : t(language, 'login')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
