import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 sm:h-20 sm:w-20">
          <SearchX className="h-8 w-8 text-slate-500 sm:h-10 sm:w-10" />
        </div>

        <h2 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          Página não encontrada
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          A rota acessada não existe ou o registro procurado não foi encontrado.
        </p>

        <div className="mt-6">
          <Button className="h-11 w-full cursor-pointer rounded-xl sm:w-auto" asChild>
            <Link to="/">Voltar para a Home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}