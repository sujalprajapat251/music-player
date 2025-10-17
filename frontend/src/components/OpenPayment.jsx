import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import { useSelector, useDispatch } from 'react-redux';
import { createPaymentIntent, confirmPaymentSuccess } from '../Redux/Slice/PaymentSlice';

import visa from "../Images/visa.png";
import mastercard from "../Images/mastercard.png";
import amex from "../Images/amex.png";
import rupay from "../Images/rupay.png";
import bhim from "../Images/bhim.png";
import paytm from "../Images/paytm.png";
import Gpay from "../Images/Gpay.png";
import phonepe from "../Images/phonepe.png";
import citi from "../Images/citi.png";
import wells from "../Images/wf.png";
import capital from "../Images/capitalone.png";
import td from "../Images/td.png";
import hdfc from "../Images/hdfc.png";
import sbi from "../Images/sbi.png";
import axis from "../Images/axis.png";
import icici from "../Images/icici.png";

const stripePromise = loadStripe("pk_test_51R8wmeQ0DPGsMRTSHTci2XmwYmaDLRqeSSRS2hNUCU3xU7ikSAvXzSI555Rxpyf9SsTIgI83PXvaaQE3pJAlkMaM00g9BdsrOB")

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#fff",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "10px 12px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
};
const CARD_STYLE = {
  style: {
    base: {
      color: "#fff",
      fontSize: "16px",
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.5px",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: {
      color: "#ff6b6b",
      iconColor: "#ff6b6b",
    },
  },
};

// INNER COMPONENT - Uses Stripe hooks
function PaymentForm({ backToPricing, amount, selectedPlan, propSelectedPlan, onPaymentSuccess, onPaymentError }) {

  const user = sessionStorage.getItem('userId');
  console.log('user', user);


  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  // Fetch the selected plan from Redux store
  const reduxSelectedPlan = useSelector((state) => state.premium?.selectedPlan);
  const paymentState = useSelector((state) => state.payment || {});
  const { clientSecret, loading } = paymentState;

  // Use prop selected plan if available, otherwise use Redux selected plan
  const effectiveSelectedPlan = propSelectedPlan || reduxSelectedPlan;
  const effectiveSelectedPlanPeriod = effectiveSelectedPlan.period ;
  console.log('OpenPayment plan', effectiveSelectedPlanPeriod);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [activePayment, setActivePayment] = useState('card');
  const [cardHolderName, setCardHolderName] = useState('');
  const [upiId, setUpiId] = useState("");
  const [upiDomain, setUpiDomain] = useState("@okicici");
  const [searchBank, setSearchBank] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const upiDomains = ["@okicici", "@oksbi", "@okaxis", "@okhdfcbank"];

  const formatCardNumber = (value) => {
    const numbers = value.replace(/\s/g, '').replace(/\D/g, '');
    return numbers.match(/.{1,4}/g)?.join(' ')?.slice(0, 19) || numbers;
  };

  const formatExpiry = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const banks = [
    {
      name: "Citi Bank",
      logo: citi,
    },
    {
      name: "Wells Fargo Bank",
      logo: wells,
    },
    {
      name: "Capital One Bank",
      logo: capital,
    },
    {
      name: "TD Bank",
      logo: td,
    },
    {
      name: "HDFC Bank",
      logo: hdfc,
    },
    {
      name: "SBI Bank",
      logo: sbi,
    },
    {
      name: "Axis Bank",
      logo: axis,
    },
    {
      name: "ICICI Bank",
      logo: icici,
    },
  ];

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchBank.toLowerCase())
  );

  const handlePaymentSuccess = (message) => {
    setPaymentMessage(message);
    setPaymentError("");
  };

  const handlePaymentError = (error) => {
    setPaymentError(error);
    setPaymentMessage("");
  };

  const handlePayment = async () => {
    try {
      // Validate Stripe is loaded
      if (!stripe || !elements) {
        console.error('Stripe not loaded');
        alert("Payment system is not ready. Please try again.");
        return;
      }

      // Validate selected plan
      if (!effectiveSelectedPlan) {
        console.error("No selected plan found");
        alert("Please select a plan first");
        return;
      }

      // Validate card holder name for card payments
      if (activePayment === 'card' && !cardHolderName.trim()) {
        alert("Please enter the card holder name");
        return;
      }

      // Create payment intent
      const paymentData = {
        amount: (effectiveSelectedPlan.amount || effectiveSelectedPlan.price || 0) * 100, // Convert to cents/paise
        currency: effectiveSelectedPlan.currency || 'inr',
        planId: effectiveSelectedPlan._id || effectiveSelectedPlan.id,
      };

      console.log('Creating payment intent with data:', paymentData);

      // Dispatch the payment intent creation
      const intentResult = await dispatch(createPaymentIntent(paymentData)).unwrap();
      console.log("Payment intent created:", intentResult);

      // Get the client secret from the result
      const currentClientSecret = intentResult?.clientSecret;
      console.log('Client Secret received:', currentClientSecret ? 'Yes' : 'No');

      if (!currentClientSecret) {
        console.error('No client secret available');
        alert("Payment initialization failed. Please try again.");
        return;
      }

      // Get card element
      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        console.error('Card element not found');
        alert('Payment form not properly loaded. Please refresh the page.');
        return;
      }

      console.log('Confirming card payment...');

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(currentClientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardHolderName || "Guest",
          },
        },
      });

      // Handle payment result
      if (error) {
        console.error('Payment error:', error);
        alert(error.message || "Payment failed. Please try again.");
        handlePaymentError(error.message);
        if (onPaymentError) {
          onPaymentError(error);
        }
      } else if (paymentIntent) {
        console.log('Payment successful:', paymentIntent);

        if (paymentIntent.status === 'succeeded') {
          alert("Payment successful!");
          handlePaymentSuccess("Payment completed successfully");
          
          // Send confirmation to backend to store payment data
          const confirmData = {
            planId: effectiveSelectedPlan._id || effectiveSelectedPlan.id,
            cardHolder: cardHolderName,
            period: effectiveSelectedPlan.period,
            startDate: new Date(),
            endDate: new Date(Date.now() + (effectiveSelectedPlan.period === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
            amount: (effectiveSelectedPlan.amount || effectiveSelectedPlan.price || 0) * 100,
            userId: user // Assuming you have user ID available
          };
          console.log('Sending payment confirmation data:', confirmData);
          // Dispatch the confirmation action
          dispatch(confirmPaymentSuccess(confirmData));
          
          if (onPaymentSuccess) {
            onPaymentSuccess(paymentIntent);
          }
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other authentication required
          console.log('Additional authentication required');
          alert("Additional authentication required. Please complete the verification.");
        } else {
          console.log('Payment status:', paymentIntent.status);
          alert(`Payment status: ${paymentIntent.status}`);
        }
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      alert(error.message || "An error occurred during payment. Please try again.");
      handlePaymentError(error.message);
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  return (
    <div className="max-h-[80vh] flex items-center justify-center bg-white dark:bg-[#1f1f1f] p-2 md:p-4">
      <div className="w-[920px] max-w-full bg-transparent relative">
        <div className="p-1 md:p-4 text-black dark:text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={backToPricing}
                className="text-2xl leading-none hover:opacity-80"
                aria-label="back"
              >
                ‹
              </button>
              <h3 className="text-sm md600:text-lg text-wrap">Production &amp; Vocals - {selectedPlan?.premiumType || selectedPlan?.name || "Plan"}</h3>
            </div>

            <button
              onClick={() => backToPricing && backToPricing(null)}
              className="text-xl opacity-60 hover:opacity-90"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          {console.log('OpenPayment', selectedPlan)}
          {/* First box: Credit Card / Debit Card (expanded) */}
          <div
            className={`rounded-md border p-3 lg:p-4 mb-4 transition-all duration-300 ${activePayment === 'card' ? 'border-[#6b6b6b] bg-white dark:bg-[#1f1f1f]' : 'border-[#2b2b2b] bg-transparent'
              }`}
            onClick={() => setActivePayment('card')}
            style={{ cursor: "pointer" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-start sm:justify-between py-2">
              <div className="flex items-center gap-2 md:gap-3">
                <input
                  type="radio"
                  name="paymethod"
                  checked={activePayment === 'card'}
                  onChange={() => setActivePayment('card')}
                  className="accent-white "
                />
                <div className="text-[12px] md600:text-[20px] font-medium text-nowrap my-auto">Credit Card / Debit Card</div>
              </div>

              {/* small card logos on right */}
              <div className="flex items-center gap-0.3 justify-end mt-2 sm:mt-0">
                <img src={visa} alt='visa' className="w-9 h-6 object-contain" />
                <img src={mastercard} alt='mastercard' className="w-9 h-6 object-contain" />
                <img src={amex} alt='amex' className="w-9 h-6 object-contain" />
                <img src={rupay} alt='rupay' className="w-9 h-6 object-contain" />
              </div>
            </div>

            {activePayment === "card" && (
              <>
                <hr className="border-t border-[#2b2b2b] my-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 sm:mt-4 gap-4 sm:gap-3 md:gap-5">
                  <div>
                    <label className="text-xs text-black dark:text-gray-200 mb-2 block">Card Number</label>
                    <CardNumberElement options={CARD_OPTIONS} className='w-full bg-gray-100 dark:bg-[#2c2c2c] border border-[#333] rounded-md px-2 sm:px-3 py-2 sm:py-3 text-sm placeholder-[#646464] outline-none' />
                  </div>

                  <div>
                    <label className="text-xs text-black dark:text-gray-200 mb-2 block">Card Holder Name</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                        value = value.replace(/\s{2,}/g, " ");
                        setCardHolderName(value);
                      }}
                      onKeyPress={(e) => {
                        const char = String.fromCharCode(e.which);
                        if (!/^[A-Za-z\s]$/.test(char)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Card Holder Name"
                      className="w-full bg-gray-100 dark:bg-[#2c2c2c] border border-[#333] rounded-md px-2 sm:px-3 py-2 sm:py-3 text-sm placeholder-[#646464] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-black dark:text-gray-200 mb-2 block">Expiry Date</label>
                    <CardExpiryElement options={CARD_OPTIONS} className='w-full bg-gray-100 dark:bg-[#2c2c2c] border border-[#333] rounded-md px-2 sm:px-3 py-2 sm:py-3 text-sm placeholder-[#646464] outline-none' />
                  </div>

                  <div>
                    <label className="text-xs text-black dark:text-gray-200 mb-2 block">CVV</label>
                    <CardCvcElement
                      options={{
                        ...CARD_STYLE,
                        placeholder: 'CVV'
                      }}
                      className='w-full bg-gray-100 dark:bg-[#2c2c2c] border border-[#333] rounded-md px-2 sm:px-3 py-2 sm:py-3 text-sm placeholder-[#646464] outline-none'
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Other payment options collapsed style */}
          <div
            className={`rounded-md border p-3 lg:p-4 mb-4 transition-all duration-300 ${activePayment === 'upi' ? 'border-[#6b6b6b]' : 'border-[#2b2b2b]'
              }`}
            onClick={() => setActivePayment('upi')}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 md:gap-3">
                <input
                  type="radio"
                  name="paymethod"
                  checked={activePayment === 'upi'}
                  onChange={() => setActivePayment('upi')}
                  className="accent-white"
                />
                <span className="text-sm">UPI</span>
              </div>
              <div className="flex items-center mr-[-14px]">
                <img src={bhim} alt='bhim' className="w-9 h-6 object-contain" />
                <img src={paytm} alt='paytm' className="w-9 h-6 object-contain" />
                <img src={Gpay} alt='Gpay' className="w-9 h-6 object-contain" />
                <img src={phonepe} alt='phonepe' className="w-9 h-6 object-contain" />
              </div>
            </div>
            <AnimatePresence>
              {activePayment === "upi" && (
                <>
                  <hr className="border-t border-[#2b2b2b] my-2" />
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-2 sm:p-3">
                      <label className="text-sm block mb-2 text-black dark:text-gray-200">UPI ID</label>
                      <div className="flex items-center bg-gray-100 dark:bg-[#2c2c2c] border border-[#2b2b2b] rounded-md">
                        <input
                          type="text"
                          placeholder="UPI ID"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-transparent text-black dark:text-white text-sm p-2 sm:p-3 focus:outline-none"
                        />
                        <select
                          value={upiDomain}
                          onChange={(e) => setUpiDomain(e.target.value)}
                          className="bg-transparent text-black dark:text-white text-sm p-2 sm:p-3 focus:outline-none border-l border-[#606060] w-24 sm:w-36"
                        >
                          {upiDomains.map((domain) => (
                            <option
                              key={domain}
                              value={domain}
                              className="bg-[#1a1a1a] text-[#f2f2f2]"
                            >
                              {domain}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div
            className={`rounded-md border p-3 lg:p-4 mb-6 ${activePayment === 'netbank' ? 'border-[#6b6b6b]' : 'border-[#2b2b2b]'
              }`}
            onClick={() => setActivePayment('netbank')}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex flex-col sm:flex-row justify-start sm:items-center sm:justify-between py-2">
              <div className="flex items-center gap-2 md:gap-3">
                <input
                  type="radio"
                  name="paymethod"
                  checked={activePayment === 'netbank'}
                  onChange={() => setActivePayment('netbank')}
                  className="accent-white"
                />
                <span className="text-sm text-nowrap">Net banking</span>
              </div>
              <div className="flex justify-end items-center  mt-2 sm:mt-0 ">
                <img src={citi} alt='citi' className="w-9 h-6 bg-white object-contain" />
                <img src={wells} alt='wells' className="w-9 h-6 object-contain" />
                <img src={capital} alt='capital' className="w-9 h-6 object-contain" />
                <img src={td} alt='td' className="w-9 h-6 object-contain" />
              </div>
            </div>

            {activePayment === "netbank" && (
              <>
                <hr className="border-t border-[#2b2b2b] my-2" />
                <div className="mt-4 rounded-md p-2 sm:p-3">
                  {/* Search Bar */}
                  <div className="bg-gray-100 dark:bg-[#2c2c2c] rounded-md p-2 sm:p-3 mb-4 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search your bank"
                      value={searchBank}
                      onChange={(e) => setSearchBank(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-[#2c2c2c] text-black dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Bank Logos */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 lg:gap-6">
                    {filteredBanks.map((bank) => (
                      <div key={bank.name} className="flex flex-col items-center mt-2">
                        <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain mb-2" />
                        <span className="text-xs text-center text-gray-300">{bank.name}</span>
                      </div>
                    ))}
                    {filteredBanks.length === 0 && (
                      <p className="col-span-4 text-gray-500 text-sm text-center">No banks found</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Centered Next button */}
          <div className="mt-12 mb-14 pri-next-btn text-center">
            {console.log('OpenPayment', effectiveSelectedPlan)}
            <button
              className="bg-white border border-black text-black font-semibold py-3 px-24 md:px-40 rounded-md shadow-lg hover:scale-105 transition-transform"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : (
                effectiveSelectedPlan && (effectiveSelectedPlan.amount || effectiveSelectedPlan.price)
                  ? `Pay ₹${effectiveSelectedPlan.amount || effectiveSelectedPlan.price || 0}`
                  : "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// OUTER COMPONENT - Wraps with Elements provider
export default function OpenPayment(props) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}