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
    <section className="m-10">
      <div className="pro-heading">
        <p className="text-[#FFFFFF] text-[30px] font-semibold">Profile</p>
      </div>

      <div className="pro-content bg-[#1F1F1F] p-4 md:p-8 lg:me-20 rounded-lg">
        {/* Avatar Section */}
        <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] mb-6 md:mb-0 flex-shrink-0 mx-auto md:mx-0">
          <img
            src={imageUrl}
            alt="Profile Avatar"
            className="w-full h-full rounded-full object-cover border-4 border-[#232323]"
            onError={(e) => {
              e.target.src = pro; // Fallback to default image
            }}
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-2 right-2 bg-[#232323] p-2 rounded-full cursor-pointer border border-gray-700 hover:bg-[#2a2a2a] transition-colors"
          >
            <TiCameraOutline className="text-[#FFFFFF99] text-[20px]" />
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

        {/* Form Section */}
        <form className="w-full md:max-w-2xl mt-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label className="block text-white mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full bg-[#232323] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full bg-[#232323] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                placeholder="Patel"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Mobile No.</label>
              <div className="flex">
                <select
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleCountryCodeChange}
                  disabled={isSubmitting}
                  className="bg-[#232323] text-white rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 border-r border-gray-700 disabled:opacity-50"
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
                  className="w-full bg-[#232323] text-white rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                  placeholder="65896 58585"
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full bg-[#232323] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                placeholder="johanpatil123@gmail.com"
              />
            </div>
          </div>

          {/* Gender Section */}
          <div className="mb-6">
            <label className="block text-white mb-2">Gender</label>
            <div className="flex flex-wrap items-center space-x-4 md:space-x-6">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={handleGenderChange}
                  disabled={isSubmitting}
                  className="mr-2 disabled:opacity-50"
                />
                Male
              </label>
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={handleGenderChange}
                  disabled={isSubmitting}
                  className="mr-2 disabled:opacity-50"
                />
                Female
              </label>
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={form.gender === "Other"}
                  onChange={handleGenderChange}
                  disabled={isSubmitting}
                  className="mr-2 disabled:opacity-50"
                />
                Other
              </label>
            </div>
          </div>

          {/* Update Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full md:w-auto bg-white text-black font-semibold px-8 py-2 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

          {/* Display current status */}
          {/* {message && (
            <div
              className={`mt-4 p-3 rounded ${
                success
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {message}
            </div>
          )} */}
        </form>
      </div>
    </section>
  );
};

export default Profile;
