/**
 * Error Alert Component
 */

import { Alert, Box } from '@mui/material';

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="error" onClose={onClose}>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;
