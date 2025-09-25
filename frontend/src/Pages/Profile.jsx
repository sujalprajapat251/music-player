import React, { useState, useEffect } from "react";
import { TiCameraOutline } from "react-icons/ti";
import pro from "../Images/ProfileImg.svg";
import { useSelector, useDispatch } from "react-redux";
import { getUserById, updateUser } from "../Redux/Slice/user.slice";
import { IMAGE_URL } from "../Utils/baseUrl";

const Profile = () => {
  const dispatch = useDispatch();
  const { currUser, loading, success, message } = useSelector(
    (state) => state.user
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    countryCode: "+91",
    gender: "Male",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(pro);
  const [imageUrl, setImageUrl] = useState(pro);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch user data on component mount
  useEffect(() => {
    dispatch(getUserById());
  }, [dispatch]);
  console.log("curnt user :", currUser);

  // Populate form when current user data is available
  useEffect(() => {
    if (currUser) {
      // Handle mobile number parsing
      const mobile = currUser.mobile || "";
      const match = mobile.match(/^(\+\d{1,3})(\d{5,})$/);
      const countryCode = match ? match[1] : "+91";
      const mobileNumber = match ? match[2] : mobile.replace(/^\+\d{1,3}/, "");

      setForm({
        firstName: currUser.firstName || "",
        lastName: currUser.lastName || "",
        email: currUser.email || "",
        mobile: mobileNumber,
        countryCode: countryCode,
        gender: currUser.gender || "Male",
      });

      // Set profile image
      if (currUser.photo) {
        setPreviewImage(currUser.photo);
        setImageUrl(IMAGE_URL + currUser.photo);
      } else {
        setImageUrl(pro); // fallback to default
      }
    }
  }, [currUser]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle gender selection
  const handleGenderChange = (e) => {
    setForm((prev) => ({ ...prev, gender: e.target.value }));
  };

  // Handle country code selection
  const handleCountryCodeChange = (e) => {
    setForm((prev) => ({ ...prev, countryCode: e.target.value }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currUser?._id) {
      alert("User ID not found. Please refresh and try again.");
      return;
    }
    setIsSubmitting(true);
    const id = currUser._id;
    const fullMobile = form.countryCode + form.mobile;
    const values = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      mobile: fullMobile,
      gender: form.gender
    };
    try {
      const result = await dispatch(
        updateUser({ id, values, file: avatarFile })
      );
      if (updateUser.fulfilled.match(result)) {
        setAvatarFile(null);
        console.log("Profile updated successfully");
      } else {
        console.error("Failed to update profile:", result.payload);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading && !currUser) {
    return (
      <section className="m-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-white text-lg">Loading profile...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="m-6 md:m-10">
      {/* Heading */}
      <div className="pro-heading mb-6">
        <p className="text-white text-[28px] md:text-[32px] font-bold tracking-wide">
          Profile 
        </p>
        <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full mt-2"></div>
      </div>

  {/* Card */}
  <div className="pro-content bg-[#1F1F1F]/80 backdrop-blur-xl p-6 md:p-10 rounded-2xl shadow-lg border border-white/10">
    {/* Avatar */}
    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 mb-8">
      <div className="relative w-[110px] h-[110px] md:w-[130px] md:h-[130px] mx-auto md:mx-0">
        <img
          src={imageUrl}
          alt="Profile Avatar"
          className="w-full h-full rounded-full object-cover border-4 border-[#2A2A2A] shadow-md"
          onError={(e) => {
            e.target.src = pro;
          }}
        />
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-400 p-2 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-transform"
        >
          <TiCameraOutline className="text-black text-[20px]" />
          <input
            id="avatar-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={isSubmitting}
          />
        </label>
      </div>

      {/* Small Info */}
      <div className="text-center md:text-left">
        <p className="text-white text-lg font-semibold">
          {form.firstName || "John"} {form.lastName || "Doe"}
        </p>
        <p className="text-gray-400 text-sm">{form.email || "user@email.com"}</p>
      </div>
    </div>

    {/* Form */}
    <form
      className="w-full mt-5 mx-auto"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-8">
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full bg-[#232323] text-white rounded-lg px-4 py-2.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-500 transition disabled:opacity-50"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full bg-[#232323] text-white rounded-lg px-4 py-2.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-500 transition disabled:opacity-50"
            placeholder="Patel"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">
            Mobile No.
          </label>
          <div className="flex">
            <select
              name="countryCode"
              value={form.countryCode}
              onChange={handleCountryCodeChange}
              disabled={isSubmitting}
              className="bg-[#232323] text-white rounded-l-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 border-r border-gray-700 disabled:opacity-50"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+61">+61</option>
              <option value="+971">+971</option>
            </select>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full bg-[#232323] text-white rounded-r-lg px-4 py-2.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
              placeholder="65896 58585"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full bg-[#232323] text-white rounded-lg px-4 py-2.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-violet-500 transition disabled:opacity-50"
            placeholder="johanpatil123@gmail.com"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="mb-8">
        <label className="block text-gray-300 mb-2 text-sm font-medium">
          Gender
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {["Male", "Female", "Other"].map((g) => (
            <label
              key={g}
              className="flex items-center text-white cursor-pointer bg-[#232323] px-4 py-2 rounded-lg hover:bg-[#2a2a2a] transition"
            >
              <input
                type="radio"
                name="gender"
                value={g}
                checked={form.gender === g}
                onChange={handleGenderChange}
                disabled={isSubmitting}
                className="mr-2 accent-violet-400 disabled:opacity-50"
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      {/* Update Button */}
      <div className="flex justify-center md:justify-start">
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="bg-gradient-to-r from-indigo-500 to-purple-400 text-black font-semibold px-10 py-3 rounded-xl shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </button>
      </div>
    </form>
  </div>
</section>

  );
};

export default Profile;
