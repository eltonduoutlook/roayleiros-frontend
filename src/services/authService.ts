import { usersMock } from "@/data/usersMock";
import { UserItem } from "@/types/users";

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

type SafeUser = Omit<UserItem, "accessCode">;

type RequestAccessResponse = {
    success: boolean;
    message: string;
    user?: SafeUser;
};

type ValidateAccessResponse = {
    success: boolean;
    message: string;
    user?: SafeUser;
};

type RegisterRequestInput = {
    name: string;
    city: string;
    email: string;
    phone: string;
};

type RegisterRequestResponse = {
    success: boolean;
    message: string;
};

const toSafeUser = (user: UserItem): SafeUser => ({
    id: user.id,
    name: user.name,    
    city: user.city,    
    email: user.email,
    phone: user.phone,
    active: user.active,
    level: user.level,
});

export const authService = {
    async requestAccessCode(email: string): Promise<RequestAccessResponse> {
        await wait();

        const normalizedEmail = email.trim().toLowerCase();

        const user = usersMock.find(
            (item) => item.email.trim().toLowerCase() === normalizedEmail
        );

        if (!user) {
            return {
                success: false,
                message: "E-mail não encontrado.",
            };
        }

        if (!user.active) {
            return {
                success: false,
                message: "Usuário inativo.",
            };
        }

        return {
            success: true,
            message:
                "Se o e-mail estiver cadastrado, um código de acesso foi enviado.",
            user: toSafeUser(user),
        };
    },

    async validateAccessCode(
        email: string,
        code: string
    ): Promise<ValidateAccessResponse> {
        await wait();

        const normalizedEmail = email.trim().toLowerCase();

        const user = usersMock.find(
            (item) => item.email.trim().toLowerCase() === normalizedEmail
        );

        if (!user) {
            return {
                success: false,
                message: "Usuário não encontrado.",
            };
        }

        if (!user.active) {
            return {
                success: false,
                message: "Usuário inativo.",
            };
        }

        if (!user.accessCode) {
            return {
                success: false,
                message: "Usuário não possui código de acesso.",
            };
        }

        if (String(user.accessCode) !== code.trim()) {
            return {
                success: false,
                message: "Código inválido.",
            };
        }

        return {
            success: true,
            message: "Acesso liberado com sucesso.",
            user: toSafeUser(user),
        };
    },

    async requestUserRegistration(
        input: RegisterRequestInput
    ): Promise<RegisterRequestResponse> {
        await wait();

        const normalizedEmail = input.email.trim().toLowerCase();

        const existingUser = usersMock.find(
            (item) => item.email.trim().toLowerCase() === normalizedEmail
        );

        if (existingUser) {
            return {
                success: false,
                message: "Já existe um usuário cadastrado com este e-mail.",
            };
        }

        return {
            success: true,
            message:
                `Olá, ${name}!

                Para nós, da Royal Riders, é uma satisfação receber seu interesse em participar da nossa comunidade.

                Seus dados foram recebidos e encaminhados à equipe coordenadora. Em breve você receberá um contato para confirmar seu cadastro e então poderá ter acesso aos eventos e participar do grupo de WhatsApp da expansão de sua escolha.

                Seja bem-vindo à jornada e bora rodar!`,
        };
    },
};