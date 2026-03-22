import {Router, Request, Response} from 'express';
import {getChampions, getChampionById} from '../controllers/champions.controller';

 const championsRouter = Router();

championsRouter.get('/', getChampions);
championsRouter.get('/:id', getChampionById);

export default championsRouter;