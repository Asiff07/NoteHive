import React, { useState } from 'react';
import { X, CreditCard, Wallet } from 'lucide-react';
import axios from 'axios';

const PaymentModal = ({ note, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

    const handleRazorpayPayment = async () => {
        setLoading(true);
        try {
            // Create order on backend
            const { data } = await axios.post('/payments/razorpay/create-order', {
                noteId: note._id,
                amount: note.price
            });

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'NotesShare',
                    description: note.subject,
                    order_id: data.orderId,
                    handler: async (response) => {
                        try {
                            // Verify payment on backend
                            await axios.post('/payments/razorpay/verify', {
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                noteId: note._id
                            });
                            onSuccess();
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            alert('Payment verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: '',
                        email: '',
                        contact: ''
                    },
                    theme: {
                        color: '#0ea5e9'
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
                setLoading(false);
            };
        } catch (error) {
            console.error('Razorpay payment failed:', error);
            alert('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    const handleStripePayment = async () => {
        setLoading(true);
        try {
            // Create Stripe checkout session
            const { data } = await axios.post('/payments/stripe/create-checkout', {
                noteId: note._id,
                amount: note.price
            });

            // Redirect to Stripe checkout
            window.location.href = data.url;
        } catch (error) {
            console.error('Stripe payment failed:', error);
            alert('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    const handlePayment = () => {
        if (selectedMethod === 'razorpay') {
            handleRazorpayPayment();
        } else if (selectedMethod === 'stripe') {
            handleStripePayment();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Unlock Note
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {note.subject}
                </p>

                {/* Price */}
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{note.price}
                    </p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3 mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Payment Method
                    </p>

                    {/* Razorpay Option */}
                    <button
                        onClick={() => setSelectedMethod('razorpay')}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedMethod === 'razorpay'
                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Wallet className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 dark:text-white">Razorpay</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                UPI, Cards, Wallets & More
                            </p>
                        </div>
                        {selectedMethod === 'razorpay' && (
                            <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                        )}
                    </button>

                    {/* Stripe Option */}
                    <button
                        onClick={() => setSelectedMethod('stripe')}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedMethod === 'stripe'
                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <CreditCard className="text-purple-600 dark:text-purple-400" size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 dark:text-white">Stripe</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                International Cards
                            </p>
                        </div>
                        {selectedMethod === 'stripe' && (
                            <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                        )}
                    </button>
                </div>

                {/* Pay Button */}
                <button
                    onClick={handlePayment}
                    disabled={!selectedMethod || loading}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                    {loading ? 'Processing...' : `Pay ₹${note.price}`}
                </button>

                {/* Security Note */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    🔒 Secure payment powered by {selectedMethod === 'razorpay' ? 'Razorpay' : selectedMethod === 'stripe' ? 'Stripe' : 'trusted providers'}
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;
