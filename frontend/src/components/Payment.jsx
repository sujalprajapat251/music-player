import React, { useState } from "react";

const Payment = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [country, setCountry] = useState("India");
  const [agree, setAgree] = useState(false);
  const [cardError, setCardError] = useState(false);

  const handleCardInput = (e) => {
    setCardNumber(e.target.value);
    setCardError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.length < 16) {
      setCardError(true);
      return;
    }
    // Submit logic here
  };

  return (
    <div className="bg-[#262529] text-white p-8 rounded-xl w-[400px] mx-auto shadow-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="mr-2">&lt;</span> Production & Vocals
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Payment details</label>
          <div className="flex gap-4 mb-2">
            <div className="border-2 border-[#fff] rounded-lg p-2 flex items-center bg-[#18171b]">
              <img src="/visa-mastercard.png" alt="Visa Mastercard" className="h-6" />
            </div>
            <div className="border-2 border-[#fff] rounded-lg p-2 flex items-center bg-[#18171b]">
              <img src="/paypal.png" alt="Paypal" className="h-6" />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Card details</label>
          <div className="flex gap-2 mb-1">
            <input
              type="text"
              placeholder="Card number"
              className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-1/2"
              value={cardNumber}
              onChange={handleCardInput}
            />
            <input
              type="text"
              placeholder="MM/YY"
              className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-1/4"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <input
              type="text"
              placeholder="CVV"
              className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-1/4"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
          {cardError && (
            <span className="text-red-500 text-sm mt-1 block">Invalid card details</span>
          )}
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <svg width="16" height="16" fill="none" className="mr-1">
              <path d="M8 1.5a3.5 3.5 0 0 1 3.5 3.5v2.5h-7V5A3.5 3.5 0 0 1 8 1.5zm-2.5 5.5h5V5A2.5 2.5 0 0 0 8 2.5 2.5 2.5 0 0 0 5.5 5v2.5zM4 8.5a4 4 0 1 1 8 0v3a4 4 0 1 1-8 0v-3zm1 0v3a3 3 0 1 0 6 0v-3a3 3 0 1 0-6 0z" fill="#888" />
            </svg>
            Your data is encrypted and secure.
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Country</label>
          <select
            className="bg-[#18171b] border border-gray-600 rounded-lg p-2 w-full"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            {/* Add more countries as needed */}
          </select>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span>Due <b>Oct 8, 2025</b></span>
            <span className="font-bold">US$177.48</span>
          </div>
          <div className="flex justify-between items-center">
            <span>
              Due today <span className="text-green-400 font-semibold">7 days free</span>
            </span>
            <span className="font-bold">US$0.00</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mt-1"
            />
            <span>
              I agree to be automatically charged the amount displayed above if I don't cancel my trial by Oct 8, 2025. After the trial, I will be charged on the October 8 each subsequent year, unless I cancel my subscription before that date. I can cancel via <a href="#" className="underline">Subscription page</a>. <a href="#" className="underline">Promo Offer Terms</a> apply.
            </span>
          </label>
        </div>
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
        >
          Or pay now with 54% off <span className="ml-2">&rarr;</span>
        </button>
      </form>
    </div>
  );
};

export default Payment;