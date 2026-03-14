import { formatPhone } from "@/lib/utils";
import { authService } from "@/services/authService";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function RequestRegistrationPage() {
    const [searchParams] = useSearchParams();

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [email, setEmail] = useState(searchParams.get("email") ?? "");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const submittedName = name.trim();
        const submittedCity = city.trim();
        const submittedEmail = email.trim();
        const submittedPhone = phone.trim();

        setLoading(true);
        setMessage("");
        setSuccess(false);

        try {
            const response = await authService.requestUserRegistration({
                name: submittedName,
                city: submittedCity,
                email: submittedEmail,
                phone: submittedPhone,
            });

            if (response.success) {
                setSuccess(true);
                setMessage(`Olá, ${submittedName}!
                    
                    Para nós, da Royal Riders, é uma satisfação receber seu interesse em participar da nossa comunidade.
                    
                    Seus dados foram cadastrados e enviados à equipe coordenadora. Em breve você receberá um contato para confirmar seu cadastro e então poderá ter acesso aos eventos e participar do grupo de WhatsApp da expansão de sua escolha.`);

                setName("");
                setCity("");
                setPhone("");
            } else {
                setSuccess(false);
                setMessage(response.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            {!success && (
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-slate-900">
                            Solicitar cadastro
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Preencha os dados abaixo para enviar sua solicitação.
                        </p>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Nome
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Cidade
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                E-mail
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                placeholder="(11) 99999-9999"
                                className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Enviando..." : "Enviar solicitação"}
                        </button>
                    </form>
                </div>
            )}
            {message && (
                <div
                    className={`mt-6 w-full max-w-md rounded-2xl border p-6 ${success
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-800"
                        }`}
                >
                    <div className="mb-3 flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${success ? "bg-green-100" : "bg-red-100"
                                }`}
                        >
                            {success ? "✓" : "!"}
                        </div>

                        <h2 className="text-lg font-semibold">
                            {success
                                ? "Solicitação enviada com sucesso"
                                : "Não foi possível enviar a solicitação"}
                        </h2>
                    </div>

                    <p className="whitespace-pre-line text-sm leading-relaxed">
                        {message}
                    </p>

                    {success && (
                        <button
                            onClick={() => navigate("/acesso")}
                            className="cursor-pointer mt-5 w-full rounded-xl border border-green-300 bg-white py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                        >
                            Voltar para acesso
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}