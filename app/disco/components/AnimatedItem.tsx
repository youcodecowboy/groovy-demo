import React, { useState, useEffect } from 'react';
import '../styles/animations.css';

interface AnimatedItemProps {
  id: string;
  children: React.ReactNode;
  isComplete?: boolean;
  onComplete?: () => void;
  showScanFeedback?: boolean;
}

export const DiscoAnimatedItem: React.FC<AnimatedItemProps> = ({
  id,
  children,
  isComplete = false,
  onComplete,
  showScanFeedback = false,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (showScanFeedback) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showScanFeedback]);

  useEffect(() => {
    if (isComplete) {
      setAnimationKey(prev => prev + 1);
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  return (
    <div
      key={animationKey}
      className={`
        disco-animated-item
        disco-hardware-accelerated
        ${isComplete ? 'disco-item-complete' : ''}
        ${showSuccess ? 'disco-scan-success' : ''}
      `}
    >
      {children}
      <style jsx>{`
        .disco-animated-item {
          position: relative;
          padding: 1rem;
          border-radius: 0.5rem;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all var(--animation-duration-normal) var(--animation-easing);
        }

        .disco-animated-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .disco-animated-item.disco-item-complete {
          opacity: 0.6;
        }

        .disco-animated-item.disco-scan-success {
          animation: scan-success var(--animation-duration-normal) var(--animation-easing);
        }
      `}</style>
    </div>
  );
};