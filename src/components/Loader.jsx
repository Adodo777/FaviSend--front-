export default function Loader({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}