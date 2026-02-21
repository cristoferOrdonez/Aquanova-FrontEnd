export default function FileUploadInput() {
    return (
        <div className="mt-4 px-1">
            <div className="w-full h-28 bg-[#F1F5F9] rounded-[14px] border-[1.5px] border-dashed border-[#CBD5E1] flex flex-col items-center justify-center gap-2 text-gray-400 select-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 opacity-60">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
                </svg>
                <span className="tablet:text-sm text-[13px]">Subida de archivo (imagen)</span>
            </div>
        </div>
    );
}
