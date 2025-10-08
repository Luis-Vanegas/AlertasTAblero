/**
 * Componente reutilizable para tarjetas de estadísticas
 */

import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

export interface StatsCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  color,
  icon,
  onClick,
  isSelected = false,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        onClick={onClick}
        sx={{
          p: { xs: 1.5, sm: 2 },
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
          transition: 'transform 0.15s ease, box-shadow 0.3s ease',
          cursor: onClick ? 'pointer' : 'default',
          outline: isSelected ? `2px solid ${color}` : 'none',
          transform: {
            xs: 'none',
            md: isSelected ? 'scale(1.02)' : 'none',
          },
          height: { xs: 120, sm: 140 },
          display: 'flex',
          flexDirection: 'column',
          '&:hover': onClick
            ? {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              }
            : {},
        }}
      >
        <CardContent
          sx={{
            p: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flex={1}
            sx={{ minHeight: 0, mb: 1 }}
          >
            <Avatar
              sx={{
                bgcolor: color,
                mr: 1.5,
                width: { xs: 36, md: 40 },
                height: { xs: 36, md: 40 },
                boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
                border: '2px solid rgba(255,255,255,0.8)',
              }}
            >
              {icon}
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  color: theme.palette.text.primary,
                  lineHeight: 1,
                  fontSize: { xs: '1.4rem', md: '1.8rem' },
                }}
              >
                {value}
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            fontWeight="500"
            sx={{
              color: theme.palette.text.primary,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {label}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
