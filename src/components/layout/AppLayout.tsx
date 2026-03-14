import { CalendarDays, LogOut, User } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type UserItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  level: string;
};

export function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserItem | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("mock:user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mock:user");
    localStorage.removeItem("mock:isAuthenticated");

    navigate("/acesso");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex items-center justify-between px-4 py-4">

          {/* Lado esquerdo */}
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-slate-700" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Agenda de Eventos Royal Riders
              </h1>
              <p className="text-sm text-slate-500">
                Royal Riders, onde o propósito é servir
              </p>
            </div>
          </div>

          {/* Lado direito */}
          {user && (
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium text-slate-800">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {user.level}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>

            </div>
          )}
        </div>
      </div>

      <main className="mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}