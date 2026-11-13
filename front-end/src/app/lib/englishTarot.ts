import type {TarotCard} from "../data/tarotCards.ts";
import {detectReadingTopic,type ReadingTopic} from "./readingIntelligence.ts";
/** Independently authored concise English reflection texts for all 78 RWS cards. */
const major:[string,string][]=[
["A fresh start invites curiosity and mindful courage.","A rushed leap or unclear plan deserves a second look."],
["Your existing skills and resources can support purposeful action.","Scattered attention or misuse of influence can undermine progress."],
["Listen closely and notice what is not yet being said.","Hidden assumptions or ignored intuition may need patient examination."],
["Care, creativity and steady growth deserve space.","Overgiving or neglecting your own needs can exhaust your resources."],
["Clear structure and responsible leadership can provide stability.","Rigid control may prevent flexibility and collaboration."],
["Tradition, mentorship and shared values can guide learning.","Unquestioned rules may need to be reconsidered thoughtfully."],
["A meaningful choice asks you to align relationships with values.","Conflicting priorities or avoidance may be straining connection."],
["Discipline and direction help move a plan forward.","Competing impulses or loss of control may call for a reset."],
["Quiet courage, patience and compassion are sources of strength.","Self-doubt or frustration may need gentler handling."],
["Solitude and reflection can bring deeper understanding.","Isolation or reluctance to ask for help may limit perspective."],
["Circumstances change; adapt without assuming the outcome is fixed.","Resistance to change or unstable routines may be draining."],
["Fairness, evidence and accountability support sound decisions.","Bias or incomplete information can distort judgement."],
["Pause and try an unfamiliar perspective before acting.","Feeling stuck may signal a need to release an old assumption."],
["An ending can make room for necessary transformation.","Holding tightly to an expired pattern may prolong difficulty."],
["Moderation and patient integration can restore balance.","Excess or competing priorities may require a steadier rhythm."],
["Notice attachments and habits that restrict choice.","Naming a harmful pattern can be the first step toward freedom."],
["A sudden disruption can reveal what needs rebuilding.","Avoiding a hard truth may make instability last longer."],
["Hope, generosity and recovery can grow through small actions.","Discouragement may ease when expectations become realistic."],
["Uncertainty calls for patience and checking your perceptions.","Fear or confusion may lessen with clear information."],
["Clarity, warmth and honest celebration can encourage growth.","Overconfidence or forced optimism may hide important details."],
["Review past choices and consider a constructive new chapter.","Harsh self-judgement or delay may prevent progress."],
["Completion and integration deserve recognition.","Unfinished details may need attention before moving on."]
];
const suits:Record<string,[string,string][]>={
  Wands:[
    ["Creative energy and a promising initiative are emerging.","A blocked idea may need focus before action."],
    ["Look ahead and choose a direction thoughtfully.","Hesitation or narrow planning may limit options."],
    ["Early efforts are moving toward a wider horizon.","Delays invite a review of expectations."],
    ["Shared success and a stable foundation deserve celebration.","Unresolved tension may affect group harmony."],
    ["Healthy debate can reveal new ideas.","Unproductive conflict may be consuming energy."],
    ["Recognition follows effort and visible contribution.","External approval may not equal genuine progress."],
    ["Stand up for your position with reasonable boundaries.","Defensiveness or fatigue may obscure the next step."],
    ["Momentum and new information call for clear priorities.","Haste or interruptions can affect decisions."],
    ["Resilience and boundaries protect long-term work.","Overguarding yourself can become exhausting."],
    ["Many responsibilities need prioritization and delegation.","An overloaded schedule needs a more realistic balance."],
    ["Stay curious about a promising creative experiment.","Inconsistency may prevent an idea from developing."],
    ["Bold movement can create opportunities.","Impulsiveness may need discipline and follow-through."],
    ["Confident encouragement helps others act.","Dominance or self-doubt can disrupt collaboration."],
    ["Purposeful leadership gives a project direction.","Rushed authority or rigid control can backfire."]
  ],
  Cups:[
    ["Emotional openness and compassion create new connection.","Unexpressed feelings may need gentle attention."],
    ["Mutual understanding and reciprocity strengthen bonds.","Misalignment or uneven effort deserves conversation."],
    ["Friendship and shared joy support belonging.","Social pressure or excess may obscure authenticity."],
    ["Pause to reassess your emotional needs.","Disengagement may hide an overlooked possibility."],
    ["Grief and disappointment are part of processing change.","Perspective may return as regret is acknowledged."],
    ["Memories and kindness can be meaningful resources.","Idealizing the past may prevent present growth."],
    ["Many possibilities call for grounded priorities.","Confusion may clear when fantasies meet facts."],
    ["Leaving an unfulfilling situation may invite growth.","Avoiding a hard departure can prolong stagnation."],
    ["Appreciate meaningful satisfaction without excess.","Restlessness may indicate deeper unmet needs."],
    ["Connection and shared wellbeing matter more than appearances.","Idealized expectations can create relationship pressure."],
    ["A curious, gentle message may open dialogue.","Emotional immaturity or uncertainty needs patience."],
    ["Approach feelings with creativity and consideration.","Romantic idealization may overlook practical realities."],
    ["Empathy and calm listening can help others feel seen.","Emotional overload may require firmer boundaries."],
    ["Mature compassion balances feelings with judgement.","Avoidance or emotional manipulation needs honest limits."]
  ],
  Swords:[
    ["Clear thinking can cut through uncertainty.","Sharp words or rigid certainty may cause harm."],
    ["A difficult choice calls for better information.","Avoidance may keep a decision unresolved."],
    ["Painful truths deserve care and support.","Healing may start when grief is acknowledged."],
    ["Rest and reflection can restore mental clarity.","Constant rumination can delay recovery."],
    ["Winning an argument may still cost trust.","Repairing conflict may matter more than being right."],
    ["A gradual transition can lead toward calmer conditions.","Old concerns may complicate the move forward."],
    ["Strategy and discretion are useful when rooted in integrity.","Secrecy or self-deception can undermine trust."],
    ["Notice limiting beliefs and seek practical options.","Asking for help can loosen mental constraints."],
    ["Anxiety deserves compassion and grounded support.","Perspective and support may ease spiraling worries."],
    ["A difficult cycle may be reaching its limit.","Rebuilding after a setback takes patience."],
    ["Curiosity and honest observation reveal details.","Rumors or rushed conclusions can mislead."],
    ["Direct action and strong reasoning can move a problem.","Impatience or aggressive communication may damage progress."],
    ["Independent judgement and boundaries protect clarity.","Excessive criticism may close needed dialogue."],
    ["Fair decisions rely on evidence and accountability.","Emotional distance or harsh certainty may alienate others."]
  ],
  Pentacles:[
    ["A practical opportunity invites careful planning.","Neglected resources or unrealistic expectations need review."],
    ["Balance competing responsibilities with flexible routines.","Overcommitment can destabilize everyday life."],
    ["Skill-building and collaboration improve quality.","Lack of coordination can waste effort."],
    ["Stability matters, but so does room to grow.","Clinging too tightly to resources may restrict choices."],
    ["Material stress may call for support and a clear budget.","Recovery begins by noticing available help."],
    ["Generosity and fair exchange build mutual trust.","Unequal giving or hidden obligations deserve boundaries."],
    ["Patient evaluation can show whether effort is paying off.","Restlessness may tempt premature decisions."],
    ["Consistent practice improves mastery over time.","Perfectionism can slow useful progress."],
    ["Independent competence and sustainable comforts matter.","Isolation or excess spending may need balance."],
    ["Long-term security grows through shared planning.","Inherited expectations may clash with personal needs."],
    ["Small practical lessons build reliable foundations.","A scattered approach can delay skill development."],
    ["Steady habits and follow-through support results.","Rigid routine may need thoughtful adjustment."],
    ["Practical care and resourcefulness create stability.","Overwork or controlling habits may drain wellbeing."],
    ["Responsible stewardship helps long-term projects thrive.","Short-term fixation on status may undermine stability."]
  ]
};
export function englishCardMeaning(card:TarotCard,reversed=false):string{
  const pair=card.arcana==="major"?major[card.id]:suits[card.suit||""]?.[card.id-22-["Wands","Cups","Swords","Pentacles"].indexOf(card.suit||"")*14];
  return pair?.[reversed?1:0]||"Reflect on the card's imagery, context and your own circumstances.";
}
const EN_REFLECTIONS:Record<ReadingTopic,string>={
  general:"What can you verify in real life, and what is one constructive next step?",
  love:"Which feeling or boundary deserves a respectful conversation? What can you check rather than assume?",
  career:"Which skill or practical evidence would help your next work decision? Choose one measurable action.",
  growth:"What small habit could you practice this week, and how will you notice progress?",
};
export function englishReading(cards:readonly {card:TarotCard;isReversed:boolean;position:number;positionName:string}[],question="",chosenTopic?:ReadingTopic):string{
  const parts=["Tarot is a symbolic reflection practice, not a scientific prediction."];
  if(question.trim())parts.push("Your question: "+question.trim().slice(0,300));
  for(const entry of cards){
    parts.push("Position "+entry.position+": "+entry.card.englishName+" — "+(entry.isReversed?"Reversed":"Upright")+
      "\n"+englishCardMeaning(entry.card,entry.isReversed));
  }
  if(cards.length>1){
    const suitsPresent=[...new Set(cards.map(entry=>entry.card.suit).filter(Boolean))];
    parts.push("Across the cards: compare how "+(suitsPresent.length?suitsPresent.join(", "):"the Major Arcana")+
      " relate to your question. Look for tensions and shared themes before deciding what to do.");
  }
  const topic=chosenTopic??detectReadingTopic(question);
  parts.push("Reflection: "+EN_REFLECTIONS[topic]);
  return parts.join("\n\n");
}
