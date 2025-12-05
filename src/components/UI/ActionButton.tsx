import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: () => void;
  gesture?: string;
  isSelected?: boolean;
  ariaLabel?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  gesture,
  isSelected = false,
  ariaLabel,
  className = '',
  ...props
}) => {
  return (
    <Button
      variant={isSelected ? "contained" : "outlined"}
      color="primary"
      onClick={onClick}
      className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''} ${className}`}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      data-gesture={gesture}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ActionButton;