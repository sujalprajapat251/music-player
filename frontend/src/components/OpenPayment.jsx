// import React, { useState } from "react";
// import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

// const Payment = () => {
//   const [cardNumber, setCardNumber] = useState("");
//   const [expiry, setExpiry] = useState("");
//   const [cvv, setCvv] = useState("");
//   const [country, setCountry] = useState("India");
//   const [agree, setAgree] = useState(false);
//   const [cardError, setCardError] = useState(false);
//   const [openPayment, setOpenPayment] = useState(false);

//   const handleCardInput = (e) => {
//     setCardNumber(e.target.value);
//     setCardError(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (cardNumber.length < 16) {
//       setCardError(true);
//       return;
//     }
//     alert("Payment submitted!");
//     setOpenPayment(false);
//     // Submit logic here
//   };

//   const OpenPayment = ({ onClose, handleSubmit, cardNumber, handleCardInput, expiry, setExpiry, cvv, setCvv, country, setCountry, agree, setAgree, cardError }) => {
//     return (
//       <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
//         <DialogBackdrop className="fixed inset-0 bg-black/50" />
//         <DialogPanel>
//           <div className="bg-[#262529] text-white p-8 rounded-xl w-[400px] mx-auto shadow-lg">
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//               <span className="mr-2">&lt;</span> Production & Vocals
//             </h2>
//             <form onSubmit={handleSubmit}>
//               {/* Payment form fields (same as your current code) */}
//               <div className="mb-4">
//                 <input
//                   type="text"
//                   placeholder="Card number"
//                   className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-full mb-2"
//                   value={cardNumber}
//                   onChange={handleCardInput}
//                 />
//                 {cardError && <span className="text-red-500 text-sm">Invalid card details</span>}
//                 <div className="flex gap-2 mt-2">
//                   <input
//                     type="text"
//                     placeholder="MM/YY"
//                     className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-1/2"
//                     value={expiry}
//                     onChange={(e) => setExpiry(e.target.value)}
//                   />
//                   <input
//                     type="text"
//                     placeholder="CVV"
//                     className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-1/2"
//                     value={cvv}
//                     onChange={(e) => setCvv(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Country & Agree checkbox */}
//               <select
//                 className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-full mb-4"
//                 value={country}
//                 onChange={(e) => setCountry(e.target.value)}
//               >
//                 <option value="India">India</option>
//                 <option value="USA">USA</option>
//                 <option value="UK">UK</option>
//               </select>

//               <label className="flex items-start gap-2 text-xs mb-4">
//                 <input
//                   type="checkbox"
//                   checked={agree}
//                   onChange={() => setAgree(!agree)}
//                   className="mt-1"
//                 />
//                 <span>
//                   I agree to the terms...
//                 </span>
//               </label>

//               <button
//                 type="submit"
//                 className="w-full bg-[#8f4fff] text-white font-bold py-3 rounded-full mb-4 hover:bg-[#7a3ee6] transition"
//                 disabled={!agree}
//               >
//                 Start your free trial
//               </button>

//               <button
//                 type="button"
//                 className="w-full bg-white text-black font-bold py-3 rounded-full border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center"
//                 onClick={onClose}
//               >
//                 Cancel
//               </button>
//             </form>
//           </div>
//         </DialogPanel>
//       </Dialog>
//     );
//   }
// };

// export default Payment;




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







import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const OpenPayment = ({
  open,
  onClose,
  handleSubmit,
  cardNumber,
  handleCardInput,
  expiry,
  setExpiry,
  cvv,
  setCvv,
  country,
  setCountry,
  agree,
  setAgree,
  cardError,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <DialogPanel>
        <div className="bg-[#262529] text-white p-8 rounded-xl w-[400px] mx-auto shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="mr-2">&lt;</span> Production & Vocals
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Card details */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Card number"
                className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-full mb-2"
                value={cardNumber}
                onChange={handleCardInput}
              />
              {cardError && (
                <span className="text-red-500 text-sm">Invalid card details</span>
              )}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-1/2"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-1/2"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>

            {/* Country & checkbox */}
            <select
              className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-full mb-4"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
            </select>

            <label className="flex items-start gap-2 text-xs mb-4">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="mt-1"
              />
              <span>I agree to the terms...</span>
            </label>

            <button
              type="submit"
              className="w-full bg-[#8f4fff] text-white font-bold py-3 rounded-full mb-4 hover:bg-[#7a3ee6] transition"
              disabled={!agree}
            >
              Start your free trial
            </button>

            <button
              type="button"
              className="w-full bg-white text-black font-bold py-3 rounded-full border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center"
              onClick={onClose}
            >
              Cancel
            </button>
          </form>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default OpenPayment;
