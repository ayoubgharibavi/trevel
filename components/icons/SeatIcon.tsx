
import React from 'react';

export const SeatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6" />
        <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
        <path d="M12 12h0" />
        <path d="M2 12h20" />
    </svg>
);
