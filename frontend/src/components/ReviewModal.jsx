import React, { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { ReactComponent as Close } from '../Images/closeicon.svg';
import { useTheme } from '../Utils/ThemeContext';

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
    const { isDark } = useTheme();
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    const colors = {
        background: isDark ? '#1F1F1F' : '#ffffff',
        textPrimary: isDark ? '#ffffff' : '#141414',
        textSecondary: isDark ? '#ffffff99' : '#14141499',
        border: isDark ? '#FFFFFF1A' : '#1414141A',
        buttonPrimary: isDark ? '#ffffff' : '#141414',
        buttonSecondary: isDark ? '#141414' : '#ffffff',
        starFilled: '#FFD700',
        starEmpty: isDark ? '#404040' : '#E0E0E0',
        success: '#357935'
    };

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit({ rating, description });
            setRating(0);
            setDescription('');
            onClose();
        }
    };

    const handleClose = () => {
        setRating(0);
        setDescription('');
        onClose();
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isFilled = starValue <= (hoveredRating || rating);
            
            return (
                <button
                    key={index}
                    type="button"
                    className="focus:outline-none transition-colors duration-200"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                >
                    <svg
                        className="w-6 h-6 md:w-8 md:h-8"
                        fill={isFilled ? colors.starFilled : 'none'}
                        stroke={isFilled ? colors.starFilled : colors.starEmpty}
                        strokeWidth={isFilled ? 0 : 2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                    </svg>
                </button>
            );
        });
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-[999]">
            <DialogBackdrop 
                transition 
                className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" 
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel 
                        transition 
                        className="relative transform overflow-hidden rounded-lg bg-primary-light dark:bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        style={{ backgroundColor: colors.background }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: colors.border }}>
                            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                                Add Review
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-1 rounded-md hover:bg-opacity-10 transition-colors"
                                style={{ color: colors.textPrimary }}
                            >
                                <Close className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Overall Rating Section */}
                            <div>
                                <h3 className="text-lg font-medium mb-3" style={{ color: colors.textPrimary }}>
                                    Overall Rating (Mandatory)
                                </h3>
                                <div className="flex gap-2 justify-center">
                                    {renderStars()}
                                </div>
                                {rating > 0 && (
                                    <p className="text-sm mt-2 text-center" style={{ color: colors.success }}>
                                        {rating} star{rating !== 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            {/* Write Review Section */}
                            <div>
                                <h3 className="text-lg font-medium mb-3" style={{ color: colors.textPrimary }}>
                                    Write a Review (Optional)
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write Review Description Here"
                                        className="w-full h-32 p-3 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                        style={{
                                            backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                                            borderColor: colors.border,
                                            color: colors.textPrimary,
                                            '::placeholder': {
                                                color: colors.textSecondary
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-center p-6 border-t" style={{ borderColor: colors.border }}>
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0}
                                className={`px-8 py-3 rounded-md font-medium transition-all duration-200 ${
                                    rating > 0 
                                        ? 'opacity-100 cursor-pointer hover:opacity-90' 
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                                style={{
                                    backgroundColor: rating > 0 ? colors.buttonPrimary : colors.buttonSecondary,
                                    color: rating > 0 ? colors.buttonSecondary : colors.buttonPrimary,
                                    border: `1px solid ${colors.border}`
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ReviewModal;
