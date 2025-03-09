export interface Channel{
    name: string,
    index: number,
    color: string,
    isPublic: boolean,
    owner: number,
    valid: boolean
}

export interface Typer{
    username: string,
    message: string
}