// src/components/service/ServiceList.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      if (response.data && Array.isArray(response.data)) {
        setServices(response.data);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (typeof duration === 'object') {
      const value = duration.value || '';
      const unit = duration.unit || '';
      return `${value} ${unit}`.trim() || 'N/A';
    }
    return String(duration);
  };

  const formatPrice = (pricing) => {
    if (!pricing || !pricing.amount) return 'N/A';
    const amount = Number(pricing.amount).toFixed(2);
    const unit = pricing.unit ? ` per ${pricing.unit}` : '';
    return `$${amount}${unit}`;
  };

  const formatAvailability = (availability) => {
    if (!availability) return 'N/A';
    if (typeof availability === 'object') {
      const days = availability.days || '';
      const hours = availability.hours || '';
      return `${days} ${hours}`.trim() || 'N/A';
    }
    return String(availability);
  };

  const handleBookService = (serviceId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/bookings/new?serviceId=${serviceId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Services
      </Typography>

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {service.name || 'Unnamed Service'}
                </Typography>

                <Typography color="text.secondary" gutterBottom>
                  {service.description || 'No description available'}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" component="div">
                    Price: {formatPrice(service.pricing)}
                  </Typography>

                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    Duration: {formatDuration(service.duration)}
                  </Typography>

                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    Availability: {formatAvailability(service.availability)}
                  </Typography>

                  {service.requirements && (
                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                      Requirements: {String(service.requirements)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBookService(service._id)}
                  >
                    Book Service
                  </Button>
                  
                  {service.status && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: service.status === 'available' ? 'success.main' : 'error.main'
                      }}
                    >
                      {String(service.status).charAt(0).toUpperCase() + String(service.status).slice(1)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {services.length === 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No services available at the moment.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ServiceList;