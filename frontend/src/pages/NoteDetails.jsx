import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Download, Lock, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Initialize Stripe (Replace with your publishable key)
const stripePromise = loadStripe('pk_test_your_publishable_key');

const CheckoutForm = ({ note, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) return;

        try {
            // 1. Create Payment Intent
            const { data } = await axios.post('/payments/create-intent', { noteId: note._id });
            const clientSecret = data.clientSecret;

            // 2. Confirm Payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess();
                }
            }
        } catch (err) {
            setError('Payment failed. Please try again.');
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="p-3 border rounded-lg mb-4 bg-white">
                <CardElement />
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="glass-btn w-full"
            >
                {processing ? 'Processing...' : `Pay ₹${note.price}`}
            </button>
        </form>
    );
};

const NoteDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        fetchNote();
    }, [id]);

    const fetchNote = async () => {
        try {
            const res = await axios.get(`/notes/${id}`);
            setNote(res.data);
        } catch (error) {
            console.error('Error fetching note:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchaseSuccess = () => {
        alert('Payment Successful! You can now view the note.');
        setShowPayment(false);
        fetchNote(); // Refresh to get full content
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!note) return <div className="text-center py-12">Note not found</div>;

    const isPurchased = note.purchasedBy?.includes(user?._id) || note.owner._id === user?._id || note.price === 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <GlassCard>
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left: Image/Preview */}
                        <div className="w-full md:w-1/3">
                            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative">
                                {note.images && note.images.length > 0 ? (
                                    <img src={note.images[0]} alt={note.subject} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FileText size={64} />
                                    </div>
                                )}
                                {!isPurchased && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                        <Lock className="text-white w-16 h-16" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{note.subject}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <span>By {note.owner.name}</span>
                                <span>•</span>
                                <span>{new Date(note.taughtDate).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className={`font-bold ${note.price === 0 ? 'text-green-600' : 'text-primary-600'}`}>
                                    {note.price === 0 ? 'FREE' : `₹${note.price}`}
                                </span>
                            </div>

                            <div className="prose max-w-none mb-8">
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{note.textContent}</p>
                            </div>

                            {isPurchased ? (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-700">
                                        <ShieldCheck size={24} />
                                        <div>
                                            <p className="font-medium">You have access to this note.</p>
                                            <p className="text-sm">View images and download files below.</p>
                                        </div>
                                    </div>

                                    {/* Files List */}
                                    {note.files && note.files.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">Attachments</h4>
                                            <div className="space-y-2">
                                                {note.files.map((file, i) => (
                                                    <a
                                                        key={i}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => axios.post(`/notes/${note._id}/download`)}
                                                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FileText size={20} className="text-red-500" />
                                                        <span className="text-sm text-gray-700">{file.filename || `File ${i + 1}`}</span>
                                                        <Download size={16} className="ml-auto text-gray-400" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {!showPayment ? (
                                        <button
                                            onClick={() => setShowPayment(true)}
                                            className="glass-btn w-full md:w-auto flex items-center justify-center gap-2"
                                        >
                                            <Lock size={20} /> Unlock Now for ₹{note.price}
                                        </button>
                                    ) : (
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h3 className="text-lg font-bold mb-4">Secure Checkout</h3>
                                            <Elements stripe={stripePromise}>
                                                <CheckoutForm note={note} onSuccess={handlePurchaseSuccess} />
                                            </Elements>
                                            <button
                                                onClick={() => setShowPayment(false)}
                                                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline w-full text-center"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default NoteDetails;
