import React, { useEffect, useRef, useState } from "react";
import Saturn3DGalaxy from "./Saturn3DGalaxy";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { forgotPassword, googleLogin, login, register, resetPassword, verifyOtp, facebookLogin } from "../Redux/Slice/auth.slice";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Animation from "../components/Animation";
import axios from "axios";
import FacebookLogin from "react-facebook-login";
import { BASE_URL } from "../Utils/baseUrl";
const OTPInput = ({ length = 4, onComplete, handleVerifyOTP, email }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    const otpValue = newOtp.join("");
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((digit, index) => {
        if (index < length) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);

      if (pastedData.length === length) {
        onComplete?.(pastedData);
      }
      // Focus last filled input or first empty input
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== length) {
      setError("Please enter the complete OTP.");
      return;
    }
    setError("");
    try {
      const response = await dispatch(
        verifyOtp({ email: email, otp: otpValue })
      );
      console.log(response);
      if (response.payload.success) {
        handleVerifyOTP(otpValue);
      } else {
        setError("OTP verification failed. Please try again.");
      }
    } catch (error) {
      setError("Error verifying OTP. Please try again.");
    }
  };

  return (
    <div className="bg-gray-950 bg-opacity-90 rounded-[4px] shadow-lg m-4 md:m-0 p-4 md:p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-white mb-4">Verify OTP
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">We’ve sent a code to{" "}<span className="text-white">example123@gmail.com</span><br />Please enter it to verify your Email.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-2 sm:space-x-4 mb-10">
          {otp.map((digit, index) => (
            <input key={index} ref={(ref) => (inputRefs.current[index] = ref)} type="text" inputMode="numeric" autoComplete="one-time-code" value={digit} onChange={(e) => handleChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} onPaste={handlePaste} maxLength={1}
              className="w-12 h-12 bg-white/10 border border-white/20 rounded text-white text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
            />
          ))}
        </div>
        {error && (
          <div className="text-red-500 text-center text-sm mt-1">{error}</div>
        )}

        {/* Verify OTP button */}
        <button type="submit" className="w-full mb-5 bg-white text-gray-900 py-3 px-4 rounded-[4px] font-semibold hover:bg-gray-100 transition-all duration-200 transform">Verify OTP</button>

        <div className="text-center">
          <p className="text-white/60 text-xs sm:text-sm">Didn't received code?{" "}
            <button className="text-white underline transition-colors">Resend</button>
          </p>
        </div>
      </form>
    </div>
  );
};

const Login = () => {
  const location = useLocation();
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [isSignIn, setIsSignIn] = useState(location.state?.openSignUp ? false : true);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle navigation state changes
  useEffect(() => {
    if (location.state?.openSignUp) {
      setIsSignIn(false);
    }
  }, [location.state]);

  const signUpSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const signInSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleVerifyOTP = () => {
    setForgotPasswordStep(3);
  };

  const handleChangePassword = (values) => {
    const { newPassword } = values;
    dispatch(resetPassword({ newPassword, email })).then((response) => {
      console.log(response);
      if (response.payload.success) {
        setForgotPasswordStep(0);
      }
    });
  };
  const handleResponse = async (response) => {
    const { name, email, id, picture } = response || {};
    if (email && id && name) {
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ");
      const photo = picture?.data?.url;
  
      dispatch(
        facebookLogin({ uid: id, firstName, lastName, email, photo })
      ).then((res) => {
        if (res.payload?.success) navigate("/project");
      });
    } else {
      console.error("Facebook login failed", response);
    }
  };
  

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0"><Animation /></div>
      <div className="absolute inset-0 flex items-center justify-center w-full md:w-[450px] mx-auto">
        {forgotPasswordStep === 0 && (
          <div className="bg-gray-950 bg-opacity-90 rounded-[4px] shadow-lg m-4 md:m-0 p-4 md:p-8 w-full max-w-md min-h-[600px]">
            {isSignIn ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Sign in</h2>
                <p className="text-gray-400 mb-6 text-center">Welcome back! Please sign in.</p>
                <Formik initialValues={{ email: "", password: "", showPassword: false, rememberMe: false,}} validationSchema={signInSchema}
                  onSubmit={(values) => {
                    dispatch(login(values)).then((response) => {
                      if (response.payload.success) navigate("/project");
                    });
                  }}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleSubmit,
                    handleChange,
                    setFieldValue,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="text-gray-300 mb-2 text-sm">Email</label>
                        <input type="email" className="w-full px-3 py-2 rounded bg-white/5 text-white focus:outline-none" placeholder="Email" name="email" value={values.email} onChange={handleChange}/>
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        )}
                      </div>
                      <div className="mb-4">
                        <label className="text-gray-300 mb-2 text-sm">Password</label>
                        <div className="relative">
                          <input type={values.showPassword ? "text" : "password"} className="w-full px-3 py-2 rounded bg-white/5 text-white focus:outline-none" name="password" placeholder="Password" value={values.password} onChange={handleChange}/>
                          <div className="absolute right-3 top-3 cursor-pointer select-none text-white"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFieldValue(
                                "showPassword",
                                !values.showPassword
                              );
                            }}
                          >
                            {values.showPassword ? <LuEye /> : <LuEyeClosed />}
                          </div>
                          {errors.password && touched.password && (
                            <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" name="rememberMe" checked={values.rememberMe} onChange={handleChange} className="w-4 h-4 text-red-500 bg-transparent border-white/20 rounded-[2px] j_checkBox"/>
                          <span className="ml-2 text-xs md:text-sm text-gray-300">Remember Me</span>
                        </label>
                        <button onClick={() => { setForgotPasswordStep(1); }} type="button" className="text-xs md:text-sm text-red-500 font-medium hover:text-red-600 transition-colors">Forgot Password?</button>
                      </div>
                      <button type="submit" className="w-full bg-white hover:bg-white text-black font-semibold py-2 rounded transition">Sign In</button>
                    </form>
                  )}
                </Formik>

                {/* Divider */}
                <div className="flex items-center my-5">
                  <div className="flex-1 h-px m-0-10 bg-gradient-to-r from-white/50 to-black"></div>
                  <span className="text-white">OR</span>
                  <div className="flex-1 h-px m-0-10 bg-gradient-to-r from-black to-white/50"></div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <GoogleLogin
                    onSuccess={(response) => {
                      const {
                        name,
                        email,
                        sub: uid,
                      } = jwtDecode(response.credential);
                      const [firstName, ...rest] = name.split(" ");
                      const lastName = rest.join(" ");
                      dispatch(
                        googleLogin({ uid, firstName, lastName, email })
                      ).then((response) => {
                        console.log(response);
                        if (response.payload.success) navigate("/project");
                      });
                    }}
                    onFailure={console.error}
                    render={(renderProps) => (
                      <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg p-2.5 hover:bg-gray-50 transition-colors">
                        <img src={require("../Images/google-logo.png")} alt="Google" className="w-5 h-5"/>
                        <span className="text-right flex-grow-0">Google</span>
                      </button>
                    )}
                  />
                  <div className="w-44">
                    <FacebookLogin
                      appId="2295150360940038"
                      autoLoad={false}
                      fields="name, email, picture"
                      callback={handleResponse}
                      cssClass="w-full flex items-center justify-center px-4 py-2 border border-white/20 rounded-[4px] text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      textButton="Facebook"
                      icon={
                        <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      }
                    />
                  </div>
                </div>

                {/* Social login buttons */}

                {/* <div className="flex justify-between">
                                    <button
                                        className="w-44 flex items-center justify-center px-4 py-3 border border-white/20 rounded-[4px] text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </button>

                                    <button
                                        className="w-44 flex items-center justify-center px-4 py-3 border border-white/20 rounded-[4px] text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </button>
                                </div> */}
                {/* <div className="mt-4 text-center text-gray-400">
                            Already have an account? <a href="/login" className="text-blue-400 underline">Sign In</a>
                        </div> */}
                {/* Sign up link */}
                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm md:text-base">Didn't have any account?{" "}
                    <button className="text-white underline transition-colors" onClick={() => setIsSignIn(false)}>Create Account</button>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Account</h2>
                <p className="text-gray-400 mb-6 text-center">Register your account easily enter your email below.</p>
                <Formik
                  initialValues={{
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    showPassword: false,
                  }}
                  validationSchema={signUpSchema}
                  onSubmit={(values) => {
                    dispatch(register(values)).then((response) => {
                      if (response.payload) navigate("/project");
                    });
                  }}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* First Name field */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2">First Name</label>
                          <input type="text" name="firstName" className="w-full px-3 py-2 text-sm rounded bg-white/5 text-white focus:outline-none" placeholder="First name" onChange={handleChange} value={values.firstName}/>
                          {errors.firstName && touched.firstName && (
                            <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>
                          )}
                        </div>

                        {/* Last Name field */}
                        <div>
                          <label className="text-sm text-gray-300 mb-2">Last Name</label>
                          <input type="text" name="lastName" className="w-full px-3 py-2 text-sm rounded bg-white/5 text-white focus:outline-none" placeholder="Last name" onChange={handleChange} value={values.lastName}/>
                          {errors.lastName && touched.lastName && (
                            <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-gray-300 mb-2 text-sm">Email</label>
                        <input type="email" name="email" className="w-full px-3 py-2 rounded text-sm bg-white/5 text-white focus:outline-none" placeholder="Email" onChange={handleChange} value={values.email}/>
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        )}
                      </div>
                      <div className="mb-4">
                        <label className="text-gray-300 mb-2 text-sm">Password</label>
                        <div className="relative">
                          <input name="password" type={values.showPassword ? "text" : "password"} className="w-full px-3 py-2 rounded text-sm bg-white/5 text-white focus:outline-none" placeholder="Password" onChange={handleChange} value={values.password}/>
                          <div className="absolute top-3 right-3 cursor-pointer select-none text-white/60"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFieldValue(
                                "showPassword",
                                !values.showPassword
                              );
                            }}
                          >
                            {values.showPassword ? <LuEye /> : <LuEyeClosed />}
                          </div>
                        </div>
                        {errors.password && touched.password && (
                          <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                        )}
                      </div>
                      <button type="submit" className="w-full bg-white hover:bg-white text-black font-semibold py-2 rounded transition">Create Account</button>
                    </form>
                  )}
                </Formik>

                <div className="flex items-center my-5">
                  <div className="flex-1 h-px m-0-10 bg-gradient-to-r from-white/50 to-black"></div>
                  <span className="text-white">OR</span>
                  <div className="flex-1 h-px m-0-10 bg-gradient-to-r from-black to-white/50"></div>
                </div>
                
                <div className="flex justify-between items-center">
                <GoogleLogin
                  onSuccess={(response) => {
                    const {
                      name,
                      email,
                      sub: uid,
                    } = jwtDecode(response.credential);
                    const [firstName, ...rest] = name.split(" ");
                    const lastName = rest.join(" ");
                    dispatch(
                      googleLogin({ uid, firstName, lastName, email })
                    ).then((response) => {
                      console.log(response);
                      if (response.payload.success) navigate("/home");
                    });
                  }}
                  onFailure={console.error}
                  render={(renderProps) => (
                    <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg p-2.5 hover:bg-gray-50 transition-colors">
                      <img src={require("../Images/google-logo.png")} alt="Google" className="w-5 h-5"/>
                      <span className="text-right flex-grow-0">Continue with Google</span>
                    </button>
                  )}
                />

                <div className='s_modal_btn2' >
                  <FacebookLogin appId="2295150360940038" autoLoad={false} fields="name, email, picture" scope="" callback={handleResponse} text='signin_with' icon='fa-facebook' cssClass="!flex !items-center !justify-center gap-2 w-full bg-[#1877f2] text-white text-sm font-medium px-4 py-3 rounded-md hover:bg-[#166fe0] focus:outline-none focus:ring-2 focus:ring-[#1877f2]/40 transition" textButton='Sign in with Facebook'>
                  <p className='mb-0 text-sm font-medium'>Sign in with Facebook</p></FacebookLogin>
                </div>
 
                </div>
                {/* Sign up link */}
                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm md:text-base">Already have any account?{" "}
                    <button className="text-white underline transition-colors" onClick={() => setIsSignIn(true)}>Sign in</button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {forgotPasswordStep === 1 && (
          <div className="bg-gray-950 bg-opacity-90 rounded-[4px] shadow-lg m-4 md:m-0 p-4 md:p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-3xl font-bold text-white mb-4">Forgot Password</h1>
              <p className="text-white/60 text-sm leading-relaxed">We will send you an email with instructions on how to reset yourpassword.</p>
            </div>
            <Formik
              initialValues={{ email: "" }}
              validationSchema={Yup.object({
                email: Yup.string()
                  .email("Invalid email")
                  .required("Email is required"),
              })}
              onSubmit={(values, { resetForm }) => {
                console.log(values.email);
                setEmail(values.email);
                dispatch(forgotPassword(values.email)).then((response) => {
                  console.log(response);
                  if (response.payload.success) {
                    setForgotPasswordStep(2);
                    resetForm();
                  }
                });
              }}
            >
              {({ handleChange, handleSubmit, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                  <div className="mb-10">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email
                    </label>
                    <input type="email" className="w-full px-3 py-2 rounded bg-white/5 text-white focus:outline-none" placeholder="Email" name="email" ref={(input) => input && input.focus()} onChange={handleChange}/>
                    {errors.email && touched.email && (
                      <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                    )}
                  </div>

                  {/* Send OTP button */}
                  <button type="submit" className="w-full bg-white text-gray-900 py-3 px-4 rounded-[4px] font-semibold hover:bg-gray-100 transition-all duration-200 transform">Send OTP</button>
                </form>
              )}
            </Formik>
          </div>
        )}
        {forgotPasswordStep === 2 && (
          <OTPInput length={4} onComplete={(otpValue) => {}} handleVerifyOTP={handleVerifyOTP} email={email}/>
        )}
        {forgotPasswordStep === 3 && (
          <div className="bg-gray-950 bg-opacity-90 rounded-[4px] shadow-lg m-4 md:m-0 p-4 md:p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-3xl font-bold text-white mb-4">Change password</h1>
              <p className="text-white/60 text-sm leading-relaxed">Protect your account with a unique password at least 6characters long.</p>
            </div>
            <Formik
              initialValues={{
                newPassword: "",
                confirmPassword: "",
                showNewPassword: false,
                showConfirmPassword: false,
              }}
              validationSchema={Yup.object({
                newPassword: Yup.string()
                  .min(6, "Password must be at least 6 characters")
                  .required("New Password is required"),
                confirmPassword: Yup.string()
                  .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
                  .required("Confirm Password is required"),
              })}
              onSubmit={(values) => {
                const { newPassword, confirmPassword } = values;
                handleChangePassword({ newPassword, confirmPassword });
              }}
            >
              {({
                values,
                setFieldValue,
                handleChange,
                handleSubmit,
                errors,
                touched,
              }) => (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="text-gray-300 mb-2 text-sm">New Password</label>
                    <div className="relative">
                      <input type={values.showNewPassword ? "text" : "password"} name="newPassword" placeholder="New Password" value={values.newPassword} onChange={handleChange} className="w-full px-3 py-2 rounded bg-white/5 text-white focus:outline-none text-sm"/>
                      <div className="absolute right-3 top-3 cursor-pointer select-none text-white"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFieldValue(
                            "showNewPassword",
                            !values.showNewPassword
                          );
                        }}
                      >
                        {values.showNewPassword ? <LuEye /> : <LuEyeClosed />}
                      </div>
                    </div>
                    {errors.newPassword && touched.newPassword && (
                      <div className="text-red-500 text-sm mt-1">{errors.newPassword}</div>
                    )}
                  </div>

                  <div className="mb-10">
                    <label className="text-gray-300 mb-2 text-sm">Confirm Password</label>
                    <div className="relative">
                      <input type={values.showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={values.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 rounded bg-white/5 text-white focus:outline-none text-sm"/>
                      <div className="absolute right-3 top-3 cursor-pointer select-none text-white"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFieldValue(
                            "showConfirmPassword",
                            !values.showConfirmPassword
                          );
                        }}
                      >
                        {values.showConfirmPassword ? (
                          <LuEye />
                        ) : (
                          <LuEyeClosed />
                        )}
                      </div>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>
                    )}
                  </div>

                  {/* Send OTP button */}
                  <button type="submit" className="w-full bg-white text-gray-900 py-3 px-4 rounded-[4px] font-semibold hover:bg-gray-100 transition-all duration-200 transform">Reset Password</button>
                </form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;