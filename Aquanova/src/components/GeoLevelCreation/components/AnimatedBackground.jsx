function AnimatedBackground({
    index,
    bg,
    isActive
}) {
    return (
        <img 
            key={bg.id || index}
            src={bg.src} 
            alt={`Fondo ${bg.id}`}
            className={`
                absolute inset-0 w-full h-full object-cover 
                scale-110 blur-sm brightness-[0.4]
                transition-opacity duration-1000 ease-in-out
                ${isActive ? 'opacity-100' : 'opacity-0'}
            `} 
        />
    );
}

export default AnimatedBackground;