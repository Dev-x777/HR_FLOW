"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Command, Layers, HardDrive, History, ChevronRight, ChevronLeft } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    id: 'canvas',
    title: 'Visual Workflow Designer',
    icon: Layers,
    description: 'Build enterprise-grade employee lifecycles on an infinite, high-performance canvas. Drag nodes from the sidebar and connect them to establish operational flow.',
    color: '#3b82f6',
    stepLabel: '01',
  },
  {
    id: 'command',
    title: 'Command Spotlight Search',
    icon: Command,
    description: 'Instant structural control. Press Cmd+K to launch the native search palette. Add nodes, clear the canvas, or layout your entire graph with just a few keystrokes.',
    color: '#a855f7',
    stepLabel: '02',
  },
  {
    id: 'payload',
    title: 'Instant Architecture Drop',
    icon: HardDrive,
    description: 'Zero-touch imports. Simply drag any external JSON workflow configuration directly onto the application window to instantly reconstruct complex architectures.',
    color: '#22c55e',
    stepLabel: '03',
  },
  {
    id: 'simulate',
    title: 'Deep Logical Simulation',
    icon: Play,
    description: 'Test your logic in a secure sandbox. The simulator compiles your nodes in real-time, identifying broken pipelines and validating structural integrity.',
    color: '#f97316',
    stepLabel: '04',
  },
  {
    id: 'history',
    title: 'Professional Logic Tracking',
    icon: History,
    description: 'Non-destructive design. Every property change is captured in a versioned history log only when you finish editing, keeping your undo timeline clean.',
    color: '#ec4899',
    stepLabel: '05',
  }
];

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(0);
    }
  }, [isOpen]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed' as const,
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        style={{
          position: 'absolute' as const,
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'relative' as const,
          width: '896px',
          height: '540px',
          backgroundColor: 'rgba(10, 10, 10, 0.65)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '32px',
          boxShadow: '0 40px 120px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex' as const,
          flexDirection: 'row' as const,
          zIndex: 10000,
          pointerEvents: 'auto'
        }}
      >
        {/* LEFT PANEL */}
        <div 
          style={{
            width: '40%',
            height: '100%',
            position: 'relative' as const,
            overflow: 'hidden',
            display: 'flex' as const,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Animated Background Color Block */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              style={{
                position: 'absolute' as const,
                inset: 0,
                backgroundColor: steps[currentStep].color,
                opacity: 0.15
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
               key={currentStep}
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.1, opacity: 0 }}
               style={{
                 position: 'relative' as const,
                 width: '120px',
                 height: '120px',
                 backgroundColor: steps[currentStep].color,
                 borderRadius: '32px',
                 display: 'flex' as const,
                 alignItems: 'center',
                 justifyContent: 'center',
                 boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                 border: '1px solid rgba(255, 255, 255, 0.2)'
               }}
            >
               {React.createElement(steps[currentStep].icon, { size: 64, color: 'white', strokeWidth: 1.5 })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL */}
        <div 
          style={{
            width: '60%',
            height: '100%',
            display: 'flex' as const,
            flexDirection: 'column' as const,
            position: 'relative' as const
          }}
        >
          {/* Close Button Header */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px 32px' }}>
             <button 
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '100%'
                }}
             >
                <X size={20} />
             </button>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px 48px 64px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                 key={currentStep}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3 }}
              >
                 <div style={{ marginBottom: '24px' }}>
                    <span 
                      style={{
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: steps[currentStep].color,
                        backgroundColor: steps[currentStep].color + '15',
                        border: `1px solid ${steps[currentStep].color}30`
                      }}
                    >
                       Step {currentStep + 1} of {steps.length}
                    </span>
                 </div>

                 <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: '1.1' }}>
                    {steps[currentStep].title}
                 </h2>
                 
                 <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '440px' }}>
                    {steps[currentStep].description}
                 </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div 
            style={{
              padding: '32px 64px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex' as const,
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.01)'
            }}
          >
             <div style={{ display: 'flex' as const, gap: '8px' }}>
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      height: '4px',
                      borderRadius: '100px',
                      transition: 'all 0.3s',
                      width: idx === currentStep ? '32px' : '4px',
                      backgroundColor: idx === currentStep ? 'white' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                ))}
             </div>

             <div style={{ display: 'flex' as const, gap: '24px', alignItems: 'center' }}>
                {currentStep > 0 && (
                   <button 
                      onClick={prevStep}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                   >
                      <ChevronLeft size={16} /> Back
                   </button>
                )}
                
                <button 
                   onClick={currentStep === steps.length - 1 ? onClose : nextStep}
                   style={{
                     height: '48px',
                     padding: '0 32px',
                     borderRadius: '100px',
                     backgroundColor: 'white',
                     color: 'black',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     border: 'none',
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px',
                     boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                   }}
                >
                   {currentStep === steps.length - 1 ? "Start Designing" : "Continue"}
                   {currentStep < steps.length - 1 && <ChevronRight size={18} strokeWidth={3} />}
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
