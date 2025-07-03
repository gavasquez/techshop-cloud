export class User {
    constructor(
        public readonly name: string,
        public readonly email: string,
        public password: string,
        public readonly role: "client" | "admin" = "client",
        public readonly id?: string,
    ) { }
}
