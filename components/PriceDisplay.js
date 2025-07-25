'use client';

import { useState, useEffect } from 'react';

export default function PriceDisplay({ price, className = "", prefix = "₹", suffix = "" }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Return a placeholder during SSR to avoid hydration mismatch
    if (!mounted) {
        return <span className={className}>{prefix}{price}{suffix}</span>;
    }

    // Client-side formatting
    const formattedPrice = new Intl.NumberFormat('en-IN').format(price);
    
    return (
        <span className={className}>
            {prefix}{formattedPrice}{suffix}
        </span>
    );
}