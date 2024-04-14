import React, { useEffect, useRef, useState, type ReactNode } from "react";

type NeverShrinkContainerProps = {
  children: ReactNode;
  className?: string;
};

export const NeverShrinkContainer: React.FC<NeverShrinkContainerProps> = ({
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const currentHeight = entry.target.getBoundingClientRect().height;
        if (currentHeight > maxHeight) {
          setMaxHeight(currentHeight);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [maxHeight]);

  return (
    <div
      ref={containerRef}
      className={className}
      //todo: doesn't need px?
      style={{ minHeight: `${maxHeight}px` }}
    >
      {children}
    </div>
  );
};
