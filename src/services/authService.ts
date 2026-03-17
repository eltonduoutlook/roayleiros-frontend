import { api } from "@/services/api";
import {
  RegisterRequestInput,
  RegisterRequestResponse,
  RequestAccessResponse,
  ValidateAccessResponse,
} from "@/types/auth";
import { authStorage } from "@/lib/authStorage";

export const authService = {
  async requestAccessCode(email: string): Promise<RequestAccessResponse> {
    return api.post("/auth/request-access-code", {
      email: email.trim().toLowerCase(),
    });
  },

  async validateAccessCode(
    email: string,
    code: string,
  ): Promise<ValidateAccessResponse> {
    return api.post("/auth/validate-access-code", {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    });
  },

  async requestUserRegistration(
    input: RegisterRequestInput,
  ): Promise<RegisterRequestResponse> {
    return api.post("/auth/register-request", {
      name: input.name.trim(),
      state: input.state.trim(),
      city: input.city.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.replace(/\D/g, ""),
    });
  },

  saveAuth(data: ValidateAccessResponse) {
    const user = data.user ?? data.data?.user;
    const session = data.session ?? data.data?.session;

    if (!user || !session?.expiresAt) {
      authStorage.clear();
      throw new Error("Sessão inválida no retorno da autenticação.");
    }

    authStorage.setUser(user);
    authStorage.setSession({
      expiresAt: session.expiresAt,
    });
  },
};