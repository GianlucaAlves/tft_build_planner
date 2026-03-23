import {useQuery} from '@tanstack/react-query';

type Champion = {
    id: string;
    name: string
}

async function getChampions(): Promise<Champion[]>{
    const response = await fetch("http://localhost:3000/champions");
    if(!response.ok){
        throw new Error("Erro ao buscar campeões");
    }
    return response.json();
}

export function ChampionsList(){
    const {data, isPending, error} = useQuery({
        queryKey: ["champions"],
        queryFn: getChampions,
    });

    if(isPending) return <p>Carregando...</p>;
    if(error) return <p>Erro ao carregar</p>;
    
    return(
        <div className="flex justify-center items-center h-screen w-screen">
            <ul className="grid grid-cols-3 gap-4 ">
                {data.map((champion) => (
                    <li key={champion.id}>{champion.name}</li>
                ))}
            </ul>
        </div>
    );
}