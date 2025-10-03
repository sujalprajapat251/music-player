//chatgpt code

// import React, { useState } from "react";
// import { FaCcVisa, FaCcMastercard, FaPaypal, FaCcAmex } from "react-icons/fa";

// const PaymentUI = () => {
//   const [country, setCountry] = useState("India");

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
//       <div className="w-[420px] bg-[#1f1f1f] p-6 rounded-xl shadow-lg overflow-y-auto">
//         {/* Header */}
//         <h2 className="text-xl font-semibold mb-6">Production & Vocals</h2>

//         {/* Payment details */}
//         <p className="text-sm mb-2">Payment details</p>
//         <div className="flex gap-3 mb-5">
//           <div className="flex items-center justify-center bg-[#2a2a2a] rounded-lg px-4 py-3 cursor-pointer">
//             <FaCcVisa className="text-3xl mr-1" />
//             <FaCcMastercard className="text-3xl" />
//           </div>
//           <div className="flex items-center justify-center bg-[#2a2a2a] rounded-lg px-4 py-3 cursor-pointer">
//             <FaPaypal className="text-3xl mr-2" />
//             <FaCcAmex className="text-3xl" />
//           </div>
//         </div>

//         {/* Card details */}
//         <p className="text-sm mb-2">Card details</p>
//         <div className="border rounded-lg px-3 py-2 mb-3 bg-transparent flex justify-between">
//           <input
//             type="text"
//             placeholder="Card number"
//             className="bg-transparent outline-none text-sm flex-1"
//           />
//           <input
//             type="text"
//             placeholder="MM/YY"
//             className="bg-transparent outline-none text-sm w-16 text-center"
//           />
//           <input
//             type="text"
//             placeholder="CVV"
//             className="bg-transparent outline-none text-sm w-14 text-center"
//           />
//         </div>
//         <p className="text-xs text-gray-400 mb-4">
//           🔒 Your data is encrypted and secure.
//         </p>

//         {/* Country */}
//         <label className="text-sm mb-2 block">Country</label>
//         <select
//           value={country}
//           onChange={(e) => setCountry(e.target.value)}
//           className="w-full border rounded-lg px-3 py-2 bg-[#2a2a2a] text-sm mb-6"
//         >
//           <option>India</option>
//           <option>United States</option>
//           <option>United Kingdom</option>
//           <option>Canada</option>
//           <option>Australia</option>
//         </select>

//         {/* Prices */}
//         <div className="mb-6 text-sm">
//           <div className="flex justify-between mb-2">
//             <span>Due Oct 9, 2025</span>
//             <span className="font-medium">US$177.48</span>
//           </div>
//           <div className="flex justify-between">
//             <span>
//               Due today <span className="text-green-400 font-medium">7 days free</span>
//             </span>
//             <span className="font-medium">US$0.00</span>
//           </div>
//         </div>

//         {/* Checkbox */}
//         <label className="flex items-start gap-2 text-xs text-gray-300 mb-6">
//           <input type="checkbox" className="mt-0.5" />
//           <span>
//             I agree to be automatically charged the amount displayed above if I
//             don’t cancel my trial by Oct 9, 2025. After the trial, I will be charged on
//             the October 9 each subsequent year, unless I cancel my subscription
//             before that date. I can cancel via <span className="underline cursor-pointer">Subscription page</span>.{" "}
//             <span className="underline cursor-pointer">Promo Offer Terms</span> apply.
//           </span>
//         </label>

//         {/* Buttons */}
//         <button className="w-full bg-[#a259ff] hover:bg-[#8a3fd4] py-3 rounded-full font-semibold mb-4">
//           Start your free trial
//         </button>
//         <button className="w-full border border-gray-600 py-3 rounded-full font-medium">
//           Or pay now with 54% off →
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PaymentUI;







import React, { useState } from 'react';


export default function OpenPayment({ backToPricing }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [activePayment, setActivePayment] = useState('card');
  const [country, setCountry] = useState('India');

  const formatCardNumber = (value) => {
    const numbers = value.replace(/\s/g, '');
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').slice(0, 3);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto bg-[#1e1e1e] rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center mb-6 text-white text-lg font-semibold">
          <span onClick={ backToPricing } className="mr-3 text-2xl cursor-pointer">‹</span>
          <span>Production & Vocals</span>
        </div>

        {/* Payment Details */}
        <div className="text-white text-sm font-semibold mb-3">Payment details</div>
        
        <div className="flex gap-3 mb-4">
          {/* VISA/Mastercard Option */}
          <div 
            onClick={() => setActivePayment('card')}
            className={`flex-1 border-2 rounded-lg p-1 cursor-pointer transition-colors bg-[#2a2a2a] flex items-center justify-center ${
              activePayment === 'card' ? 'border-purple-600' : 'border-[#3a3a3a] hover:border-[#5a5a5a]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold italic text-white">VISA</span>
              <div className="flex">
                <div className="w-5 h-5 rounded-full bg-[#eb001b]"></div>
                <div className="w-5 h-5 rounded-full bg-[#ff5f00] -ml-2"></div>
              </div>
            </div>
          </div>

          {/* PayPal Option */}
          <div 
            onClick={() => setActivePayment('paypal')}
            className={`flex-1 border-2 rounded-lg p-1 cursor-pointer transition-colors bg-[#2a2a2a] flex items-center justify-center ${
              activePayment === 'paypal' ? 'border-purple-600' : 'border-[#3a3a3a] hover:border-[#5a5a5a]'
            }`}
          >
            <div className="flex flex-col items-start">
              <div className="text-lg font-bold italic text-white/80">
                Pay<span className="text-white/80">Pal</span>
              </div>
              <div className="flex gap-1 mt-0">
                <span className="text-[8px] px-1 py-0.5 rounded bg-[#006fcf] text-white font-bold">AMEX</span>
                <span className="text-[8px] px-1 py-0.5 rounded bg-[#ff6000] text-white font-bold">Discover</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className="text-white text-sm font-semibold mb-2">Card details</div>
        
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-2 mb-2 flex items-center gap-3">
          <div className="w-10 h-7 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-600 flex-shrink-0">
            💳
          </div>
          <div className="flex flex-1 gap-3">
            <div className="flex-[2]">
              <label className="block text-[11px] text-gray-400 mb-1">Card number</label>
              <input 
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-gray-400 mb-1">MM/YY</label>
              <input 
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                placeholder="12/25"
                className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-gray-400 mb-1">CVV</label>
              <input 
                type="text"
                value={cvv}
                onChange={(e) => setCvv(formatCVV(e.target.value))}
                placeholder="123"
                className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-1 text-[11px] text-gray-200 mb-5">
          <span className="text-xs">🔒</span>
          <span>Your data is encrypted and secure.</span>
        </div>

        {/* Country */}
        <div className="text-white text-sm font-semibold mb-2">Country</div>
        <select 
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-3 text-white text-sm mb-4 cursor-pointer outline-none appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23888%27%20d=%27M6%208L2%204h8z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center]"
        >
          <option>India</option>
          <option>United States</option>
          <option>United Kingdom</option>
          <option>Canada</option>
          <option>Australia</option>
        </select>

        {/* Pricing */}
        <div className="flex justify-between mb-3 text-sm">
          <span className="text-gray-300">Due Oct 10, 2025</span>
          <span className="text-white font-semibold">US$177.48</span>
        </div>

        <div className="flex justify-between mb-5 text-sm">
          <span className="text-gray-300">Due today <span className="text-green-500 font-semibold">7 days free</span></span>
          <span className="text-white font-semibold">US$0.00</span>
        </div>

        <div className="h-px bg-[#3a3a3a] my-5"></div>

        {/* Checkbox */}
        <div className="flex items-start gap-2.5 mb-4">
          <div 
            onClick={() => setIsChecked(!isChecked)}
            className={`w-[21px] h-[22px] border-2 border-[#3a3a3a] rounded cursor-pointer flex-shrink-0 mt-0.5 ${
              isChecked ? 'bg-purple-600 border-purple-600' : ''
            }`}
          >
            {isChecked && <span className="text-white text-sm leading-none">✓</span>}
          </div>
          <div className="text-[11px] text-gray-400 leading-relaxed">
            I agree to be automatically charged the amount displayed above if I don't cancel my trial by Oct 10, 2025. After the trial, I will be charged on the October 10 each subsequent year, unless I cancel my subscription before that date. I can cancel via <a href="#" className="text-purple-600 underline">Subscription page</a>. <a href="#" className="text-purple-600 underline">Promo Offer Terms</a> apply.
          </div>
        </div>

        {/* CTA Buttons */}
        <button className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-full p-2 text-base font-semibold mb-3 transition-transform hover:-translate-y-0.5">
          Start your free trial
        </button>
        
        <button className="w-full bg-white text-[#1e1e1e] rounded-full p-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-100">
          Or pay now with 54% off
          <span className="text-lg">›</span>
        </button>
      </div>
    </div>
  );
}
