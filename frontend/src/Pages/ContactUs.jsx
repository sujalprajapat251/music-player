import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import astro from "../Images/contact-us.png";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { submitContactForm, resetContactState } from '../Redux/Slice/contact.slice';

const ContactUs = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(state => state.contact);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      message: Yup.string().required('Message is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      await dispatch(submitContactForm(values));
      if (!error) {
        resetForm();
        setTimeout(() => dispatch(resetContactState()), 2000);
      }
    },
  });

  return (
    <>
      {/* header section */}
      <Header />

      {/* Main section start */}

      <section className="container my-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            We're Here to Help
          </h2>
          <p className="text-white/70">Have a question? We've got your back.</p>
        </div>
        <div className="bg-[#232323] rounded-lg p-6 md:p-10 flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left: Form */}
          <div className="flex-1">
            <h3 className="text-white text-[30px] font-semibold mb-1">
              Let's connect constellations
            </h3>
            <p className="text-white/70 mb-6 text-sm">
              Let's align our constellations! Reach out and let the magic of
              collaboration illuminate our skies.
            </p>
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              <div className="flex justify-between gap-8">
                <div className="flex flex-col flex-1">
                  <label className="text-[#FFFFFF] mb-2">First name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    className="px-4 py-2 bg-[#181818] h-[44px] text-white rounded-md focus:outline-none w-full"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <div className="text-red-400 text-xs mt-1">{formik.errors.firstName}</div>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-[#FFFFFF] mb-2">Last name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    className="px-4 py-2 bg-[#181818] h-[44px] text-white rounded-md focus:outline-none w-full"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <div className="text-red-400 text-xs mt-1">{formik.errors.lastName}</div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[#FFFFFF]">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full h-[44px] px-4 py-2 bg-[#181818] my-3 text-white rounded-md focus:outline-none"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-400 text-xs mt-1">{formik.errors.email}</div>
                )}
              </div>
              <label className="text-[#FFFFFF]">Message</label>
              <textarea
                name="message"
                placeholder="Message"
                rows={4}
                className="w-full px-4 py-2 bg-[#181818] text-white h-[150px] rounded-md focus:outline-none resize-none"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.message}
              />
              {formik.touched.message && formik.errors.message && (
                <div className="text-red-400 text-xs mt-1">{formik.errors.message}</div>
              )}
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              {success && <div className="text-green-400 mt-2">Message sent successfully!</div>}
              {error && <div className="text-red-400 mt-2">{error}</div>}
            </form>
          </div>
          {/* Right: Image and Quote */}
          <div
            className="flex-1 rounded-md relative min-h-[550px] hidden lg:flex items-end overflow-hidden"
            style={{
              backgroundImage: `url(${astro})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Quote */}
            <div className="z-10 p-4 text-white text-xs italic">
              “Two lunar months revealed Earth's fragile beauty against
              vast <br /> silence, transforming my view of our place in the universe.
              <br />
              <span className="not-italic font-medium">Irinei Traista</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main section end */}

      {/* Footer */}
      <Footer />
    </>
  );
};

export default ContactUs;
