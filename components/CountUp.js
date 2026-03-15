/**
 * @module CountUp
 * @description Animated number counter from 0 to end over duration ms.
 * @agent Component Developer (Agent 3)
 */
import React, { useState, useEffect } from 'react';

export const CountUp = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};

export default CountUp;
