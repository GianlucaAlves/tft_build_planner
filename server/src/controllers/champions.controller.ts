import {Request, Response} from 'express';
import {listChampions, listChampionById} from '../services/championsService';

export  async function getChampions(req: Request, res: Response){
    try{
        const champions = await listChampions();
        res.json(champions);
    }catch (error) {
        res.status(500).json({error: "Erro ao buscar os campeões"});
    }
}

export async function getChampionById(req: Request, res: Response){
    try{
        const id= String(req.params.id);
        const champion = await listChampionById(id);
        if(!champion){
            return res.status(404).json({error: "Campeão não encontrado"});
            }
        res.json(champion);
    }catch(error){
        res.status(500).json({error: "Erro ao buscar o campeão"});
    }
}