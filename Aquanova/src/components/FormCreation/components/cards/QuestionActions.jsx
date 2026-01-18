import React from 'react';

export default function QuestionActions({
  q,
  isEditingThis,
  handleStartEditing,
  handleDeleteQuestion
}) {
  return (
    <div className={`
      tablet:absolute tablet:z-10 flex tablet:pl-0 pl-2 
      ${q.type == 'Sólo texto (sin respuestas)'? 'flex-row': 'tablet:flex-col flex-row'} 
      gap-2 tablet:translate-x-full tablet:pl-[15px] mb-3 tablet:mb-0
      transition-all duration-300
      ${isEditingThis ? 'opacity-0 translate-x-0 pointer-events-none' : 'opacity-100'}
    `}>

      <button
        onClick={() => handleStartEditing(q)}
        className="
          w-fit group flex h-10 items-center justify-center
          rounded-full border border-[#2138C4] bg-blue-50 p-2
          transition-all duration-300 ease-in-out
          hover:bg-blue-100 hover:pr-4 cursor-pointer
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#2138C4] flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
        <span className="
          max-w-0 overflow-hidden whitespace-nowrap
          tablet:text-sm text-[13px] font-medium text-[#2138C4] opacity-0
          transition-all duration-300 ease-out
          group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
        ">Editar</span>
      </button>

      <button
        onClick={() => handleDeleteQuestion(q.id)}
        className="
          w-fit group flex h-10 items-center justify-center
          rounded-full border border-red-600 bg-red-50 p-2
          transition-all duration-300 ease-in-out
          hover:bg-red-100 hover:pr-4 cursor-pointer
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        <span className="
          max-w-0 overflow-hidden whitespace-nowrap
          tablet:text-sm text-[13px] font-medium text-red-600 opacity-0
          transition-all duration-300 ease-out
          group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
        ">Eliminar</span>
      </button>
    </div>
  );
}
