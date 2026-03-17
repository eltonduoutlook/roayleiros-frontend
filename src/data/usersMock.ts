import { UserItem } from "@/types/users";

export const usersMock: UserItem[] = [
  {
    id: "usr1",
    name: "Elton Costa",
    city: "São Paulo",
    email: "elton.du@gmail.com",
    phone: "(11) 93231-5454",
    active: true,
    level: "ADMIN",
    accessCode: 315454,
  },
  {
      id: "usr2",
      name: "Maria Silva",
      city: "",
      email: "maria@email.com",
      phone: "(11) 98888-2222",
      active: true,
      level: "COORDINATOR",
      accessCode: 123,
  },
  {
      id: "usr3",
      name: "João Souza",
      city: "",
      email: "joao@email.com",
      phone: "(11) 97777-3333",
      active: false,
      level: "MEMBER",
      accessCode: 123,
  },
];