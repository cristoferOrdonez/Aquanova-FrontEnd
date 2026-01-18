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
                ${index === activeIndex ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-white/30 hover:bg-white/60'}
            `}
        />
    );
}

export default SlideDot;