/**
 * Primary Button Component
 * Reusable button with MUI styling
 */

import { Button as MUIButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MUIButton)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
  },
}));

const Button = ({
  children,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  color = 'success',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      color={color}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  );
};

export default Button;
