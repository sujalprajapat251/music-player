import React, { useEffect } from "react";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchTerms } from "../Redux/Slice/terms.slice";
import Footer from "../components/Footer";

const TearmsOfUse = () => {
  const dispatch = useDispatch();
  const { terms, loading, error } = useSelector((state) => state.terms);

  useEffect(() => {
    dispatch(fetchTerms());
  }, [dispatch]);

  return (
    <>
      {/* header section start */}
      <Header />

      {/* terms section start  */}

      <section className="container px-4 my-10">
        <div className="terms-heading">
          <p className="text-[#FFFFFF] text-[30px] font-bold">
            Terms & Conditions
          </p>
        </div>
        <div className="terms mt-6">
        {loading && <p className="text-white">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {terms && terms.length > 0 ? (
            terms.map((term) => (
              <div key={term._id} className="mb-6">
                <p className="text-[#FFFFFF] text-[22px] font-bold">
                  {term.title}
                </p>
                <p className="text-[#FFFFFF99] mt-2">{term.description}</p>
              </div>
            ))
          ) : !loading && !error ? (
            <p className="text-white">No terms found.</p>
          ) : null}  
        </div>
      </section>

      {/* terms section end  */}

      {/* Footer section start */}
      <Footer />
    </>
  );
};

export default TearmsOfUse;
