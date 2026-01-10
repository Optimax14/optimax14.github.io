import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, [location]);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ease-in-out transform
        ${isVisible ? 'animate-pageEnter opacity-100' : 'animate-pageExit opacity-0'}`}
    >
      {children}
    </div>
  );
}