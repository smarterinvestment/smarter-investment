// ============================================
// 📚 ONBOARDING TUTORIAL - Guía paso a paso
// Tutorial interactivo para nuevos usuarios
// ============================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, PieChart, Target, Bot, ArrowRight, ArrowLeft, X,
  TrendingUp, Bell, RefreshCw, Check, Sparkles, ChevronRight
} from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';

interface TutorialStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  tip: string;
  image?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    icon: <Sparkles className="w-12 h-12" />,
    title: '¡Bienvenido a Smarter Investment!',
    description: 'Tu asistente financiero personal que te ayudará a tomar el control de tus finanzas de manera inteligente.',
    tip: '💡 Esta app funciona 100% offline después de cargar',
  },
  {
    id: 2,
    icon: <Wallet className="w-12 h-12" />,
    title: 'Registra tus Transacciones',
    description: 'Añade tus ingresos y gastos fácilmente. Categoriza cada movimiento para un mejor control.',
    tip: '💡 Toca el botón + para agregar una transacción rápida',
  },
  {
    id: 3,
    icon: <PieChart className="w-12 h-12" />,
    title: 'Crea Presupuestos',
    description: 'Establece límites de gasto por categoría y recibe alertas cuando te acerques al límite.',
    tip: '💡 Te recomendamos la regla 50/30/20: Necesidades, Deseos, Ahorro',
  },
  {
    id: 4,
    icon: <Target className="w-12 h-12" />,
    title: 'Define tus Metas',
    description: 'Crea metas de ahorro con fecha límite. Visualiza tu progreso y mantente motivado.',
    tip: '💡 Empieza con una meta pequeña para crear el hábito',
  },
  {
    id: 5,
    icon: <RefreshCw className="w-12 h-12" />,
    title: 'Transacciones Recurrentes',
    description: 'Configura tus ingresos y gastos fijos como salario, alquiler, suscripciones.',
    tip: '💡 Esto te ayuda a proyectar tu flujo de caja mensual',
  },
  {
    id: 6,
    icon: <TrendingUp className="w-12 h-12" />,
    title: 'Reportes Detallados',
    description: 'Analiza tus finanzas con gráficos interactivos. Ve tendencias y compara meses.',
    tip: '💡 Revisa tus reportes cada semana para detectar patrones',
  },
  {
    id: 7,
    icon: <Bot className="w-12 h-12" />,
    title: 'Asistente IA',
    description: 'Pregúntale cualquier cosa sobre tus finanzas. Te dará consejos personalizados basados en tus datos.',
    tip: '💡 Prueba preguntar: "¿Cómo puedo ahorrar más?"',
  },
  {
    id: 8,
    icon: <Bell className="w-12 h-12" />,
    title: 'Alertas Inteligentes',
    description: 'Recibe notificaciones cuando excedas presupuestos, alcances metas o tengas pagos próximos.',
    tip: '💡 Activa las notificaciones para no perder recordatorios',
  },
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { theme } = useStore();
  const themeColors = getThemeColors(theme);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
      >
        {/* Background blur effect */}
        <div 
          className="absolute inset-0 blur-3xl opacity-30"
          style={{ 
            background: `radial-gradient(circle at center, ${themeColors.primary}40 0%, transparent 70%)` 
          }}
        />

        {/* Tutorial Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg rounded-3xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(15, 20, 30, 0.95)',
            border: `1px solid ${themeColors.primary}30`,
            boxShadow: `0 0 60px ${themeColors.primary}20`,
          }}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-white/10">
            <motion.div
              className="h-full"
              style={{ backgroundColor: themeColors.primary }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close / Skip */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1 text-sm text-white/50 hover:text-white transition-colors"
            >
              Saltar
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Counter */}
          <div className="absolute top-4 left-4">
            <span className="text-sm text-white/50">
              {currentStep + 1} / {TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Content */}
          <div className="p-8 pt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <div 
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.primary}10)`,
                    border: `2px solid ${themeColors.primary}40`,
                    boxShadow: `0 0 40px ${themeColors.primary}20`
                  }}
                >
                  <div style={{ color: themeColors.primary }}>
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-white/70 text-lg mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Tip Box */}
                <div 
                  className="p-4 rounded-xl text-left"
                  style={{ 
                    backgroundColor: `${themeColors.primary}10`,
                    border: `1px solid ${themeColors.primary}30`
                  }}
                >
                  <p className="text-sm" style={{ color: themeColors.primary }}>
                    {step.tip}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 pb-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: index === currentStep ? themeColors.primary : 'rgba(255,255,255,0.2)',
                  transform: index === currentStep ? 'scale(1.5)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 p-6 pt-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                Anterior
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.primary}CC)`,
                boxShadow: `0 4px 20px ${themeColors.primary}40`,
                color: 'white'
              }}
            >
              {isLastStep ? (
                <>
                  <Check className="w-5 h-5" />
                  ¡Comenzar!
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Quick Tour Component - Más compacto para volver a ver
export const QuickTourButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { theme } = useStore();
  const themeColors = getThemeColors(theme);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
      style={{
        backgroundColor: `${themeColors.primary}15`,
        border: `1px solid ${themeColors.primary}30`,
        color: themeColors.primary
      }}
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-medium">Ver Tutorial</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  );
};

export default OnboardingTutorial;
