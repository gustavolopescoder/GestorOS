export default function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`bg-slate-50 shadow-md rounded-lg p-4 w-auto h-auto ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
