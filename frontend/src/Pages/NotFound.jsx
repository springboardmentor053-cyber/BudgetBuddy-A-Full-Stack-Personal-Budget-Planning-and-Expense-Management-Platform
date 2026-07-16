import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-9xl font-black text-rose-500 mb-4 animate-bounce">404</h1>
      <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-md">Oops! The page you are looking for doesn't exist or has been moved to another coordinate.</p>
      <Link to="/" className="px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg hover:shadow-rose-500/20 transition-all duration-200">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;