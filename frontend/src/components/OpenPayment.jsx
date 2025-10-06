import React, { useState } from 'react';
import p1 from "../Images/p1.svg";
import p2 from "../Images/p2.svg";
import p3 from "../Images/p3.svg";

export default function OpenPayment({ backToPricing, plan }) {
  const [showSubscribe, setShowSubscribe] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [activePayment, setActivePayment] = useState('card'); // card OR paypal
  const [country, setCountry] = useState('India');

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 7); // trial end date
  const dueDateStr = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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

  // return (
  //   <div className="min-h-screen overflow-y-auto">
  //     <div className="max-w-md min-h-[79vh] mx-auto bg-[#1e1e1e] rounded-lg p-6 overflow-y-auto">
  //       {/* Header */}
  //       <div className="flex items-center mb-6 text-white text-lg font-semibold">
  //         <span onClick={backToPricing} className="mr-3 text-2xl cursor-pointer">‹</span>
  //         <span>{plan?.name ? plan.name : "Selected Plan"}</span>
  //       </div>

  //       {/* Payment Options */}
  //       <div className="text-white text-sm font-semibold mb-4">Payment details</div>
  //       <div className="flex gap-3 mb-4">
  //         {/* Card Option */}
  //         <div
  //           onClick={() => setActivePayment('card')}
  //           className={`flex-1 border-2 rounded-lg p-2 cursor-pointer transition-colors bg-[#2a2a2a] flex items-center justify-center ${
  //             activePayment === 'card' ? 'border-purple-600' : 'border-[#3a3a3a] hover:border-[#5a5a5a]'
  //           }`}
  //         >
  //           <span className="text-xl font-bold italic text-white">VISA</span>
  //           <div className="flex ml-2">
  //             <div className="w-5 h-5 rounded-full bg-[#eb001b]"></div>
  //             <div className="w-5 h-5 rounded-full bg-[#ff5f00] -ml-2"></div>
  //           </div>
  //         </div>

  //         {/* PayPal Option */}
  //         <div
  //           onClick={() => setActivePayment('paypal')}
  //           className={`flex-1 border-2 rounded-lg p-2 cursor-pointer transition-colors bg-[#2a2a2a] flex items-center justify-center ${
  //             activePayment === 'paypal' ? 'border-purple-600' : 'border-[#3a3a3a] hover:border-[#5a5a5a]'
  //           }`}
  //         >
  //           <div className="flex flex-col items-start">
  //             <div className="text-lg font-bold italic text-white/80">
  //               Pay<span className="text-white/80">Pal</span>
  //             </div>
  //             <div className="flex gap-1 mt-0">
  //               <span className="text-[8px] px-1 py-0.5 rounded bg-[#006fcf] text-white font-bold">AMEX</span>
  //               <span className="text-[8px] px-1 py-0.5 rounded bg-[#ff6000] text-white font-bold">Discover</span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* ---------- Conditional Rendering ---------- */}
  //       {activePayment === 'card' ? (
  //         <>
  //           {/* Card Details */}
  //           <div className="text-white text-sm font-semibold mb-3">Card details</div>
  //           <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-2 mb-3 flex items-center gap-3">
  //             <div className="w-10 h-7 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-600 flex-shrink-0">
  //               💳
  //             </div>
  //             <div className="flex flex-1 gap-3">
  //               <div className="flex-[2]">
  //                 <label className="block text-[11px] text-gray-400 mb-1">Card number</label>
  //                 <input
  //                   type="text"
  //                   inputMode="numeric"          // mobile keyboards show numbers
  //                   pattern="[0-9\s]*"
  //                   value={cardNumber}
  //                   // onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
  //                   onChange={(e) => {
  //                     const onlyNumbers = e.target.value.replace(/\D/g, ""); // remove all non-digits
  //                     setCardNumber(formatCardNumber(onlyNumbers));
  //                   }}
  //                   placeholder="1234 5678 9012 3456"
  //                   className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
  //                 />
  //               </div>
  //               <div className="flex-1">
  //                 <label className="block text-[11px] text-gray-400 mb-1">MM/YY</label>
  //                 <input
  //                   type="text"
  //                   value={expiryDate}
  //                   onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
  //                   placeholder="12/25"
  //                   className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
  //                 />
  //               </div>
  //               <div className="flex-1">
  //                 <label className="block text-[11px] text-gray-400 mb-1">CVV</label>
  //                 <input
  //                   type="text"
  //                   value={cvv}
  //                   onChange={(e) => setCvv(formatCVV(e.target.value))}
  //                   placeholder="123"
  //                   className="w-full bg-transparent border-none text-white text-sm outline-none placeholder-gray-600"
  //                 />
  //               </div>
  //             </div>
  //           </div>

  //           {/* Security Note */}
  //           <div className="flex items-center gap-1 text-[11px] text-gray-200 mb-5">
  //             <span className="text-xs">🔒</span>
  //             <span>Your data is encrypted and secure.</span>
  //           </div>
  //         </>
  //       ) : (
  //         <>
  //           {/* PayPal Selected Message */}
  //           {/* <div className="bg-[#2a2a2a] border border-purple-600 rounded-lg p-4 mb-5 text-center text-white">
  //             <p className="text-sm font-semibold">You have selected PayPal</p>
  //             <p className="text-xs text-gray-400 mt-1">
  //               After clicking "Start your free trial", you will be redirected to PayPal to complete your purchase securely.
  //             </p>
  //           </div> */}
  //         </>
  //       )}

  //       {/* Country */}
  //       <div className="text-white text-sm font-semibold mb-3">Country</div>
  //       <select
  //         value={country}
  //         onChange={(e) => setCountry(e.target.value)}
  //         className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-3 text-white text-sm mb-4 cursor-pointer outline-none"
  //       >
  //         <option>India</option>
  //         <option>United States</option>
  //         <option>United Kingdom</option>
  //         <option>Canada</option>
  //         <option>Australia</option>
  //       </select>

  //       {/* Pricing */}
  //       <div className="flex justify-between mb-3 text-sm">
  //         <span className="text-gray-300">Due {dueDateStr}</span>
  //         <span className="text-white font-semibold">US${plan?.price}.00{" "} {plan?.period && `(${plan.period})`}</span>
  //       </div>

  //       <div className="flex justify-between mb-5 text-sm">
  //         <span className="text-gray-300">Due today{" "} <span className="text-green-500 font-semibold">7 days free</span></span>
  //         <span className="text-white font-semibold">US$0.00</span>
  //       </div>

  //       <div className="h-px bg-[#3a3a3a] my-5"></div>

  //       {/* Checkbox */}
  //       <div className="flex items-start gap-2.5 mb-6">
  //         <div
  //           onClick={() => setIsChecked(!isChecked)}
  //           className={`w-[21px] h-[22px] border-2 border-[#3a3a3a] rounded cursor-pointer flex-shrink-0 mt-0.5 ${
  //             isChecked ? 'bg-purple-600 border-purple-600' : ''
  //           }`}
  //         >
  //           {isChecked && <span className="text-white text-sm leading-none">✓</span>}
  //         </div>
  //         <div className="text-[11px] text-gray-400 leading-relaxed">
  //           I agree to be automatically charged the amount displayed above if I don't cancel my trial by {dueDateStr} .
  //           After the trial, I will be charged each subsequent year unless I cancel before that date.
  //         </div>
  //       </div>

  //       {/* Buttons */}
  //       {/* <button className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-full p-2 text-base font-semibold mb-3 transition-transform hover:bg-purple-900">
  //         Start your free trial
  //       </button> */}
  //       {/* <button className="w-full bg-white text-[#1e1e1e] rounded-full p-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-50">
  //         Or pay now with 50% off
  //         <span className="text-lg">›</span>
  //       </button> */}
  //       {showSubscribe ? (
  //         <button className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-full p-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-green-600">
  //           Subscribe
  //         </button>
  //       ) : (
  //         <>
  //           <button className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-full p-2 text-base font-semibold mb-3 transition-transform hover:bg-purple-900">
  //             Start your free trial
  //           </button>
  //           <button
  //             className="w-full bg-white text-[#1e1e1e] rounded-full p-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
  //             onClick={() => setShowSubscribe(true)}
  //           >
  //             Or pay now with 50% off
  //             <span className="text-lg">›</span>
  //           </button>
  //         </>
  //       )}
  //     </div>
  //   </div>
  // );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[#141414] text-white min-h-[79vh] rounded-lg overflow-y-auto p-6">
      {/* ================= Left Side - Payment ================= */}
      <div>
        {/* Header */}
        <div className="flex items-center mb-6 text-lg font-semibold">
          <span
            onClick={backToPricing}
            className="mr-3 text-2xl cursor-pointer"
          >
            ‹
          </span>
          <span>{plan?.name ? plan.name : "Selected Plan"}</span>
        </div>

        {/* Payment Options */}
        <div className="text-white text-sm font-semibold mb-4">Payment details</div>
        <div className="flex gap-3 mb-4">
          {/* Card Option */}
          <div
            onClick={() => setActivePayment("card")}
            className={`flex-1 border-2 rounded-lg p-2 cursor-pointer transition-colors bg-[#2a2a2a] flex items-center justify-center ${
              activePayment === "card"
                ? "border-purple-600"
                : "border-[#3a3a3a] hover:border-[#5a5a5a]"
            }`}
          >
            <span className="text-xl font-bold italic">VISA</span>
            <div className="flex ml-2">
              <div className="w-5 h-5 rounded-full bg-[#eb001b]"></div>
              <div className="w-5 h-5 rounded-full bg-[#ff5f00] -ml-2"></div>
            </div>
          </div>

          {/* PayPal Option */}
          <div
            onClick={() => setActivePayment("paypal")}
            className={`flex-1 border-2 rounded-lg p-2 cursor-pointer transition-colors bg-[#2a2a2a] flex items-center justify-center ${
              activePayment === "paypal"
                ? "border-purple-600"
                : "border-[#3a3a3a] hover:border-[#5a5a5a]"
            }`}
          >
            <div className="flex flex-col items-start">
              <div className="text-lg font-bold italic">
                Pay<span className="text-white/80">Pal</span>
              </div>
              <div className="flex gap-1 mt-0">
                <span className="text-[8px] px-1 py-0.5 rounded bg-[#006fcf] font-bold">
                  AMEX
                </span>
                <span className="text-[8px] px-1 py-0.5 rounded bg-[#ff6000] font-bold">
                  Discover
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Conditional Rendering ---------- */}
        {activePayment === "card" && (
          <>
            {/* Card Details */}
            <div className="text-white text-sm font-semibold mb-3">Card details</div>
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-2 mb-3 flex items-center gap-3">
              <div className="w-10 h-7 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-600 flex-shrink-0">
                💳
              </div>
              <div className="flex flex-1 gap-3">
                <div className="flex-[2]">
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Card number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9\s]*"
                    value={cardNumber}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      setCardNumber(formatCardNumber(onlyNumbers));
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full bg-transparent border-none text-sm outline-none placeholder-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-gray-400 mb-1">
                    MM/YY
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                    placeholder="12/25"
                    className="w-full bg-transparent border-none text-sm outline-none placeholder-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] text-gray-400 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(formatCVV(e.target.value))}
                    placeholder="123"
                    className="w-full bg-transparent border-none text-sm outline-none placeholder-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-1 text-[11px] text-gray-200 mb-5">
              <span className="text-xs">🔒</span>
              <span>Your data is encrypted and secure.</span>
            </div>
          </>
        )}

        {/* Country */}
        <div className="text-white text-sm font-semibold mb-3">Country</div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-3 text-sm mb-4 cursor-pointer outline-none"
        >
          <option>India</option>
          <option>United States</option>
          <option>United Kingdom</option>
          <option>Canada</option>
          <option>Australia</option>
        </select>

        {/* Pricing */}
        <div className="flex justify-between mb-3 text-sm">
          <span className="text-gray-300">Due {dueDateStr}</span>
          <span className="text-white font-semibold">US${plan?.price}.00{" "} {plan?.period && `(${plan.period})`}</span>
        </div>

        <div className="flex justify-between mb-5 text-sm">
          <span className="text-gray-300">Due today{" "} <span className="text-green-500 font-semibold">7 days free</span></span>
          <span className="text-white font-semibold">US$0.00</span>
        </div>

        <div className="h-px bg-[#3a3a3a] my-5"></div>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-2.5 mb-6">
          <div
            onClick={() => setIsChecked(!isChecked)}
            className={`w-[20px] h-[23px] border-2 border-[#3a3a3a] rounded cursor-pointer flex-shrink-0 mt-0.5 ${
              isChecked ? "bg-purple-600 border-purple-600" : ""
            }`}
          >
            {isChecked && (
              <span className="text-white text-sm ml-0.5 leading-none">✓</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 leading-relaxed">
            I agree to be automatically charged the amount displayed above if I don't cancel my trial by {dueDateStr} .
            After the trial, I will be charged each subsequent year unless I cancel before that date.
          </div>
        </div>

        {/* Buttons */}
        {showSubscribe ? (
          <button className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-full p-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-green-600">
            Subscribe
          </button>
        ) : (
          <>
            <button className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-full p-2 text-base font-semibold mb-3 transition-transform hover:bg-purple-900">
              Start your free trial
            </button>
            <button
              className="w-full bg-white text-[#1e1e1e] rounded-full p-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
              onClick={() => setShowSubscribe(true)}
            >
              Or pay now with 50% off
              <span className="text-lg">›</span>
            </button>
          </>
        )}
      </div>

      {/* ================= Right Side - Plan Details ================= */}
      <div className="bg-[#2a2a2a] rounded-lg p-8 flex flex-col justify-between ">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-center">{plan?.name}</h2>
          <p className="text-xl font-bold mb-1 text-center">${plan?.price} / {plan?.price>100 ? "year" : "month"}</p>
          {/* <p className="text-sm text-gray-400 mb-4">
            {plan?.period === "plan.price" ? "per year" : "per month"}
          </p> */}

          <ul className="text-sm space-y-2 text-gray-300 mt-4">
            {plan?.name === "Starter" && (
              <>
                <div className="main-price-month mt-4 text-[#FFFFFF99] text-[14px]">
                  <ul className="list-disc list-inside text-center">
                    <li>10,000+ loops</li>
                    <li className="mt-1 ml-5">200 instruments</li>
                    <li className="mt-1 mr-6">50 effects</li>
                    <li className="mt-1 ml-12">Advanced vocal tools</li>
                  </ul>
                </div>

                <div className="p1-box flex-1 w-full max-w-full flex items-center justify-center flex-col">
                  <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center mt-4">
                    <img src={p1} alt="" />
                  </div>
                  <div className="p1-contant text-[#FFFFFF] mt-2">
                    <p className="text-[20px] mt-2 ml-16">41K+</p>
                    <p className="text-[22px] mt-2 ml-1">loops/one-shots</p>
                    <p className="text-[14px] ml-12 text-[#FFFFFF99] mt-2">
                      (everything)
                    </p>
                  </div>
                  <div className="main-price-month mt-4 text-[#FFFFFF99] text-[14px] ml-6">
                    <ul>
                      <li>50+ effects</li>
                      <li>Realtime vocal tuning</li>
                      <li>Vocal tuning</li>
                      <li>Vocal cleanup</li>
                      <li>808 instrument (with glide)</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
            {plan?.name === "Professional" && (
              <>
                <div className="main-price-month mt-4 text-[#FFFFFF99] text-[14px]">
                  <ul className="list-disc list-inside text-center">
                    <li>7,000+ loops</li>
                    <li className="mt-1 ml-5">150 instruments</li>
                    <li className="mt-1 mr-5">30 effects</li>
                    <li className="mt-1 ml-6">Basic vocal tools</li>
                  </ul>
                </div>
                <div className="p1-box flex-1 w-full max-w-full flex items-center justify-center flex-col">
                  <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center mt-4">
                    <img src={p2} alt="" />
                  </div>
                  <div className="p1-contant text-[#FFFFFF] mt-2">
                    <p className="text-[20px] mt-2 ml-16">1250+</p>
                    <p className="text-[22px] mt-2 ml-2">Music Production</p>
                    <p className="text-[14px] mt-2 ml-14 text-[#FFFFFF99]">
                      (everything)
                    </p>
                  </div>
                  <div className="main-price-month mt-4 text-[#FFFFFF99] text-[14px] ml-8">
                    <ul>
                      <li>Chords</li>
                      <li>Realtime vocal tuning</li>
                      <li>Save presets and loops </li>
                      <li>150k+ Sound Effects freesound</li>
                      <li>Automation</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
            {plan?.name === "Enterprise" && (
              <>
                <div className="main-price-month mt-4 text-[#FFFFFF99] text-[14px]">
                  <ul className="list-disc list-inside text-center">
                    <li>Unlimited users</li>
                    <li className="mt-1 mr-1">Priority mixing</li>
                    <li className="mt-1 ml-14">High quality downloads</li>
                    <li className="mt-1 ml-24">Multi-speaker transcription (8h)</li>
                  </ul>
                </div>
                <div className="p1-box flex-1 w-full max-w-full flex items-center justify-center flex-col">
                  <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center mt-4">
                    <img src={p3} alt="" />
                  </div>
                  <div className="p1-contant text-[#FFFFFF] mt-2">
                    <p className="text-[20px] mt-2 ml-16">41K+</p>
                    <p className="text-[22px] mt-2">loops/one-shots</p>
                    <p className="text-[14px] mt-2 text-[#FFFFFF99] ml-12">
                      (everything)
                    </p>
                  </div>
                  <div className="main-price-month mt-4 text-[#FFFFFF99] text-[14px] ml-8">
                    <ul>
                      <li>Sampler</li>
                      <li>Priority mixing</li>
                      <li>High quality downloads</li>
                      <li>8 mastering styles</li>
                      <li>Multi-speaker transcription (8h)</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
