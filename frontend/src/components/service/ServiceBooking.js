// src/components/services/ServiceBooking.js
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { api } from '../../services/api';

const ServiceBooking = ({ service, open, onClose, onBookingComplete }) => {
    const [bookingData, setBookingData] = useState({
        startDate: null,
        endDate: null,
        requirements: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleInputChange = (field) => (value) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.post('/api/service-bookings', {
                serviceId: service._id,
                ...bookingData
            });

            onBookingComplete(response.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    // Add this function to calculate the estimated price
    const calculateEstimatedPrice = () => {
        if (!bookingData.startDate || !bookingData.endDate || !service.pricePerHour) {
            return 0;
        }
        const hours = (bookingData.endDate - bookingData.startDate) / (1000 * 60 * 60);
        return (hours * service.pricePerHour).toFixed(2);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Book Service: {service?.name}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid item xs={12} sm={6}>
                            <DateTimePicker
                                label="Start Date & Time"
                                value={bookingData.startDate}
                                onChange={handleInputChange('startDate')}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                minDate={new Date()}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DateTimePicker
                                label="End Date & Time"
                                value={bookingData.endDate}
                                onChange={handleInputChange('endDate')}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                minDate={bookingData.startDate || new Date()}
                            />
                        </Grid>
                    </LocalizationProvider>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Special Requirements"
                            value={bookingData.requirements}
                            onChange={(e) => handleInputChange('requirements')(e.target.value)}
                        />
                    </Grid>

                    {bookingData.startDate && bookingData.endDate && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Estimated Price: ${calculateEstimatedPrice()}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || !bookingData.startDate || !bookingData.endDate}
                >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServiceBooking;