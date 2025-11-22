import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const usePaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentStatus = urlParams.get('payment');
            const sessionId = urlParams.get('session_id');

            if (paymentStatus === 'success' && sessionId) {
                try {
                    // Verify the payment with backend
                    await axios.post('/payments/stripe/verify-checkout', {
                        sessionId
                    });

                    // Show success message
                    alert('Payment successful! You now have access to the note.');

                    // Clean up URL and reload to show unlocked note
                    navigate('/', { replace: true });
                    window.location.reload();
                } catch (error) {
                    console.error('Payment verification failed:', error);
                    alert('Payment verification failed. Please contact support.');
                    navigate('/', { replace: true });
                }
            } else if (paymentStatus === 'cancelled') {
                alert('Payment was cancelled.');
                navigate('/', { replace: true });
            }
        };

        handlePaymentSuccess();
    }, [navigate]);
};

export default usePaymentSuccess;
