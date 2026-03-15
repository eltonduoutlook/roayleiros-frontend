import type { EventItem } from "@/types/event";

export const eventsMock: EventItem[] = [
    {
        id: "e1",
        title: "Colher flores em Holambra",
        date: `2026-01-17`,
        time: "10:00",
        unitId: "u1",
        location: "Holambra",
        state: "SP",
        description: "Passeio para a cidade de Holambra.",

        meetingPoints: [
            {
                id: "mp1", name: "Posto BR",
                time: "09:00",
                mapLink: "https://maps.google.com/?q=Posto+BR+Anchieta"
            },
            {
                id: "mp2", name: "Carrefour Anchieta",
                time: "09:30",
                mapLink: "https://www.google.com/maps?q=Carrefour+Anchieta",
            },
        ],
        goingParticipants: [
            { id: "u1", name: "Elton Costa", email: "elton@email.com" }
        ],
        interestedParticipants: [
            { id: "u2", name: "Marcos Silva", email: "marcos@email.com" },
            { id: "u3", name: "Ana Souza", email: "ana@email.com" }
        ]
    },

    {
        id: "e2",
        title: "Comer peixe assado em Piracicaba",
        date: `2026-01-17`,
        time: "14:00",
        unitId: "u2",
        location: "Piracicaba",
        state: "SP",
        description: "Passeio para a cidade de Piracicaba.",

        meetingPoints: [
            {
                id: "mp1", name: "Terminal Rodoviário",
                time: "08:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp2", name: "Shopping Cianê",
                time: "08:30",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp3", name: "Posto Shell - Centro",
                time: "08:30",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
        ],
        goingParticipants: [
            { id: "u1", name: "Elton Costa", email: "elton@email.com" }
        ],
        interestedParticipants: [
            { id: "u2", name: "Marcos Silva", email: "marcos@email.com" },
            { id: "u3", name: "Ana Souza", email: "ana@email.com" }
        ]
    },
    {
        id: "e3",
        title: "Pular sete ondinhas",
        date: `2026-03-14`,
        time: "10:30",
        unitId: "u3",
        location: "Bertioga",
        state: "SP",
        description: "Passeio para a cidade de Bertioga.",
        meetingPoints: [
            {
                id: "mp1", name: "Terminal Rodoviário",
                time: "07:30",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp2", name: "Shopping Piracicaba",
                time: "08:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp3", name: "Posto Shell - Centro",
                time: "08:30",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
        ],
        goingParticipants: [
            { id: "u1", name: "Elton Costa", email: "elton@email.com" }
        ],
        interestedParticipants: [
            { id: "u2", name: "Marcos Silva", email: "marcos@email.com" },
            { id: "u3", name: "Ana Souza", email: "ana@email.com" }
        ]
    },
    {
        id: "e4",
        title: "Churrasco raiz no Capuava",
        date: `2026-07-25`,
        time: "08:30",
        unitId: "u1",
        location: "Pirapora do Bom Jesus",
        state: "SP",
        description: "Capacitação da equipe comercial com foco em abordagem e fechamento.",
        meetingPoints: [
            {
                id: "mp1", name: "Terminal Rodoviário",
                time: "08:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp2", name: "Shopping Piracicaba",
                time: "08:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp3", name: "Posto Shell - Centro",
                time: "08:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
        ],
        goingParticipants: [
            { id: "u1", name: "Elton Costa", email: "elton@email.com" }
        ],
        interestedParticipants: [
            { id: "u2", name: "Marcos Silva", email: "marcos@email.com" },
            { id: "u3", name: "Ana Souza", email: "ana@email.com" }
        ]
    },
    {
        id: "e5",
        title: "Bate e fica em Paraty",
        date: `2026-11-07`,
        time: "16:00",
        unitId: "u2",
        location: "Paraty",
        state: "RJ",
        description: "Passeio para a cidade de Paraty.",
        meetingPoints: [
            {
                id: "mp1",
                name: "Terminal Rodoviário",
                time: "09:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp2",
                name: "Shopping Piracicaba",
                time: "09:30",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp3",
                name: "Posto Shell - Centro",
                time: "10:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
        ],
        goingParticipants: [
            { id: "u1", name: "Elton Costa", email: "elton@email.com" }
        ],
        interestedParticipants: [
            { id: "u2", name: "Marcos Silva", email: "marcos@email.com" },
            { id: "u3", name: "Ana Souza", email: "ana@email.com" }
        ]
    },
    {
        id: "e6",
        title: "Serra da Macaca",
        date: `2026-11-07`,
        time: "09:15",
        unitId: "u4",
        location: "São Miguel Arcanjo",
        state: "SP",
        description: "Visitar a onça Escuro.",
        meetingPoints: [
            {
                id: "mp1", name: "Terminal Rodoviário",
                time: "08:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp2", name: "Shopping Piracicaba",
                time: "08:00",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
            {
                id: "mp3", name: "Posto Shell - Centro",
                time: "08:30",
                mapLink: "https://maps.app.goo.gl/W4ff6bCg5J6pUtxG8"
            },
        ],
        goingParticipants: [
            { id: "u1", name: "Elton Costa", email: "elton@email.com" }
        ],
        interestedParticipants: [
            { id: "u2", name: "Marcos Silva", email: "marcos@email.com" },
            { id: "u3", name: "Ana Souza", email: "ana@email.com" }
        ]
    },
];