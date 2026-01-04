/**
 * Input Component
 * Reusable text input with MUI styling
 */

import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    '&:hover fieldset': {
      borderColor: '#4CAF50',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4CAF50',
      boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '1rem',
    padding: '12px 16px',
  },
}));

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  fullWidth = true,
  multiline = false,
  rows = 1,
  variant = 'outlined',
  ...props
}) => {
  return (
    <StyledTextField
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={helperText}
      disabled={disabled}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      variant={variant}
      {...props}
    />
  );
};

export default Input;
