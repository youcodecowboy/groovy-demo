import React from 'react';
import '../styles/animations.css';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  teamName?: string;
  showPercentage?: boolean;
}

export const DiscoProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  label,
  teamName,
  showPercentage = true,
}) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div className="disco-progress-container">
      {(label || teamName) && (
        <div className="disco-progress-header">
          {label && <span className="disco-progress-label">{label}</span>}
          {teamName && <span className="disco-progress-team">{teamName}</span>}
        </div>
      )}
      <div className="disco-progress-bar disco-hardware-accelerated">
        <div 
          className="disco-progress-bar-fill"
          style={{ transform: `scaleX(${percentage / 100})` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showPercentage && (
        <div className="disco-progress-percentage">{percentage}%</div>
      )}
      <style jsx>{`
        .disco-progress-container {
          width: 100%;
          margin: 1rem 0;
        }
        
        .disco-progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .disco-progress-label {
          font-weight: 500;
          color: #4a5568;
        }
        
        .disco-progress-team {
          color: #718096;
        }
        
        .disco-progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .disco-progress-bar-fill {
          width: 100%;
          height: 100%;
          background-color: #4299e1;
          transform-origin: left;
        }
        
        .disco-progress-percentage {
          text-align: right;
          font-size: 0.875rem;
          color: #718096;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};