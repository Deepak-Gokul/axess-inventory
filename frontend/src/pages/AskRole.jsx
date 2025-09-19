import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const AskRole = ({ children }) => {
  const navigate = useNavigate();
  const { assetId } = useParams();

  const [roleSelected, setRoleSelected] = useState(localStorage.getItem("roleSelected") === "true");
  const isOffline = !navigator.onLine;

  const handleUserClick = () => {
    if (!roleSelected) {
      localStorage.setItem("roleSelected", "true");
      setRoleSelected(true);
    }
  };

  const handleAdminClick = () => {
    if (!roleSelected) {
      localStorage.setItem("roleSelected", "true");
      setRoleSelected(true);
    }
    navigate(`/login?redirect=/item/${assetId}`, { replace: true });
  };

  if (isOffline || roleSelected) {
    return <>{children}</>;
  }

  return (
    <main className="p-4 max-w-md mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold mb-6">Who are you?</h1>
      <div className="space-y-4">
        <button
          onClick={handleUserClick}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          aria-label="Proceed as user"
        >
          User
        </button>
        <button
          onClick={handleAdminClick}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          aria-label="Proceed as admin"
        >
          Admin
        </button>
      </div>
    </main>
  );
}

export default AskRole;