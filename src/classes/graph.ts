function calculateWeight(strength: number): number{
    /* Function used to convert rivalry strength on a scale of 1 to 10 to weight on web*/
    const upper = 1.95; // U
    const lower = 1.0; // L
    const k = 0.7;     // steepness
    const x0 = 5;      // inflection point
  
    return lower + (upper - lower) / (1 + Math.exp(k * (strength - x0)));
  }

export class Vertex{
    conference: string;
    name: string;
    edges: Edge[];

    constructor(name: string, conference: string){
        this.name = name;
        this.conference = conference;
        this.edges = [];
    }

    addEdge(e: Edge): void{
        this.edges.push(e);
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

    addVertexByName(n: string, c: string): void{
        this.vertices.push(new Vertex(n, c))
    }

    addConference(conference: string, names: string[]){
        names.forEach((ne) => this.addVertexByName(ne, conference));
    }

    makeEdge(from: Vertex, to: Vertex, strength: number): void{
        //Add edge into system
        this.edges.push(new Edge(from, to, strength));
    }

    allEdgesForName(name: string, dests: string[], strengths: number[]){
        const v: Vertex | undefined = this.findVertex(name);
        const maxStrength: number = Math.max(...strengths);
        if(!v){
            console.error("Attempted to add edges to non existent vertex");
            return;
        }
        for(let i = 0; i < dests.length; i++){
            const d: Vertex | undefined = this.findVertex(dests[i]);
            if(!d){
                console.error("Attempted to direct edge to non existent vertex");
                continue;
            }
            this.makeEdge(v, d, (10*strengths[i]/maxStrength));
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
}