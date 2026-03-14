import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold text-slate-900">Página não encontrada</h2>
      <p className="text-slate-500">A rota acessada não existe ou o registro não foi encontrado.</p>

      <Button className="cursor-pointer" asChild>
        <Link to="/">Voltar para a Home</Link>
      </Button>
    </section>
  );
}