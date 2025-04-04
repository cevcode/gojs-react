/**
 * Generates between minNodes and maxNodes nodes, labeled "Node X".
 * For every pair of nodes, we create between 1-5 relationship labels,
 * and store them in `relationships`.
 * Then we produce a single link object { from, to, relationships, key }.
 */
export function generateRandomGraph(minNodes: number, maxNodes: number) {
    // Calc nodes count
    const nodeCount = Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;

    // Create node
    const nodes = Array(nodeCount).fill(null).map((_, i) => ({
        key: i + 1,
        text: `Node ${i + 1}`
    }));

    // We'll store parallel link data in a dictionary, so we can "roll them up".
    type LinkDict = Record<string, { from: number; to: number; relationships: string[] }>;
    const linkDict: LinkDict = {};

    // Helper: Add one relationship label from->to
    function addRelationship(from: number, to: number, label: string) {
        const dictKey = `${from}-${to}`;
        if (!linkDict[dictKey]) {
            linkDict[dictKey] = { from, to, relationships: [] };
        }
        linkDict[dictKey].relationships.push(label);
    }

    // For each pair of distinct nodes, randomly generate 1–5 relationships
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const fromKey = i + 1;
            const toKey = j + 1;
            const relCount = Math.floor(Math.random() * 5) + 1;
            for (let k = 0; k < relCount; k++) {
                // E.g. "A", "B", "C"...
                const label = String.fromCharCode(65 + k);
                addRelationship(fromKey, toKey, label);
            }
        }
    }

    // Convert linkDict to an array, assign each link a unique key
    const links = Object.values(linkDict).map((item, idx) => ({
        key: `link-${idx}`, // UNIQUE link key
        from: item.from,
        to: item.to,
        relationships: item.relationships
    }));

    return { nodes, links };
}
