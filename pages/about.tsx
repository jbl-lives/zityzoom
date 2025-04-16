import Header from '@/components/Header'
import React from 'react'

const about = () => {
  return (
    <div>
        <Header />
        <h1 className='text-3xl font-bold text-center mt-10'>About Us</h1>
        <p className='text-center mt-5 max-w-2xl mx-auto'>
            Welcome to our website! We are dedicated to providing you with the best experience possible. Our team is passionate about what we do and we strive to exceed your expectations.
        </p>
        <p className='text-center mt-5 max-w-2xl mx-auto'>
            Thank you for visiting our site. We hope you find what you're looking for!
        </p>
    </div>
  )
}

export default about