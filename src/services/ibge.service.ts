export type StateOption = {
    id: number;
    sigla: string;
    nome: string;
};

export type CityOption = {
    id: number;
    nome: string;
};

export const ibgeService = {
    async getStates(): Promise<StateOption[]> {
        const response = await fetch(
            "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar os estados.");
        }

        return response.json();
    },

    async getCitiesByState(uf: string): Promise<CityOption[]> {
        const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar as cidades.");
        }

        return response.json();
    },
};