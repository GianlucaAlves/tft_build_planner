import {Router, Request, Response} from 'express';

const championsRouter = Router();

championsRouter.get("/", (req: Request, res: Response) => {
    res.send("Hello world!!!")
})

export default championsRouter;