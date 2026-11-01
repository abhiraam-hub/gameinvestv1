// Quick test script for AI Mystery Room API endpoints
async function testAPI() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('Testing Health Endpoint...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  console.log('Health:', await healthRes.json());

  console.log('\nTesting POST /api/cases (Easy)...');
  const createRes = await fetch(`${BASE_URL}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      premise: 'A priceless emerald necklace was stolen from Lady Harrington penthouse during a blackout.',
      difficulty: 'Easy'
    })
  });
  const createData = await createRes.json();
  console.log('Created Case status:', createRes.status);
  console.log('Case Title:', createData.case.title);
  console.log('Suspects count:', createData.case.suspects.length);
  console.log('Clues count:', createData.case.clues.length);
  console.log('Hints count:', createData.case.hints.length);
  console.log('Has solution leaked?', 'solution' in createData.case);
  console.log('Has isCulprit leaked in suspects?', createData.case.suspects.some(s => 'isCulprit' in s));

  const caseId = createData.case._id;
  const firstClueId = createData.case.clues[0].id;
  const firstSuspectId = createData.case.suspects[0].id;

  console.log(`\nTesting GET /api/cases/${caseId}...`);
  const getRes = await fetch(`${BASE_URL}/cases/${caseId}`);
  const getData = await getRes.json();
  console.log('GET status:', getRes.status);
  console.log('Has solution leaked in GET?', 'solution' in getData.case);

  console.log(`\nTesting POST /api/cases/${caseId}/clues/${firstClueId}/discover...`);
  const clueRes = await fetch(`${BASE_URL}/cases/${caseId}/clues/${firstClueId}/discover`, {
    method: 'POST'
  });
  const clueData = await clueRes.json();
  console.log('Clue Discover status:', clueRes.status);
  console.log('Message:', clueData.message);
  console.log('Player progress after clue:', clueData.playerProgress);

  console.log(`\nTesting POST /api/cases/${caseId}/hints...`);
  const hintRes = await fetch(`${BASE_URL}/cases/${caseId}/hints`, {
    method: 'POST'
  });
  const hintData = await hintRes.json();
  console.log('Hint status:', hintRes.status);
  console.log('Message:', hintData.message);
  console.log('Player progress after hint:', hintData.playerProgress);

  console.log(`\nTesting POST /api/cases/${caseId}/accuse (accusing ${firstSuspectId})...`);
  const accuseRes = await fetch(`${BASE_URL}/cases/${caseId}/accuse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suspectId: firstSuspectId })
  });
  const accuseData = await accuseRes.json();
  console.log('Accusation status:', accuseRes.status);
  console.log('Accusation verdict:', accuseData.verdict);

  console.log(`\nTesting GET /api/cases/${caseId}/result...`);
  const resultRes = await fetch(`${BASE_URL}/cases/${caseId}/result`);
  const resultData = await resultRes.json();
  console.log('Result status:', resultRes.status);
  console.log('Solution explanation present:', Boolean(resultData.result.solution?.explanation));
  console.log('Final Score:', resultData.result.playerProgress.score);
  console.log('All tests finished successfully!');
}

testAPI().catch(console.error);
