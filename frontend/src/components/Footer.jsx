import React from "react";

const Footer = () => {
  return (
    <>
      <section className="container mt-20 px-4">
        <div className="k-footer flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="logo">
              <p className="text-[#FFFFFF] text-[32px] sm:text-[40px]">LOGO</p>
            </div>
            <div className="footer-manu text-[#FFFFFF66] mt-4 flex flex-wrap sm:gap-x-4 gap-y-2">
              <span>Music</span>
              <span>FAQs</span>
              <span>Pricing</span>
              <span>Contact us</span>
            </div>
          </div>
          <div className="w-full max-w-md mt-8 md:mt-0">
            <label className="block mb-2 text-white">Join our newsletter</label>
            <form className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-3 bg-[#232323] text-white rounded-l-md focus:outline-none w-full"
              />
              <button
                type="submit"
                className="w-28 px-0 py-3 bg-[#E5E5E5] text-black font-medium rounded-r-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
      <div className="bg-[#FFFFFF1A] my-6 border-[1px] border-[#FFFFFF1A] mx-4"></div>
      <section className="container px-4 my-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="k-rights">
            <p className="text-[#FFFFFF99]">©2025  All rights reserved.</p>
          </div>
          <div className="k-terms text-[#FFFFFF99] flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-end">
            <span>Terms of use</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Footer;
