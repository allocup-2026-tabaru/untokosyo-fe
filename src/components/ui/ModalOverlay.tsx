import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  isVisible?: boolean;
};

export function ModalOverlay({ children, isVisible = true }: Props) {
  return (
    <div
      className={`absolute inset-0 z-20 transition-opacity duration-300 ${
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isVisible}
    >
      {children}
    </div>
  );
}
