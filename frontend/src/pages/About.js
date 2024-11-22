import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
        <div className='flex flex-col jutify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>Welcome to Shifa, your reliable partner in simplifying healthcare access and enhancing your well-being. At Shifa, we recognize the challenges individuals face in finding trusted healthcare providers, scheduling appointments, and managing health records effortlessly.</p>
          <p>Shifa is dedicated to revolutionizing healthcare technology. We constantly innovate and refine our platform to offer a seamless, user-centric experience. Whether you’re connecting with a specialist, booking a follow-up appointment, or exploring preventive care options, Shifa is designed to support you every step of the way.</p>
          <b className='text-gray-800'>Our Vision</b><p>At Shifa, our vision is to redefine healthcare accessibility for everyone. We strive to bridge the gap between patients and healthcare providers by building a platform that makes healthcare simple, accessible, and convenient. Our goal is to ensure that quality medical care is just a click away, empowering you to take charge of your health with confidence.</p>
        </div>
      </div>
      <div className='text-xl my-4'>WHY <span className='text-gray-700 font-semibold'> CHOOSE US</span></div>
      <div className='flex flex-col md:flex-row mb-20'>
      <div  className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
        <b>EFFICIENCY:</b>
        <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
      </div>
      <div  className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
      <b>CONVENIENCE:</b>
      <p>Access to a network of trusted healthcare professionals in your area.</p>
      </div>
      <div  className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
      <b>PERSONALIZATION:</b>
      <p>Tailored recommendations and reminders to help you stay on top of your health.</p>
      </div>
      </div>
    </div>
  )
}

export default About
