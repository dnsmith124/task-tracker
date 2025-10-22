import { FC, ReactNode } from 'react';
import styles from './Tooltip.module.scss';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: ReactNode;
  className?: string;
  position?: TooltipPosition;
  visible?: boolean;
}

const Tooltip: FC<TooltipProps> = ({ 
  children, 
  className = '', 
  position = 'top',
  visible = true 
}) => {
  const tooltipClasses = [
    styles.tooltip,
    styles[position],
    visible && styles.visible,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={tooltipClasses}>
      {children}
    </div>
  );
};

export default Tooltip;

