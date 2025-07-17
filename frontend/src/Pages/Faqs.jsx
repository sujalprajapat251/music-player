import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header'
import Accordion from '../components/Accordion';
import { fetchFaqs } from '../Redux/Slice/faqs.slice';

const Faqs = () => {
  const dispatch = useDispatch();
  const { items: faqItems, loading, error } = useSelector(state => state.faqs);

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);

  return (
    <>
      {/* header section start */}
      <Header />

      {/* FAQs section start */}
      <div className="faqs-heading text-center my-10">
        <p className='text-[#FFFFFF] text-[36px] font-bold'>FAQs</p>
        <p className='text-[#FFFFFF99]'>Your questions, answered simply.</p>
      </div>
      <section className='container my-10'>
        {loading && <p className="text-white">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <Accordion items={faqItems} />}
      </section>
      {/* FAQs section end */}
    </>
  )
}

export default Faqs;