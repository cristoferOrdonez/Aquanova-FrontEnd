import React from 'react'

const variants ={
  state:'border-[var(--green-buttons)] text-[var(--green-buttons)]',
  location: 'border-[var(--gray-subtitles)] text-[var(--gray-subtitles)]',
};


const CircleIcon = ({ size = 16, className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 25"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="12" />
    </svg>
  );
};

export default function FormStateElement({formState='state', label="no conocido"}) {

  const variantStyles = variants[formState] ?? variants.state;

  return (
    <div className={`flex flex-row w-fit border-2  items-center justify-center ${variantStyles} rounded-full pl-0.5 pr-2 pt-0.5 pb-0.5 gap-0.5`}>
      <CircleIcon className='mr-0.5' />
      <p className=' text-xs'>{label}</p>
    </div>
  )
}
