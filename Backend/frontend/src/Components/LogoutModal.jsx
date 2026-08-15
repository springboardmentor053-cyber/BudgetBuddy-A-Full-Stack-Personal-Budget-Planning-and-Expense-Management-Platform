import { FaSignOutAlt } from "react-icons/fa";

function LogoutModal({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl p-8 w-[420px] animate-fadeIn"
      >
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <FaSignOutAlt className="text-3xl text-indigo-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800">
          Logout
        </h2>

        <p className="text-center text-slate-500 mt-3">
          Are you sure you want to logout?
        </p>

        <p className="text-center text-sm text-slate-400 mt-2">
          You will need to login again to access your BudgetBuddy account.
        </p>

        <div className="flex gap-4 mt-8">

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold transition"
          >
            Cancel
          </button>

          <button
            onClick={onLogout}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold transition shadow-lg"
          >
            Logout
          </button>

        </div>
      </div>
    </div>
  );
}

export default LogoutModal;