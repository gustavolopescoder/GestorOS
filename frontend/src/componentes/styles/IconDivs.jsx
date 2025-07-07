import React from "react";

export default function IconDivs({ children, size = 25, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center text-gray-700`}
      style={{ fontSize: size }}
    >
      {React.cloneElement(children, {
        size, // Aplica o tamanho para ícones de react-icons
        className: `w-${size} h-${size} ${className}`,
      })}
    </span>
  );
}
