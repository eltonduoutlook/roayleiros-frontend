import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RegisterRequestSuccessProps = {
    name: string;
    onBackToAccess?: () => void;
};

export function RegisterRequestSuccess({
    name,
    onBackToAccess,
}: RegisterRequestSuccessProps) {
    return (
        <Card className="w-full max-w-xl border-green-200 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                <CheckCircle2 className="h-14 w-14 text-green-600" />

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Olá, {name} 👋
                    </h2>

                    <p className="text-gray-700">
                        Para nós da <span className="font-semibold">Royal Riders</span>, é
                        um prazer ter você por aqui.
                    </p>

                    <p className="text-gray-700">
                        Recebemos sua solicitação de cadastro e ela já está em análise.
                    </p>

                    <p className="text-gray-700">
                        Assim que ela for aprovada, você poderá acessar a plataforma
                        normalmente.
                    </p>

                    <p className="text-sm text-gray-500">
                        Fique de olho no seu e-mail para atualizações.
                    </p>
                </div>

                {onBackToAccess && (
                    <Button type="button" onClick={onBackToAccess} className="mt-2">
                        Voltar para o acesso
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}