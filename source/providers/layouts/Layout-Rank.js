/**
 * Layout-Rank
 *
 * Shared cycle-tolerant topological ranking for the directed layouts
 * (Layered, Staggered).
 *
 * Plain Kahn's topological sort drops every node that participates in a cycle
 * into a single trailing rank. Any graph with back-edges (workflows, state
 * machines: rejections, retries, "send back") therefore collapses into one
 * tall stripe of unranked nodes, which is the historical "auto-layout bunches
 * everything together and is useless" behavior.
 *
 * `toRanks` instead breaks each cycle at its most-resolved node: when a round
 * finds nothing dependency-free but nodes remain, it forces the unassigned
 * node with the fewest unmet predecessors into the next rank and continues.
 * Cyclic graphs then rank left to right the same way a DAG does.
 *
 * Returns an array of ranks; each rank is an array of node Hashes in stable
 * source order. Self-loops are ignored for ranking (they cannot define an
 * order). Callers map Hashes back to node objects themselves.
 */
function toRanks(pNodes, pConnections)
{
	let tmpRanks = [];
	if (!pNodes || pNodes.length === 0)
	{
		return tmpRanks;
	}

	let tmpConnections = Array.isArray(pConnections) ? pConnections : [];

	let tmpInDegree = {};
	let tmpOutEdges = {};
	for (let i = 0; i < pNodes.length; i++)
	{
		tmpInDegree[pNodes[i].Hash] = 0;
		tmpOutEdges[pNodes[i].Hash] = [];
	}

	for (let i = 0; i < tmpConnections.length; i++)
	{
		let tmpConn = tmpConnections[i];
		// A self-loop cannot define a rank order; skip it.
		if (tmpConn.SourceNodeHash === tmpConn.TargetNodeHash)
		{
			continue;
		}
		if (tmpInDegree.hasOwnProperty(tmpConn.TargetNodeHash))
		{
			tmpInDegree[tmpConn.TargetNodeHash]++;
		}
		if (tmpOutEdges.hasOwnProperty(tmpConn.SourceNodeHash))
		{
			tmpOutEdges[tmpConn.SourceNodeHash].push(tmpConn.TargetNodeHash);
		}
	}

	let tmpAssigned = {};
	let tmpAssignedCount = 0;

	while (tmpAssignedCount < pNodes.length)
	{
		let tmpRank = [];

		for (let i = 0; i < pNodes.length; i++)
		{
			let tmpHash = pNodes[i].Hash;
			if (!tmpAssigned[tmpHash] && tmpInDegree[tmpHash] <= 0)
			{
				tmpRank.push(tmpHash);
			}
		}

		if (tmpRank.length === 0)
		{
			// Cycle break: nothing is dependency-free, so force the unassigned
			// node with the fewest remaining predecessors (ties keep source
			// order, which keeps the result stable across runs).
			let tmpMinDegree = Infinity;
			let tmpPick = null;
			for (let i = 0; i < pNodes.length; i++)
			{
				let tmpHash = pNodes[i].Hash;
				if (!tmpAssigned[tmpHash] && tmpInDegree[tmpHash] < tmpMinDegree)
				{
					tmpMinDegree = tmpInDegree[tmpHash];
					tmpPick = tmpHash;
				}
			}
			if (tmpPick === null)
			{
				break; // safety; every node is already assigned
			}
			tmpRank.push(tmpPick);
		}

		// Commit the whole rank, then relax its out-edges so the next round
		// sees the successors it just freed.
		for (let i = 0; i < tmpRank.length; i++)
		{
			tmpAssigned[tmpRank[i]] = true;
			tmpAssignedCount++;
		}
		for (let i = 0; i < tmpRank.length; i++)
		{
			let tmpEdges = tmpOutEdges[tmpRank[i]] || [];
			for (let j = 0; j < tmpEdges.length; j++)
			{
				tmpInDegree[tmpEdges[j]]--;
			}
		}

		tmpRanks.push(tmpRank);
	}

	return tmpRanks;
}

/**
 * Flatten ranks to a single ordered list of node Hashes (rank by rank, source
 * order within a rank). Convenience for layouts that walk one sequence.
 */
function toOrder(pNodes, pConnections)
{
	let tmpRanks = toRanks(pNodes, pConnections);
	let tmpOrder = [];
	for (let i = 0; i < tmpRanks.length; i++)
	{
		for (let j = 0; j < tmpRanks[i].length; j++)
		{
			tmpOrder.push(tmpRanks[i][j]);
		}
	}
	return tmpOrder;
}

module.exports =
{
	toRanks: toRanks,
	toOrder: toOrder
};
