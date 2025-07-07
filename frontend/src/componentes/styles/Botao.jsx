export default function Botao({
  children,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-gradient-to-r from-blue-500 to-blue-600  shadow px-4 py-2 rounded-md font-medium text-white transform hover:scale-105 transition duration-300${className}`}
    >
      {children}
    </button>
  );
}
