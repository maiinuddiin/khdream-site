import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  variant?: "fade" | "blur" | "slide" | "bounce";
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  width = "100%", 
  className = "", 
  delay = 0.05,
  direction = "up",
  variant = "fade"
}) => {
  const isFastScrolling = typeof window !== 'undefined' && (window as any).__isFastScrolling;

  const getInitialStyles = () => {
    // Shorter translate ranges (e.g., 20px instead of 40px) to prevent layout paint spikes
    const base = {
      opacity: 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
    };

    switch (variant) {
      case "blur":
        return { ...base, filter: "blur(8px)", scale: 1.02 };
      case "slide":
        return { ...base, x: direction === "left" ? 40 : direction === "right" ? -40 : 0, opacity: 0 };
      case "bounce":
        return { ...base, y: 30, scale: 0.95 };
      default:
        return { ...base, scale: 1, filter: "blur(0px)" };
    }
  };

  const variants = {
    hidden: getInitialStyles(),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateX: 0,
      filter: "blur(0px)",
    },
  };

  return (
    <div style={{ position: "relative", width, perspective: "1000px" }} className={className}>
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        transition={{ 
          duration: 0.18, 
          delay: delay * 0.5, 
          ease: "easeOut",
          opacity: { duration: 0.15 }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollReveal;
