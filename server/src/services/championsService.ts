import { Champion, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listChampions(){
    return prisma.champion.findMany();
}

export async function listChampionById(id: string){
    return prisma.champion.findUnique({where: { id } });
}