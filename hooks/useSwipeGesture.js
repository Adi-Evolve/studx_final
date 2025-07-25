import { useRef, useState, useCallback } from 'react';

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const handleTouchStart = useCallback((e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now()
        };
        setIsDragging(false);
    }, []);
    
    const handleTouchMove = useCallback((e) => {
        if (!touchStartRef.current) return;
        
        const currentTouch = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        
        const deltaX = Math.abs(currentTouch.x - touchStartRef.current.x);
        const deltaY = Math.abs(currentTouch.y - touchStartRef.current.y);
        
        // Determine if this is a horizontal or vertical swipe
        if (deltaX > deltaY && deltaX > 10) {
            // Horizontal swipe - prevent default scrolling and handle slider
            e.preventDefault();
            setIsDragging(true);
        } else if (deltaY > deltaX && deltaY > 10) {
            // Vertical swipe - allow default scrolling
            setIsDragging(false);
        }
    }, []);
    
    const handleTouchEnd = useCallback((e) => {
        if (!touchStartRef.current || !isDragging) {
            touchStartRef.current = null;
            return;
        }
        
        touchEndRef.current = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
            time: Date.now()
        };
        
        const deltaX = touchEndRef.current.x - touchStartRef.current.x;
        const deltaY = Math.abs(touchEndRef.current.y - touchStartRef.current.y);
        const timeDiff = touchEndRef.current.time - touchStartRef.current.time;
        
        // Only handle horizontal swipes that are faster than vertical movement
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold && timeDiff < 300) {
            if (deltaX > 0) {
                onSwipeRight?.();
            } else {
                onSwipeLeft?.();
            }
        }
        
        touchStartRef.current = null;
        touchEndRef.current = null;
        setIsDragging(false);
    }, [onSwipeLeft, onSwipeRight, threshold, isDragging]);
    
    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        isDragging
    };
};
