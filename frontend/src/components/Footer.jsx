import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createSubscribe } from "../Redux/Slice/subscribe.slice";

const Footer = () => {

  const dispatch = useDispatch();

  const subscribeSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  return (
    <>
      <section className="container mt-20 px-4 lg:mt-20 md:mt-10 sm:mt-5">
        <div className="k-footer flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="logo">
              <p className="text-[#FFFFFF] text-[32px] sm:text-[40px]">LOGO</p>
            </div>
            <div className="footer-manu text-[#FFFFFF66] mt-4 flex flex-wrap sm:gap-x-4 gap-y-2">
              <Link to={"/"}>Music</Link>
              <Link to={"/faqs"}>FAQs</Link>
              <Link to={"/pricing"}>Pricing</Link>
              <Link to={"/contact"}>Contact us</Link>
            </div>
          </div>
          <div className="w-full max-w-md mt-8 md:mt-0">
            <label className="block mb-2 text-white">Join our newsletter</label>
            <Formik
              initialValues={{
                email: ""
              }}
              validationSchema={subscribeSchema}
              onSubmit={(values,{resetForm}) => {
                 dispatch(createSubscribe({email:values.email}))
                 resetForm()
              }}
            >
              {({ values, errors, touched, handleSubmit, handleChange,handleBlur }) => (
                <form onSubmit={handleSubmit} className="flex">
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Email"
                    className="flex-1 p-2 sm:p-3 bg-[#232323] text-white rounded-l-md focus:outline-none w-full"
                  />
                  
                  <button
                    type="submit"
                    className="w-28 p-2 sm:p-3 bg-[#E5E5E5] text-black font-medium rounded-r-md"
                  >
                    Subscribe
                  </button>
                  
                  {/* {errors.email && touched.email && (<div className="text-red-500 text-sm mt-1"> {errors.email} </div>)} */}
                </form>
              )}
            </Formik>
          </div>
        </div>
      </section >
      <div className="bg-[#FFFFFF1A] my-6 border-[1px] border-[#FFFFFF1A] mx-4"></div>
      <section className="container px-4 my-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="k-rights">
            <p className="text-[#FFFFFF99]">©2025  All rights reserved.</p>
          </div>
          <div className="k-terms text-[#FFFFFF99] flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-end">
            <Link to={"/tearms"}>Terms of use</Link>
            <Link to={"/privacy"}>Privacy Policy</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Footer;