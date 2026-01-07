/**
 * Loading Spinner Component
 */

import { CircularProgress, Box } from '@mui/material';

const Loading = ({ message = 'Loading...', ...rest }) => {
  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}
    >
      <CircularProgress sx={{ color: '#4CAF50' }} />
    </Box>
  );
};

export default Loading;
