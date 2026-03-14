import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { authService } from "@/services/authService";
import logoRR from "@/assets/logo_rr.webp";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function AccessPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showRegisterButton, setShowRegisterButton] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const isAuthenticated =
    localStorage.getItem("mock:isAuthenticated") === "true";

  const emailNotFound = message === "E-mail não encontrado.";

  useEffect(() => {
    if (!codeRequested || resendCountdown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [codeRequested, resendCountdown]);

  useEffect(() => {
    if (!codeRequested) return;

    const code = otp.join("");
    if (code.length === OTP_LENGTH && !otp.includes("")) {
      void handleAccess(code);
    }
  }, [otp, codeRequested]);

  useEffect(() => {
    if (codeRequested) {
      focusInput(0);
    }
  }, [codeRequested]);

  if (isAuthenticated) {
    return <Navigate to={`/ano/${new Date().getFullYear()}`} replace />;
  }

  const clearOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
  };

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  };

  const handleRequestAccess = async () => {
    if (emailNotFound) {
      handleGoToRegister();
      return;
    }

    setLoading(true);
    setMessage("");
    setShowRegisterButton(false);

    try {
      const response = await authService.requestAccessCode(email);

      if (!response.success) {
        setMessage(response.message);

        if (response.message === "E-mail não encontrado.") {
          setShowRegisterButton(true);
        }

        return;
      }

      setCodeRequested(true);
      clearOtp();
      setResendCountdown(RESEND_SECONDS);
      setMessage("Código enviado com sucesso para o e-mail informado.");
      setShowRegisterButton(false);

      window.setTimeout(() => {
        focusInput(0);
      }, 0);
    } catch {
      setMessage("Erro ao solicitar acesso.");
      setShowRegisterButton(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || loading) return;

    setLoading(true);
    setMessage("");
    setShowRegisterButton(false);

    try {
      const response = await authService.requestAccessCode(email);

      if (!response.success) {
        setMessage(response.message);

        if (response.message === "E-mail não encontrado.") {
          setShowRegisterButton(true);
        }

        return;
      }

      clearOtp();
      setResendCountdown(RESEND_SECONDS);
      setMessage("Novo código solicitado com sucesso.");

      window.setTimeout(() => {
        focusInput(0);
      }, 0);
    } catch {
      setMessage("Erro ao reenviar código.");
      setShowRegisterButton(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = async (finalCode?: string) => {
    const code = finalCode ?? otp.join("");

    if (code.length !== OTP_LENGTH) {
      setMessage("Digite o código completo.");
      return;
    }

    setLoading(true);
    setMessage("");
    setShowRegisterButton(false);

    try {
      const response = await authService.validateAccessCode(email, code);

      if (!response.success) {
        clearOtp();
        setMessage(response.message);

        if (response.message === "Usuário não encontrado.") {
          setShowRegisterButton(true);
        }

        window.setTimeout(() => {
          focusInput(0);
        }, 0);
        return;
      }

      if (response.user) {
        localStorage.setItem("mock:user", JSON.stringify(response.user));
        localStorage.setItem("mock:isAuthenticated", "true");
      }

      navigate("/");
    } catch {
      setMessage("Erro ao validar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    if (numericValue.length > 1) {
      const pasted = numericValue.slice(0, OTP_LENGTH).split("");
      const nextOtp = Array(OTP_LENGTH).fill("");

      pasted.forEach((digit, i) => {
        nextOtp[i] = digit;
      });

      setOtp(nextOtp);

      const nextIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
      window.setTimeout(() => {
        focusInput(nextIndex);
      }, 0);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = numericValue;
    setOtp(nextOtp);

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleOtpKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace") {
      if (otp[index]) {
        const nextOtp = [...otp];
        nextOtp[index] = "";
        setOtp(nextOtp);
        return;
      }

      if (index > 0) {
        focusInput(index - 1);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);

    const nextIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    window.setTimeout(() => {
      focusInput(nextIndex);
    }, 0);
  };

  const handleGoToRegister = () => {
    navigate(`/solicitar-cadastro?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex justify-center overflow-hidden">
            <img
              src={logoRR}
              alt="Royal Riders"
              className="h-[429px] object-contain -mb-[17px]"
            />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            Acesso ao calendário de eventos
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Informe seu e-mail para solicitar um código de acesso.
          </p>
        </div>

        <div className="space-y-5">
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
              value={email}
              disabled={codeRequested}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!codeRequested) {
                  setMessage("");
                  setShowRegisterButton(false);
                }
              }}
              placeholder="Digite seu e-mail"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            />

            {emailNotFound && !codeRequested && (
              <div className="mt-3 flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span>E-mail não encontrado.</span>
              </div>
            )}
          </div>

          {codeRequested && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-700">
                  Código de acesso
                </label>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0 || loading}
                  className="cursor-pointer text-sm font-medium text-blue-600 disabled:text-slate-400"
                >
                  {resendCountdown > 0
                    ? `Reenviar em ${resendCountdown}s`
                    : "Reenviar código"}
                </button>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-12 rounded-xl border border-slate-300 text-center text-lg font-semibold text-slate-900 outline-none transition focus:border-blue-500"
                  />
                ))}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Digite o código de {OTP_LENGTH} dígitos enviado para seu e-mail.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={codeRequested ? () => void handleAccess() : handleRequestAccess}
            disabled={
              loading ||
              !email ||
              (codeRequested && otp.join("").length !== OTP_LENGTH)
            }
            className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Carregando..."
              : codeRequested
                ? "Acessar"
                : emailNotFound
                  ? "Solicitar cadastro"
                  : "Solicitar acesso"}
          </button>

          {!codeRequested && !emailNotFound && (
            <p className="mt-2 text-sm italic text-slate-600">
              *Necessário estar cadastrado!
            </p>
          )}

          {message && !emailNotFound && (
            <div className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}