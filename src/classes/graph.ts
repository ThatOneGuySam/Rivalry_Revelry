function calculateWeight(strength: number): number{
    /* Function used to convert rivalry strength on a scale of 1 to 10 to weight on web*/
    const upper = 1.95; // U
    const lower = 1.0; // L
    const k = 0.7;     // steepness
    const x0 = 5;      // inflection point
  
    return lower + (upper - lower) / (1 + Math.exp(k * (strength - x0)));
  }
export type parityPath = {
    even: Map<string, Path>;
    odd: Map<string, Path>;
}

export type recursingStep = {
    totalChildren: number;
    directChildren: string[];
    parent: string;
    length: number;
    percentage: number;
}

export type advancedSettings = {
    NO_CONFERENCE_ALLIES: boolean;
    NO_LOOPS: boolean;
    NO_RIVALS_AS_ALLIES: boolean;
}

export class Vertex{
    conference: string;
    name: string;
    edges: Edge[];
    logo_name: string;
    spellings: string[];
    private logo_dir: string = "/assets/CFB Logos/"
    

    constructor(name: string, conference: string, logo_name: string, alt_spellings: string[]){
        this.name = name;
        this.conference = conference;
        this.edges = [];
        this.logo_name = logo_name;
        this.spellings = [this.name, this.logo_name, ...alt_spellings];
    }

    addEdge(e: Edge): void{
        this.edges.push(e);
    }

    logoPath(): string{
        return `${this.logo_dir}${this.logo_name.replace(/ /g,"_")}.png`
    }
}

export class Edge{
    source: Vertex;
    dest: Vertex;
    weight: number;
    strength: number;

    constructor(from: Vertex, to: Vertex, strength: number){
        this.source = from;
        this.dest = to;
        this.weight = calculateWeight(strength);
        this.strength = strength;
        from.addEdge(this);
    }

    changeStrength(strength: number){
        this.weight = calculateWeight(strength);
        this.strength = strength;
    }
}

export class Path{
    vertices: Vertex[];
    edges: Edge[];
    steps: number;
    weight: number;
    constructor(v: Vertex[], e: Edge[]){
        this.vertices = v;
        this.edges = e;
        this.steps = this.vertices.length;
        this.weight = 0;
        for(let i =0; i < this.edges.length; i++){
            this.weight += this.edges[i].weight;
        }
    }

    starterVertex(v: Vertex): void{
        this.vertices.push(v);
    }

    addVertexAndEdge(v: Vertex, e: Edge): void{
        //Add vertex into system
        this.vertices.push(v);
        this.edges.push(e);
        this.steps++;
        this.weight += e.weight;
    }

    addVertexByGraph(v: Vertex, g: Graph): void{
        const edgeToInsert: Edge | undefined = g.findEdge(this.vertices[this.vertices.length-1],v);
        if(!edgeToInsert){
            console.error("Attempted to add non-existent edge to path", v);
            return;
        }
        this.vertices.push(v);
        this.edges.push(edgeToInsert);
        this.steps++;
        this.weight += edgeToInsert.weight;

    }

    vertexInPath(searchName: string): Boolean{
        return this.vertices.some(step => step.name === searchName);
    }

    evenParity(): Boolean{
        //Counter-intuitive, but check for oddness because of first step being source
        return this.vertices.length % 2 === 1
    }

    stringForm(): string{
        let currString = "";
        for(let i = 0; i < this.vertices.length; i++){
            currString += this.vertices[i].name;
            if(i < this.vertices.length - 1){
                currString += " --> "
            }
        }
        return currString;
    }

    lastStep(): Vertex | undefined{
        if(this.vertices.length < 2){
            return;
        }else{
            return this.vertices[this.vertices.length-2];
        }
    }

    lastWeight(): number{
        if (this.edges.length < 1){
            return 0;
        }else{
            return this.edges[this.edges.length-1].weight;
        }
    }

}

export class Graph{
    vertices: Vertex[];
    edges: Edge[];

    constructor(v: Vertex[] = [], e: Edge[] = []){
        this.vertices = v;
        this.edges = e;
    }

    addVertex(v: Vertex): void{
        //Add vertex into system
        this.vertices.push(v);
    }

    addVertexByName(name: string, conf: string, l_name: string, alts: string[]): void{
        this.vertices.push(new Vertex(name, conf, l_name, alts))
    }

    addConference(conference: string, names: string[], l_names: string[], alts_s: string[][]){
        names.forEach((ne: string, index: number) => this.addVertexByName(ne, conference, l_names[index], alts_s[index]));
    }

    makeEdge(from: Vertex, to: Vertex, strength: number): void{
        //Add edge into system
        this.edges.push(new Edge(from, to, strength));
    }

    makeEdgeByName(source: string, dest: string, strength: number): void{
        //Add edge into system
        const from = this.findVertex(source)!;
        const to = this.findVertex(dest)!;
        this.edges.push(new Edge(from, to, strength));
    }

    allEdgesForName(name: string, dests: string[], strengths: number[]){
        const v: Vertex | undefined = this.findVertex(name);
        const maxStrength: number = Math.max(...strengths);
        if(!v){
            console.error("Attempted to add edges to non existent vertex", name, dests);
            return;
        }
        for(let i = 0; i < dests.length; i++){
            const d: Vertex | undefined = this.findVertex(dests[i]);
            if(!d){
                console.error("Attempted to direct edge to non existent vertex", name, dests[i]);
                continue;
            }
            this.makeEdge(v, d, Math.max(Math.round(4*(10*strengths[i]/maxStrength))/4, 0.25));
        }
    }

    findVertex(name: string): Vertex | undefined{
        return this.vertices.find(v => v.name === name);
    }

    findConference(conf: string): Vertex[] | undefined{
        return this.vertices.filter(v => v.conference === conf);
    }

    findEdge(from: Vertex, to: Vertex): Edge | undefined{
        return this.edges.find(e => e.source === from && e.dest === to);
    }

    updateEdge(from: Vertex, to: Vertex, strength: number): void{
        const updEdge: Edge | undefined = this.findEdge(from, to);
        if(updEdge){
            updEdge.changeStrength(strength);
        }else{
            this.makeEdge(from, to, strength);
        }
    }

    deleteEdge(from: Vertex, to: Vertex): void{
        const delEdge: Edge | undefined = this.findEdge(from, to);
        if(delEdge){
            this.edges = this.edges.filter(e => e.source !== from || e.dest !== to);
            from.edges = from.edges.filter(e => e.dest !== to);
        }
    }

    deleteEdgeByNames(source: string, dest: string): void{
        const from = this.findVertex(source)
        const to = this.findVertex(dest);
        if(from && to){
            const delEdge: Edge | undefined = this.findEdge(from, to);
            if(delEdge){
                this.edges = this.edges.filter(e => e.source !== from || e.dest !== to);
            from.edges = from.edges.filter(e => e.dest !== to);
            }
        }
        
    }

    getMissingTeams(teams: string[]): string[]{
        const missingSet = this.vertices.filter(v => !teams.includes(v.name));

        return missingSet.map(v => v.name);
    }

    Dijkstra(source: string): Map<string, Path>{
        const pathSet = new Map<string, Path>();
        const visited = new Set<Vertex>();
        
        const priorityQueue: [Vertex, number][] = [];

        const sourceVertex = this.findVertex(source);
        if(!sourceVertex){
            console.error("Search on non-existent vertex");
            return new Map<string, Path>();
        }

        pathSet.set(source, new Path([sourceVertex],[]));
        priorityQueue.push([sourceVertex, 0]);


        while (priorityQueue.length > 0) {
            // Sort to get vertex with smallest distance (replace with min-heap for better performance)
            priorityQueue.sort((a, b) => a[1] - b[1]);
            const [current, currentDist] = priorityQueue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);
        
            const currentPath = pathSet.get(current.name)!;
      
            for (const edge of current.edges) {
              const neighbor: Vertex = edge.dest;
              const newDist: number = currentDist + edge.weight;
              if ((!pathSet.get(neighbor.name)) || (newDist < (pathSet.get(neighbor.name)!.weight))) {
                const newPath = new Path(
                    [...currentPath.vertices],
                    [...currentPath.edges]
                );
                newPath.addVertexAndEdge(neighbor,edge);
                pathSet.set(neighbor.name,newPath);
                priorityQueue.push([neighbor, newDist]);
              }
            }
          }

        return pathSet;
    }

    DijkstraParity(source: string): parityPath{
        const evenPathSet = new Map<string, Path>();
        const oddPathSet = new Map<string, Path>();
        const evenVisited = new Set<Vertex>();
        const oddVisited = new Set<Vertex>();
        
        const evenPriorityQueue: [Vertex, number][] = [];
        const oddPriorityQueue: [Vertex, number][] = [];

        const sourceVertex = this.findVertex(source);
        if(!sourceVertex){
            console.error("Search on non-existent vertex");
            return {"even": new Map<string, Path>(), "odd": new Map<string, Path>()};
        }
        evenPathSet.set(source, new Path([sourceVertex],[]));
        evenPriorityQueue.push([sourceVertex, 0]);
        while (evenPriorityQueue.length > 0 || oddPriorityQueue.length > 0) {
            evenPriorityQueue.sort((a, b) => a[1] - b[1]);
            oddPriorityQueue.sort((a,b) => a[1] - b[1]);
            if(evenPriorityQueue.length === 0 || (oddPriorityQueue.length > 0 && oddPriorityQueue[0][1] < evenPriorityQueue[0][1])){
                const [current, currentDist] = oddPriorityQueue.shift()!;
                if (oddVisited.has(current)) continue;
                oddVisited.add(current);
                const currentPath = oddPathSet.get(current.name)!;

                for (const edge of current.edges) {
                    const neighbor: Vertex = edge.dest;
                    const newDist: number = currentDist + edge.weight;
                    if ((!evenPathSet.get(neighbor.name)) || (newDist < (evenPathSet.get(neighbor.name)!.weight))) {
                        const newPath = new Path(
                            [...currentPath.vertices],
                            [...currentPath.edges]
                        );
                        newPath.addVertexByGraph(neighbor,this);
                        evenPathSet.set(neighbor.name,newPath);
                        evenPriorityQueue.push([neighbor, newDist]);
                    }
                  }
            }else{
                const [current, currentDist] = evenPriorityQueue.shift()!;
                if (evenVisited.has(current)) continue;
                evenVisited.add(current);
                const currentPath = evenPathSet.get(current.name)!;

                for (const edge of current.edges) {
                    const neighbor: Vertex = edge.dest;
                    const newDist: number = currentDist + edge.weight;
                    if ((!oddPathSet.get(neighbor.name)) || (newDist < (oddPathSet.get(neighbor.name)!.weight))) {
                        const newPath = new Path(
                            [...currentPath.vertices],
                            [...currentPath.edges]
                        );
                        newPath.addVertexByGraph(neighbor,this);
                        oddPathSet.set(neighbor.name,newPath);
                        oddPriorityQueue.push([neighbor, newDist]);
                    }
                  }
            }
          }

        return {"even": evenPathSet, "odd": oddPathSet};
    }

    WebRecursionDijkstra(source: string): Map<string, recursingStep>{
        const dijkMap = this.Dijkstra(source);
        const result = new Map<string, recursingStep>();
        for(const [name, _] of dijkMap){
            result.set(name, {totalChildren: -1, directChildren: [], parent: "", length: 0, percentage: 0});
        }
        for(const [name, path] of dijkMap){
            result.get(name)!.length = path.weight;
            for(const v of path.vertices){
                result.get(v.name)!.totalChildren += 1;
            }
            if(path.lastStep()){
                result.get(path.lastStep()!.name)!.directChildren.push(name);
                result.get(name)!.parent = path.lastStep()!.name;
            }
        }
        for(const [_, data] of result){
            if(data.directChildren.length > 0){
                let percentages: Record<string, number> = {};
                for(const t of data.directChildren){
                    percentages[t] = result.get(t)!.totalChildren + 1;
                }
                const poweredEntries = Object.entries(percentages).map(
                    ([key, val]) => [key, Math.pow(val, 0.66)] as const
                    );
                const total = poweredEntries.reduce((sum, [, val]) => sum + val, 0);
                for(const target of data.directChildren){
                    result.get(target)!.percentage = Object.fromEntries(poweredEntries)[target] / total;
                }
            }
        }
        return result;
    }

}