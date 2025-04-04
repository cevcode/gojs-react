import {useEffect, useState} from "react";
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { generateRandomGraph } from './helpers/generateRandomGraph';
import './App.css';

// Diagram initialization
const initDiagram = (): go.Diagram => {
    const $ = go.GraphObject.make;
    const diagram = new go.Diagram({
        'undoManager.isEnabled': true,
        model: new go.GraphLinksModel({
            linkKeyProperty: 'key', // unique key on each link data
        })
    });

    // Node template
    diagram.nodeTemplate = $(
        go.Node,
        'Auto',
        { locationSpot: go.Spot.Center },
        $(go.Shape, 'RoundedRectangle', { fill: 'white', stroke: 'gray', strokeWidth: 2 }),
        $(go.TextBlock, { margin: 8 }, new go.Binding('text'))
    );

    // Link template
    diagram.linkTemplate = $(
        go.Link,
        {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.None,
            corner: 10
        },
        // link shape
        $(go.Shape, { strokeWidth: 2, stroke: 'gray' }),
        // arrow at "to" end
        $(go.Shape, { toArrow: 'Standard', stroke: null, fill: 'gray' }),

        // If exactly one relationship, show it in a small label
        $(
            go.Panel,
            'Auto',
            new go.Binding('visible', 'relationships', (relations: string[]) => relations.length === 1),
            $(go.Shape, 'RoundedRectangle', { fill: '#DEE3E7', stroke: null }),
            $(
                go.TextBlock,
                { margin: 4 },
                new go.Binding('text', 'relationships', (relations: string[]) => relations[0])
            )
        ),

        // If multiple relationships, show a circle with the count and a tooltip
        $(
            go.Panel,
            'Spot',
            new go.Binding('visible', 'relationships', (relations: string[]) => relations.length > 1),
            $(go.Shape, 'Circle', {
                fill: 'blue',
                stroke: null,
                desiredSize: new go.Size(30, 30)
            }),
            // The count text
            $(
                go.TextBlock,
                { stroke: 'white', font: 'bold 12pt sans-serif' },
                new go.Binding('text', 'relationships', (rels: string[]) => String(rels.length))
            ),
            {
                // Render Tooltip on hover
                toolTip: $(
                    go.Adornment,
                    'Auto',
                    $(go.Shape, { fill: '#EFF4F8' }),
                    $(
                        go.Panel,
                        'Vertical',
                        { margin: 5 },
                        // From Node name
                        $(
                            go.TextBlock,
                            { font: 'bold 12px sans-serif', stroke: '#333' },
                            new go.Binding('text', '', (linkData: any, obj: go.GraphObject) => {
                                if (!linkData) return '';

                                const diagram = obj.diagram;
                                const fromNode = diagram?.findNodeForKey(linkData.from);
                                return fromNode ? fromNode.data.text : '';
                            })
                        ),
                       // All the links, separated by commas
                        $(
                            go.TextBlock,
                            { stroke: '#333', margin: new go.Margin(5, 0, 5, 0) },
                            new go.Binding('text', 'relationships', (relations: string[]) => relations.join(', '))
                        ),
                        // To Node name
                        $(
                            go.TextBlock,
                            { font: 'bold 12px sans-serif', stroke: '#333' },
                            new go.Binding('text', '', (linkData: any, obj: go.GraphObject) => {
                                if (!linkData) return '';

                                const diagram = obj.diagram;
                                const toNode = diagram?.findNodeForKey(linkData.to);
                                return toNode ? toNode.data.text : '';
                            })

                        )
                    )
                )
            }
        )
    );

    // Layout for more spacing
    diagram.layout = $(go.ForceDirectedLayout, {
        defaultSpringLength: 150,  // spacing between nodes
        defaultElectricalCharge: 50 // repulsion between nodes
    });

    return diagram;
}

const App = () => {
    const [nodeDataArray, setNodeDataArray] = useState<go.ObjectData[]>([]);
    const [linkDataArray, setLinkDataArray] = useState<go.ObjectData[]>([]);

    useEffect(() => {
        // Initialize the diagram
        prepareGraphData();
    }, []);

    const prepareGraphData = () => {
        // Generate a random set of nodes & rolled-up links (2–4 nodes, 1–5 relationships/pair)
        const { nodes, links } = generateRandomGraph(2, 4);
        setNodeDataArray(nodes);
        setLinkDataArray(links);
    }

    return (
        <div className="app">
            <ReactDiagram
                initDiagram={initDiagram}
                divClassName="diagram"
                nodeDataArray={nodeDataArray}
                linkDataArray={linkDataArray}
            />
            <div className="footer">
                <button className="button" onClick={prepareGraphData}>Refresh</button>
            </div>
        </div>
    );
};

export default App;
