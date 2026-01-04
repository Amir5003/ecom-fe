/**
 * Card Component
 * Reusable card with light theme
 */

import { Card as MUICard, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MUICard)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  backgroundColor: '#ffffff',
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
  },
}));

const Card = ({ image, title, description, price, children, onClick, ...props }) => {
  return (
    <StyledCard {...props} sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      {image && <CardMedia component="img" height="200" image={image} alt={title} />}
      <CardContent>
        {title && <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>}
        {description && <Typography variant="body2" color="textSecondary">{description}</Typography>}
        {price && (
          <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700, mt: 1 }}>
            ₹{price}
          </Typography>
        )}
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default Card;
