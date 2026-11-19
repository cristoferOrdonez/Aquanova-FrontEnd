function SlideDot({
    index,
    goToSlide,
    activeIndex
}) {
    return (
        <div
            key={index}
            onClick={() => goToSlide(index)}
            className={`
                h-2 rounded-full transition-all duration-300 cursor-pointer
                ${index === activeIndex ? 'w-8 bg-[#00A896] shadow-[0_0_10px_rgba(0,168,150,0.5)]' : 'w-2 bg-white/30 hover:bg-white/60'}
            `}
        />
    );
}

export default SlideDot;