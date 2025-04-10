import Image from 'next/image';
import React from 'react';

function Header() {
  return (
    <div className='flex justify-between p-3 px-5 shadow-sm'>
      <div className='flex gap-3 items-center'>
        <Image src='/zip-logo.png' alt='logo'
        width={50} height={50} /> 
        <h2 className='text-[25px] font-semibold 
        tracking-widest text-rose-600'>ZITYZOOM</h2>
      </div>
      <ul className='flex gap-8 items-center'>
        <li className='text-[18px] hover:text-rose-600 cursor-pointer'>Home</li>
        <li className='text-[18px] hover:text-rose-600 cursor-pointer'>About Us</li>
        <li className='text-[18px] hover:text-rose-600 cursor-pointer'>Contact Us</li>
      </ul>
    </div>
    
  )
}

export default Header