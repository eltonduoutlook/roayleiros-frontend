import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import logoRR from "@/assets/logoRR.png";
import { authService } from "@/services/authService";
import { ibgeService, type CityOption, type StateOption } from "@/services/ibge.service";

type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
};

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

export default function RequestRegistrationPage() {
  const navigate = useNavigate();
  const query = useQuery();

  const initialEmail = query.get("email") ?? "";

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: initialEmail,
    phone: "",
    state: "",
    city: "",
  });

  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successName, setSuccessName] = useState<string | null>(null);

  useEffect(() => {
    async function loadStates() {
      setLoadingStates(true);
      setErrorMessage("");

      try {
        const data = await ibgeService.getStates();
        setStates(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Não foi possível carregar os estados.");
      } finally {
        setLoadingStates(false);
      }
    }

    void loadStates();
  }, []);

  useEffect(() => {
    async function loadCities() {
      if (!formData.state) {
        setCities([]);
        return;
      }

      setLoadingCities(true);
      setErrorMessage("");

      try {
        const data = await ibgeService.getCitiesByState(formData.state);
        setCities(data);
      } catch (error) {
        console.error(error);
        setCities([]);
        setErrorMessage("Não foi possível carregar as cidades.");
      } finally {
        setLoadingCities(false);
      }
    }

    void loadCities();
  }, [formData.state]);

  function updateField<K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K],
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  function normalizePhone(value: string) {
    return value.replace(/\D/g, "").slice(0, 11);
  }

  function formatPhone(value: string) {
    const digits = normalizePhone(value);

    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    return value;
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
  }

  function validateForm() {
    if (!formData.name.trim()) return "Informe seu nome.";
    if (!isValidEmail(formData.email)) return "Informe um e-mail válido.";
    if (!normalizePhone(formData.phone)) return "Informe seu telefone.";
    if (normalizePhone(formData.phone).length < 10) return "Informe um telefone válido.";
    if (!formData.state) return "Selecione um estado.";
    if (!formData.city) return "Selecione uma cidade.";
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoadingSubmit(true);

    try {
      const response = await authService.requestUserRegistration({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
      });

      setMessage(response.message || "Solicitação enviada com sucesso.");
      setSuccessName(formData.name.trim());
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a solicitação.";

      setErrorMessage(errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  }

  if (successName) {
    return (
      <div className="flex min-h-dvh justify-center bg-slate-100 px-4 py-3">
        <div className="flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col justify-center rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 sm:mb-6">
            <div className="mb-3 flex justify-center overflow-hidden">
              <img
                src={logoRR}
                alt="Royal Riders"
                className="h-[22vh] object-contain sm:h-[28vh] md:h-[32vh]"
              />
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
              Olá, {successName}! 👋
            </h1>

            <p className="text-sm text-slate-700 sm:text-base">
              Para nós da <span className="font-semibold">Royal Riders</span>, é um prazer ter você por aqui.
            </p>

            <p className="text-sm text-slate-700 sm:text-base">
              Recebemos sua solicitação de cadastro e ela já está em análise.
            </p>

            <p className="text-sm text-slate-700 sm:text-base">
              Assim que ela for aprovada, você poderá acessar a plataforma normalmente.
            </p>

            <p className="text-sm text-slate-500">
              Fique de olho no seu e-mail para atualizações.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              Ir para a tela de acesso
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh justify-center bg-slate-100 px-4 py-3">
      <div className="flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 sm:mb-6">
          <div className="mb-3 flex justify-center overflow-hidden">
            <img
              src={logoRR}
              alt="Royal Riders"
              className="h-[22vh] object-contain sm:h-[28vh] md:h-[32vh]"
            />
          </div>

          <h1 className="text-base font-semibold leading-tight text-slate-900 sm:text-xl md:text-2xl">
            Solicitação de cadastro
          </h1>

          <p className="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
            Preencha seus dados para solicitar acesso ao calendário de eventos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Digite seu nome"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Telefone
            </label>
            <input
              id="phone"
              type="text"
              value={formatPhone(formData.phone)}
              onChange={(e) => updateField("phone", normalizePhone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Estado
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => {
                const value = e.target.value;

                setCities([]);
                setFormData((prev) => ({
                  ...prev,
                  state: value,
                  city: "",
                }));
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500"
            >
              <option value="">
                {loadingStates ? "Carregando estados..." : "Selecione um estado"}
              </option>

              {states.map((state) => (
                <option key={state.id} value={state.sigla}>
                  {state.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Cidade
            </label>
            <select
              id="city"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              disabled={!formData.state || loadingCities}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {!formData.state
                  ? "Selecione primeiro um estado"
                  : loadingCities
                    ? "Carregando cidades..."
                    : "Selecione uma cidade"}
              </option>

              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {message && !successName && (
            <div className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full rounded-xl bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loadingSubmit ? "Enviando..." : "Enviar solicitação"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-xl border border-slate-300 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voltar
          </button>
        </form>
      </div>
    </div>
  );
}