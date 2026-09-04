import { calculateConsensus } from '../consensus';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export function runConsensusTests() {
  console.log('Running consensus tests...');

  // 1. Single Unanimous Winner (100% agreement on burger)
  const res1 = calculateConsensus([
    { participant_id: 'p1', selected_categories: ['burger', 'shawarma'] },
    { participant_id: 'p2', selected_categories: ['burger', 'pizza'] },
    { participant_id: 'p3', selected_categories: ['burger', 'broast'] },
  ]);
  assert(res1.status === 'UNANIMOUS_MATCH', 'Should be UNANIMOUS_MATCH');
  assert(res1.winner === 'burger', 'Winner should be burger');
  assert(res1.tally['burger'] === 3, 'Burger should have 3 votes');

  // 2. Unanimous Tie (100% agreement on multiple categories)
  const res2 = calculateConsensus([
    { participant_id: 'p1', selected_categories: ['burger', 'shawarma'] },
    { participant_id: 'p2', selected_categories: ['burger', 'shawarma'] },
  ]);
  assert(res2.status === 'UNANIMOUS_TIE', 'Should be UNANIMOUS_TIE');
  assert(Boolean(res2.tiedCategories?.includes('burger') && res2.tiedCategories?.includes('shawarma')), 'Tied categories should include burger and shawarma');

  // 3. Wildcard flexible vote distribution
  // p1 voted burger, p2 voted flexible -> flexible distributes to burger (100% agreement!)
  const res3 = calculateConsensus([
    { participant_id: 'p1', selected_categories: ['burger', 'pizza'] },
    { participant_id: 'p2', selected_categories: ['flexible', 'shawarma'] },
  ]);
  // directlyVoted = burger, pizza, shawarma
  // p1 voted: burger, pizza
  // p2 voted: shawarma, and via flexible: burger, pizza, shawarma
  // tally: burger: 2 (100%), pizza: 2 (100%), shawarma: 1 (50%)
  // burger & pizza are at 100% -> UNANIMOUS_TIE
  assert(res3.status === 'UNANIMOUS_TIE', 'Flexible should distribute to burger and pizza');
  assert(Boolean(res3.tiedCategories?.includes('burger') && res3.tiedCategories?.includes('pizza')), 'Burger and pizza should tie at 100%');

  // 4. Contenders Found (>= 60%)
  // 5 participants: shawarma has 3 votes (60%), burger has 2 (40%)
  const res4 = calculateConsensus([
    { participant_id: 'p1', selected_categories: ['shawarma', 'grill'] },
    { participant_id: 'p2', selected_categories: ['shawarma', 'rice'] },
    { participant_id: 'p3', selected_categories: ['shawarma', 'sushi'] },
    { participant_id: 'p4', selected_categories: ['burger', 'pizza'] },
    { participant_id: 'p5', selected_categories: ['burger', 'italian'] },
  ]);
  assert(res4.status === 'CONTENDERS_FOUND', 'Should find contenders >= 60%');
  assert(res4.topCategories?.[0].id === 'shawarma', 'Shawarma should be top contender');
  assert(res4.topCategories?.[0].percentage === 0.6, 'Shawarma percentage should be 60%');

  // 5. No consensus (< 60%)
  const res5 = calculateConsensus([
    { participant_id: 'p1', selected_categories: ['shawarma', 'grill'] },
    { participant_id: 'p2', selected_categories: ['burger', 'rice'] },
    { participant_id: 'p3', selected_categories: ['pizza', 'sushi'] },
  ]);
  assert(res5.status === 'NO_CONSENSUS', 'Should be NO_CONSENSUS when all votes are scattered');

  console.log('✓ All consensus test cases passed successfully!');
}

runConsensusTests();
