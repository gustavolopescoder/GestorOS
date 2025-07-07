import React from "react";

export default function Icon({
  children,
  size = 38,
  className = "text-blue-600",
}) {
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
