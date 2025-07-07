export default function Title({ children }) {
  return (
    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
      {children}
    </h1>
  );
}
