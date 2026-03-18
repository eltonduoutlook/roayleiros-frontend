import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { authService } from "@/services/authService";
import { authStorage } from "@/lib/authStorage";
import logoRR from "@/assets/logoRR.png";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type AppErrorLike = {
  message?: string;
  code?: string;
};

export default function AccessPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const validatingRef = useRef(false);

  const isAuthenticated = authStorage.isAuthenticated();
  const emailNotFound = errorCode === "USER_NOT_FOUND";
  const pendingApproval = errorCode === "PENDING_APPROVAL";

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

    if (
      code.length === OTP_LENGTH &&
      !otp.includes("") &&
      !validatingRef.current
    ) {
      validatingRef.current = true;
      void handleAccess(code);
    }
  }, [otp, codeRequested]);

  useEffect(() => {
    if (!codeRequested) return;

    const timer = window.setTimeout(() => {
      focusInput(0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [codeRequested]);

  if (isAuthenticated) {
    return <Navigate to={`/ano/${new Date().getFullYear()}`} replace />;
  }

  function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
  }

  function clearOtp() {
    setOtp(Array(OTP_LENGTH).fill(""));
  }

  function focusInput(index: number) {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  }

  function resetFeedback() {
    setMessage("");
    setErrorCode(null);
  }

  function getErrorDetails(error: unknown) {
    if (error instanceof Error) {
      const maybeError = error as Error & { code?: string };
      return {
        message: maybeError.message || "Ocorreu um erro.",
        code: maybeError.code ?? null,
      };
    }

    if (typeof error === "object" && error !== null) {
      const maybeError = error as AppErrorLike;
      return {
        message: maybeError.message || "Ocorreu um erro.",
        code: maybeError.code ?? null,
      };
    }

    return {
      message: "Ocorreu um erro.",
      code: null,
    };
  }

  function isUserNotFoundError(message: string, code: string | null) {
    const normalized = message.toLowerCase();

    return (
      code === "USER_NOT_FOUND" ||
      normalized.includes("não encontrado") ||
      normalized.includes("nao encontrado") ||
      normalized.includes("usuário não encontrado") ||
      normalized.includes("usuario nao encontrado") ||
      normalized.includes("user not found")
    );
  }

  function isPendingApprovalError(message: string, code: string | null) {
    const normalized = message.toLowerCase();

    return (
      code === "PENDING_APPROVAL" ||
      code === "REGISTER_REQUEST_PENDING" ||
      code === "REQUEST_PENDING" ||
      normalized.includes("aguardando aprovação") ||
      normalized.includes("aguardando aprovacao") ||
      normalized.includes("cadastro pendente") ||
      normalized.includes("solicitação pendente") ||
      normalized.includes("solicitacao pendente") ||
      normalized.includes("pending")
    );
  }

  function fillOtpFromString(rawValue: string) {
    const digits = rawValue.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;

    const nextOtp = Array(OTP_LENGTH).fill("");
    digits.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);

    const nextIndex = Math.min(digits.length - 1, OTP_LENGTH - 1);
    window.setTimeout(() => {
      focusInput(nextIndex);
    }, 0);
  }

  async function handleRequestAccess() {
    if (emailNotFound) {
      handleGoToRegister();
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      setMessage("Digite um e-mail válido.");
      setErrorCode(null);
      return;
    }

    setLoading(true);
    resetFeedback();

    try {
      const response = await authService.requestAccessCode(normalizedEmail);

      setEmail(normalizedEmail);
      setCodeRequested(true);
      clearOtp();
      setResendCountdown(RESEND_SECONDS);
      setMessage(response.message || "Código enviado para seu e-mail.");
      setErrorCode(null);

      window.setTimeout(() => {
        focusInput(0);
      }, 0);
    } catch (error) {
      const { message, code } = getErrorDetails(error);
      const notFound = isUserNotFoundError(message, code);
      const pending = isPendingApprovalError(message, code);

      if (pending) {
        setMessage("Seu cadastro já foi solicitado e está aguardando aprovação.");
        setErrorCode("PENDING_APPROVAL");
      } else if (notFound) {
        setMessage(message);
        setErrorCode("USER_NOT_FOUND");
      } else {
        setMessage(message);
        setErrorCode(code);
      }

      setCodeRequested(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resendCountdown > 0 || loading) return;

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      setMessage("Digite um e-mail válido.");
      setErrorCode(null);
      return;
    }

    setLoading(true);
    resetFeedback();

    try {
      const response = await authService.requestAccessCode(normalizedEmail);

      setEmail(normalizedEmail);
      clearOtp();
      setResendCountdown(RESEND_SECONDS);
      setMessage(response.message || "Novo código enviado.");
      setErrorCode(null);

      window.setTimeout(() => {
        focusInput(0);
      }, 0);
    } catch (error) {
      const { message, code } = getErrorDetails(error);
      const pending = isPendingApprovalError(message, code);

      if (pending) {
        setMessage("Seu cadastro já foi solicitado e está aguardando aprovação.");
        setErrorCode("PENDING_APPROVAL");
        setCodeRequested(false);
      } else {
        setMessage(message);
        setErrorCode(code);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAccess(finalCode?: string) {
    if (loading) {
      validatingRef.current = false;
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const code = (finalCode ?? otp.join("")).replace(/\D/g, "");

    if (!isValidEmail(normalizedEmail)) {
      setMessage("Digite um e-mail válido.");
      setErrorCode(null);
      validatingRef.current = false;
      return;
    }

    if (code.length !== OTP_LENGTH) {
      setMessage("Digite o código completo.");
      setErrorCode(null);
      validatingRef.current = false;
      return;
    }

    setLoading(true);
    resetFeedback();

    try {
      const response = await authService.validateAccessCode(normalizedEmail, code);
      const user = response.user ?? response.data?.user;

      if (user) {
        authService.saveAuth(response);
        navigate(`/ano/${new Date().getFullYear()}`, { replace: true });
        return;
      }

      setMessage("Não foi possível concluir o acesso.");
      setErrorCode(null);
      clearOtp();

      window.setTimeout(() => {
        focusInput(0);
      }, 0);
    } catch (error) {
      const { message, code } = getErrorDetails(error);

      clearOtp();
      setMessage(message);
      setErrorCode(code);

      window.setTimeout(() => {
        focusInput(0);
      }, 0);
    } finally {
      validatingRef.current = false;
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const rawValue = event.target.value;
    const numericValue = rawValue.replace(/\D/g, "");

    if (!numericValue) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    if (numericValue.length > 1) {
      fillOtpFromString(numericValue);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = numericValue;
    setOtp(nextOtp);

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleAccess();
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();

      const nextOtp = [...otp];

      if (nextOtp[index]) {
        nextOtp[index] = "";
        setOtp(nextOtp);
        return;
      }

      if (index > 0) {
        nextOtp[index - 1] = "";
        setOtp(nextOtp);
        focusInput(index - 1);
      }

      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    fillOtpFromString(pasted);
  }

  function handleGoToRegister() {
    navigate(`/solicitar-cadastro?email=${encodeURIComponent(normalizeEmail(email))}`);
  }

  function handleResetEmail() {
    setCodeRequested(false);
    clearOtp();
    setResendCountdown(0);
    resetFeedback();
    validatingRef.current = false;
  }

  return (
    <div className="flex min-h-dvh justify-center bg-slate-100 px-4 py-3">
      <div className="flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 sm:mb-6">
          <div className="mb-3 flex justify-center overflow-hidden">
            <img
              src={logoRR}
              alt="Royal Riders"
              className="h-[32vh] object-contain sm:h-[44vh] md:h-[56vh] lg:h-[440px]"
            />
          </div>

          <h1 className="text-base font-semibold leading-tight text-slate-900 sm:text-xl md:text-2xl">
            Acesso ao calendário de eventos
          </h1>

          <p className="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
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
                if (!codeRequested) resetFeedback();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !codeRequested) {
                  e.preventDefault();
                  void handleRequestAccess();
                }
              }}
              placeholder="Digite seu e-mail"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            />

            {codeRequested && (
              <button
                type="button"
                onClick={handleResetEmail}
                className="mt-2 text-sm font-medium text-blue-600"
              >
                Alterar e-mail
              </button>
            )}

            {emailNotFound && !codeRequested && (
              <div className="mt-3 flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span>E-mail não encontrado.</span>
              </div>
            )}

            {pendingApproval && !codeRequested && (
              <div className="mt-3 flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <span>Seu cadastro está aguardando aprovação.</span>
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
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
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

          {!codeRequested && !emailNotFound && !pendingApproval && (
            <button
              type="button"
              onClick={handleRequestAccess}
              disabled={loading || !email.trim()}
              className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Carregando..." : "Solicitar acesso"}
            </button>
          )}

          {emailNotFound && !codeRequested && (
            <button
              type="button"
              onClick={handleGoToRegister}
              className="w-full cursor-pointer rounded-xl bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              Solicitar cadastro
            </button>
          )}

          {!codeRequested && !emailNotFound && !pendingApproval && (
            <p className="mt-2 text-sm italic text-slate-600">
              *Necessário estar cadastrado!
            </p>
          )}

          {message && !emailNotFound && !pendingApproval && (
            <div className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}