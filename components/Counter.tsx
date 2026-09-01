import React from 'react';

interface CounterProps {
  value: string;
  color?: string;
  className?: string;
}

const Counter: React.FC<CounterProps> = ({ value, color, className }) => {
  const [count, setCount] = React.useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  // Extract number part to see if it has decimals
  const hasDecimals = value.includes('.');
  const suffix = value.replace(/[0-9,.]/g, '');
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out expo
      const currentCount = end * (progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress));
      
      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(currentCount));
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [target, isInView]);

  return (
    <div ref={nodeRef} style={{ color }} className={className}>
      {count.toLocaleString()}{suffix}
    </div>
  );
};

export default Counter;
