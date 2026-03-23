import { Champion, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listChampions(skip = 0, take = 25){
    return prisma.champion.findMany({
        skip,
        take,
    });
}

export async function listChampionById(id: string){
    return prisma.champion.findUnique({where: { id } });
}

export async function listChampionByName(name: string){
    return await prisma.champion.findMany({
        where: {
            name: {
                contains: name,
                mode: 'insensitive'
            }
        }
    });
}