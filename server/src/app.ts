import {Request, Response} from 'express';
import express from 'express';
import championsRouter from './routes/champions.routes';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use('/champions', championsRouter)

app.get('/', (req: Request, res: Response) =>{
    res.send('Hello World!');
});


app.listen(port, () =>{
    console.log(`Example app listening on port ${port}`);
});
