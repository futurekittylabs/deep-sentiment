# Deep Deciding
> Collaborators: dionysuz.eth, Devansh Mehta

## Motivation
Many ideas within the Ethereum ecosystem, specifically Ethereum upgrades require deep deliberation before coming to social consensus on a decision. Some examples of contentious EIPs / ideas that require particularly deep deliberation include:

- EOF
- FOCIL
- Changing the issuance curve

For Ethereum to successfully reach its goal, we must make high quality decisions quickly. The motivation of this experiment is to accelerate a specific idea to its terminus: modifying the issuance curve.

## The idea (DRAFT – IN PROGRESS)
This section includes the idea. If you are helping/reviewing, this section is the working area for the mechanism design.

Devansh's idea:

- We start with a question, the only answers are yes/no. Example: "Should we implement EOF?"
- A curated group of experts collects all the for and against propositions. A proposition is a character-limited reason string, with an optional image, and a required type "for" or "against".
  - Example 1: {type: "for", "reason": "EOF improves the effectiveness of security analysis tools", "image": null}
  - Example 2: {type: "against", "reason": "EOF is a distraction from a bigger VM change like RISC-V", "image": null}
- The target node is the question, and the child nodes (only a two-level tree) are the propositions. The edges between each proposition and the target node represent the score.
- A curated group of jurors are given a sequence of randomized proposition pairs, and select which they agree with more and by what multiplier, this fills out the edge of the graph 
- The score represents the **relative agreement** of a proposition to the question; relative to the agreement of all other propositions. Scores use Deep Funding’s pairwise-multiplier method: from juror comparisons like “I agree with A 2× more than B” we infer a latent score for each proposition, then normalize them so all scores sum to 1.
- An open group of AI models compete for solving the rest of the edges, the winning model is the one that minimizes the error against the juror selected edges.
- A prediction market will exist for each proposition, where traders can predict the score (relative agreement) of each proposition. AI models that feel confident in their implementation can of course arbitrage / make money on markets, which should be truth resolving.
- Only the top 128 propositions by score will be selected, but anyone can propose a new proposition with a bond. If it doesn't achieve the top 128 the bond is slashed. This allows the opportunity for new propositions to come in and exhaust the solution space.

Additional notes from Dionysuz:

- We'll integrate with opengraph social cards so that people can easily participate in this system embedded inside of X and Farcaster
- Is there an issue with pairwise comparisons? For example comparing two "for" comparisons feels easier than comparing a "for" versus an "against" because the multiplier grows too large to where it may become inaccurate.
- What is the incentive mechanism to get high quality jury decisions and seed propositions?
- Is "For" and "Against" score in a majority sense correct, or can we fold in the Polis algorithm which maps jurors into groups (we can also label groups like client team A, B, C; institutional staker; home node operator, etc. or use some type of attestations)
- How do we handle privacy? Do we integrate with ENS? Should people be able to vote on AI models that are publicly trading (if they see the market size getting traded on an edge from reallygoodmodel.eth, more people can vote on it)
- Do we even need a "for" / "against" field because it may make the axis of comparison more difficult cognitively and harder to get a multiplier, on the other hand if we remove it then it becomes less tractable for resolving a decision market; and we end up creating is more of a "sentiment finder" (and another mechanism can interpret sentiment and turn it into a decision). This would mean we can reframe the target mode from being an explicit question, to a general topic.

## Social feed signal management
It's important to tap into the liquidity of cognition that exists on X / Farcaster / Discord / Forums. We need people to easily propagate their signal and participate in the system without creating a whole new silo'd island with no liquidity.

We will use opengraph.

## Signal propagation tools
Signal propagation tools listed here are used by cognitive actors to express high quality signals on how they feel about the issuance curve:

**Polis-style yes/no/skip over character restricted statements**
This propagation tool is taken from the Polis project. Here is an image example:

![image](https://hackmd.io/_uploads/Sy55pKRgZl.png)

**Multiplier comparisons**
This tool is taken from the Deep Funding project. It takes two items and an expert compares them, and selects a multiplier between them:

![image](https://hackmd.io/_uploads/Byke0YAlZl.png)

## Signal interpretation tools
Signal interpretation tools are interfaces that allow some actor (individual or collective) to interpret signals and apply some algorithm to it which produces an action.

A simple example would help:

![image](https://hackmd.io/_uploads/ryD26FAxbl.png)

The above tool demonstrates computes a score that rank statements highest when they have both high support and similarity across groups.

Other examples include:
- Sort the list of statements by number of votes in favor of.

It seems that while we can use different tools such as color coded diagrams, etc., that these cannot be measured algorithmically as a selection mechanism. They can be used by agents to interpret data but it feels difficult to “put it in code”.

## Seed comments
- Deciding to change or ossify the current issuance curve is an important issue.
- Deciding to change or ossify the current issuance curve is more important than X issue by Y multiplier.
- Issuance is something that will never ossify in terms of proposals, because researchers will base their PhDs off of coming up with new designs. What we can come up with is an adjustment, and agree to that; while accepting that tweaks in the future will always come and we can reject those.
