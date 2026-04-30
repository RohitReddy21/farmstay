import { useEffect, useRef, useState } from 'react';

const LazySection = ({ children, className = '', placeholderClassName = 'min-h-[240px]', rootMargin = '280px' }) => {
    const ref = useRef(null);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (shouldRender) return undefined;

        const node = ref.current;
        if (!node) return undefined;

        if (!('IntersectionObserver' in window)) {
            setShouldRender(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [rootMargin, shouldRender]);

    return (
        <div ref={ref} className={className}>
            {shouldRender ? children : <div className={placeholderClassName} aria-hidden="true" />}
        </div>
    );
};

export default LazySection;
