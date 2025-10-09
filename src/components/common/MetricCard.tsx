/**
 * Componente para tarjetas de métricas de proyectos
 */

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onClick,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ height: '100%' }}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': onClick
            ? {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              }
            : {},
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {icon}
            </Box>
            {trend && (
              <Chip
                label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
                size='small'
                color={trend.isPositive ? 'success' : 'error'}
                variant='outlined'
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          <Typography variant='h4' fontWeight='bold' color='text.primary' mb={1}>
            {value}
          </Typography>

          <Typography variant='body2' color='text.secondary' mb={subtitle ? 1 : 0}>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant='caption' color='text.secondary'>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;
