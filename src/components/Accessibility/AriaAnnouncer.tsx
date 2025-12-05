import React, { useEffect, useRef } from 'react';

interface AriaAnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  className?: string;
}

const AriaAnnouncer: React.FC<AriaAnnouncerProps> = ({
  message,
  politeness = 'polite',
  className = '',
}) => {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announcerRef.current) {
      // Clear the content first
      announcerRef.current.textContent = '';
      
      // Use a small timeout to ensure the screen reader registers the change
      const timeoutId = setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  return (
    <div
      ref={announcerRef}
      className={`sr-only ${className}`}
      aria-live={politeness}
      aria-atomic="true"
    />
  );
};

export default AriaAnnouncer;