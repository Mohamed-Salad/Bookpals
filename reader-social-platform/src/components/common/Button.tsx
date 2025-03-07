/**
 * Common Button Component
 * A reusable button component that supports different variants and sizes
 * Used throughout the application for consistent styling
 */

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button as MuiButton, styled } from '@mui/material';

const StyledButton = styled(MuiButton)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: theme.shape.borderRadius,
  '&.Mui-disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  sx?: any;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  href,
  onClick,
  disabled = false,
  type = 'button',
  sx,
  ...props
}) => {
  const buttonProps = {
    variant: variant === 'primary' ? 'contained' : 'outlined',
    size,
    onClick,
    disabled,
    type,
    sx,
    ...props
  };

  if (href) {
    return (
      <RouterLink to={href} style={{ textDecoration: 'none' }}>
        <StyledButton {...buttonProps}>
          {children}
        </StyledButton>
      </RouterLink>
    );
  }

  return (
    <StyledButton {...buttonProps}>
      {children}
    </StyledButton>
  );
}; 