import { Link } from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
      
      {/* Floating Illustration */}
      <div className="relative">
        <img
          src="https://illustrations.popsy.co/violet/error.svg"
          alt="Error Illustration"
          className="w-72 md:w-96 animate-bounce-slow"
        />
      </div>

      {/* Error Code */}
      <h1 className="text-6xl md:text-8xl font-extrabold mt-6 bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-xl">
        404
      </h1>

      {/* Message */}
      <p className="text-lg md:text-xl text-gray-300 mt-2 text-center max-w-md">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      {/* Button */}
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105"
      >
        Go Back Home
      </Link>

      {/* Animation class */}
      <style>{`
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
}
