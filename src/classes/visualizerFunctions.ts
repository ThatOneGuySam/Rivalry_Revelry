import Graph from "graphology";
import { makeOriginalWeb } from "../data/rivalryWeb";
import { recursingStep } from "../classes/graph";

type StringToStringDictionary = {
    [key: string]: string;
  };

  export type nodeAttributes = {
    x: number;
    y: number;
    label: string;
    color: string;
    size: number;
    image: string;
  };

  export type edgeAttributes = {
    sourceTeam: string,
    destTeam: string,
    color: string,
    size: number,
  };

  export type advancedEdgeAttributes = {
    sourceTeam: string,
    destTeam: string,
    sourceTeamImage: string,
    destTeamImage: string,
  }

const colorByConference: StringToStringDictionary = {
    SEC: "red",
    B10: "blue",
    B12: "green",
    ACC: "purple",
    MW: "yellow",
    Sunbelt: "orange",
    MAC: "olive",
    PAC2: "pink",
    Ind: "gray",
    CUSA: "teal",
    AAC: "black",
  };

  function getColor(conf: string) {
      try {
        const c = colorByConference[conf];
        return c;
      } catch (error) {
        return "white";
      }
    }

    function canyonSort(sortKey: Map<string, recursingStep>, values: string[]) {
        const newValues: string[] = [];
        const sortedValues = [...values].sort(
          (a, b) => sortKey.get(a)!.totalChildren - sortKey.get(b)!.totalChildren
        );
        for (let i = 0; i < sortedValues.length; i++) {
          if (i % 2 === 0) {
            newValues.unshift(sortedValues[i]);
          } else {
            newValues.push(sortedValues[i]);
          }
        }
        return newValues;
      }

      export function initialPositionTeamCentered(teamName: string): Graph {
          const initialRivalryWeb = new Graph();
          const givenWeb = makeOriginalWeb();
          const recursivePathSet: Map<string, recursingStep> =
            givenWeb.WebRecursionDijkstra(teamName);
          const teamsDials = new Map<string, [number, number, number]>();
          //add highlights
          /*
          initialRivalryWeb.addNode("primaryHighlight", {
            x: 0,
            y: 0,
            color: "rgba(200,200,0,0.8)",
            size: 25,
          });
          */
          //deal with initial node first
          initialRivalryWeb.addNode(teamName, {
            x: 0,
            y: 0,
            label: teamName,
            color: getColor(givenWeb.findVertex(teamName)!.conference),
            size: 20,
            image: givenWeb.findVertex(teamName)!.logoPath(),
          });
          
          teamsDials.set(teamName, [-1 * Math.PI, -1 * Math.PI, Math.PI]);
          const teamQueue: string[] = canyonSort(
            recursivePathSet,
            recursivePathSet.get(teamName)!.directChildren
          );
          while (teamQueue.length > 0) {
            const currNode: string = teamQueue.shift()!;
            const currInfo: recursingStep = recursivePathSet.get(currNode)!;
            //Find its field
            const ticks = teamsDials.get(currInfo.parent)!;
            const percentageOfParent = currInfo.percentage;
            const leftTick = ticks[1];
            const rightTick = ticks[1] + (ticks[2] - ticks[0]) * percentageOfParent;
            //set dials to new positions
            teamsDials.set(currNode, [leftTick, leftTick, rightTick]);
            teamsDials.set(currInfo.parent, [ticks[0], rightTick, ticks[2]]);
            //Place Node
            const midTick = (leftTick + rightTick) / 2;
            const currentX = Math.cos(midTick) * (currInfo.length * 35);
            const currentY = Math.sin(midTick) * (currInfo.length * 35);
            initialRivalryWeb.addNode(currNode, {
              x: currentX,
              y: currentY,
              label: currNode,
              color: getColor(givenWeb.findVertex(currNode)!.conference),
              size: 20,
              image: givenWeb.findVertex(currNode)!.logoPath(),
            });
            initialRivalryWeb.addDirectedEdge(currInfo.parent, currNode, {
              color: "rgba(200,50,50,0.9)",
              size: "2.5",
              sourceTeam: currInfo.parent,
              destTeam: currNode
            });
            //Add it's children to queue
            teamQueue.push(...canyonSort(recursivePathSet, currInfo.directChildren));
          }
          for (const e of givenWeb.edges) {
            if (!initialRivalryWeb.hasEdge(e.source.name, e.dest.name)) {
              initialRivalryWeb.addDirectedEdge(e.source.name, e.dest.name, {
                color: "rgba(50,50,50,0.25)",
                size: "1",
                sourceTeam: e.source.name,
                destTeam: e.dest.name,
              });
            }
          }
          return initialRivalryWeb;
        }

        export function getNodePositions(
            teamName: string
          ): Map<string, { x: number; y: number; children: string[] }> {
            const result = new Map<
              string,
              { x: number; y: number; children: string[] }
            >();
            const givenWeb = makeOriginalWeb();
            const recursivePathSet: Map<string, recursingStep> =
              givenWeb.WebRecursionDijkstra(teamName);
            const teamsDials = new Map<string, [number, number, number]>();
            //deal with initial node first
            result.set(teamName, { x: 0, y: 0, children: [] });
        
            teamsDials.set(teamName, [-1 * Math.PI, -1 * Math.PI, Math.PI]);
            const teamQueue: string[] = canyonSort(
              recursivePathSet,
              recursivePathSet.get(teamName)!.directChildren
            );
            while (teamQueue.length > 0) {
              const currNode: string = teamQueue.shift()!;
              const currInfo: recursingStep = recursivePathSet.get(currNode)!;
              //Find its field
              const ticks = teamsDials.get(currInfo.parent)!;
              const percentageOfParent = currInfo.percentage;
              const leftTick = ticks[1];
              const rightTick = ticks[1] + (ticks[2] - ticks[0]) * percentageOfParent;
              //set dials to new positions
              teamsDials.set(currNode, [leftTick, leftTick, rightTick]);
              teamsDials.set(currInfo.parent, [ticks[0], rightTick, ticks[2]]);
              //Place Node
              const midTick = (leftTick + rightTick) / 2;
              const currentX = Math.cos(midTick) * (currInfo.length * 25);
              const currentY = Math.sin(midTick) * (currInfo.length * 25);
              result.set(currNode, { x: currentX, y: currentY, children: [] });
              result.get(currInfo.parent)!.children.push(currNode);
              //Add it's children to queue
              teamQueue.push(...canyonSort(recursivePathSet, currInfo.directChildren));
            }
            return result;
          }