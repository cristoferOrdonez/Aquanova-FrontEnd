import React, { useState, useCallback, useEffect } from 'react'

const SearchBar = ({
  placeholder='Buscar...',
}) => {
  return(
    <div className='flex flex-col gap-2'>
      <input 
      className='w-full border rounded px-3 py-2 text-[var(--gray-subtitles)]'
      placeholder={placeholder}
      />
    </div>
  )
}

export default SearchBar