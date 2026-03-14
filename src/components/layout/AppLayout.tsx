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
        <div className="mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Linha 1 no mobile / lado esquerdo no desktop */}
            <div className="flex items-center gap-3">
              <CalendarDays className="mt-0.5 h-6 w-6 shrink-0 text-slate-700" />
              <div className="min-w-0">
                <h1 className="text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                  Agenda de Eventos Royal Riders
                </h1>
                <p className="text-sm leading-tight text-slate-500 hidden md:inline">
                  Royal Riders, onde o propósito é servir
                </p>
              </div>
            </div>

            {/* Linha 2 no mobile / lado direito no desktop */}
            {user && (
              <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                  <User className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 leading-tight">
                    <span className="block truncate font-medium text-slate-800">
                      {user.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}