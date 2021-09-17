const rcRaceHtml = `
  <div class="selectionContest">
    <h2 id="contest_{CONTEST_INDEX}" class="contestName" tabindex="0">
      {CONTEST_NAME}<br>{CONTEST_SUBTITLE}
      <p class="votingInstructions">{VOTING_INSTRUCTIONS}</p>
    </h2>    
    <table class="table">
      <tr class="row header">
          <th scope="col" class="cell">Candidate</th> 
          {RANKS}
      </tr>
      {CANDIDATES}
    </table>
  </div>
` 
const rRaceHtml = `
  <div class="selectionContest">
    <h2 id="contest_{CONTEST_INDEX}" class="contestName" tabindex="0">
      {CONTEST_NAME}<br>{CONTEST_SUBTITLE}
      <p class="votingInstructions">{VOTING_INSTRUCTIONS}</p>         
    </h2>
     
    <div class="regCandidates">
      {CANDIDATES}
    </div>
  </div>
`
// no heading
const rcCandidateHtml = `
  <tr class="row" tabindex="0">
    <th scope="row" class="cell" data-title="Candidate">
      <div class="candidateName">{CANDIDATE_NAME}</div>
      <span class="candidateSubtitle">{CANDIDATE_SUBTITLE}</span>      
    </th>
    {OVALS}
  </tr>
` 

const rcWriteinHtml = `
  <tr class="row">
    <th scope="row" class="cell" data-title="Candidate">
      <div id="{WRITEIN_HEADER_ID}_wh" class="candidateName">Write-in:</div>
      <div id="{WRITEIN_ID}_w" class="writeinName"></div>
    </th>
    {OVALS}
  </tr>
` 

const ovalHtml = `
  <td class="cell">
	<label>
      <input id="{OVAL_ID}" type="checkbox" class="rcOval">
      <span class="rcCheckmark" aria-hidden="true"></span>
	</label>
  </td>
`

const candidateRegLine = `
  <div class="indivCandidate">
    <label class="container candidateLabel" id="label_{OVAL_ID}">
      <div class="candidateNameDiv" aria-hidden="true">
        <div class="candidateName" aria-label="{CANDIDATE_HEADER_ARIA}" aria-hidden="true">{CANDIDATE_NAME}</div>
        <span class="candidateSubtitle" aria-hidden="true">{CANDIDATE_SUBTITLE}</span>        
      </div>
      <input type="checkbox" id="{OVAL_ID}" class="regularRaceOval" aria-label="{CANDIDATE_ARIA_LABEL}">
      <span class="checkmark ballotCheckbox" aria-hidden="true"></span>           
    </label>
  </div>
`

const candidateRegWriteIn = `
  <div class="indivCandidate">
    <label class="container candidateLabel" for="{OVAL_ID}">
      <div id="{OVAL_ID}_wh" class="candidateName" aria-hidden="true">Write-in:</div>
      <div id="{OVAL_ID}_w" class="writeinName" aria-hidden="true"></div>
      <input type="checkbox" id="{OVAL_ID}" class="regularRaceOval" aria-label="{WRITEIN_ARIA_LABEL}">
      <span class="checkmark ballotCheckbox" aria-hidden="true" ></span>
    </label>
  </div>
`

const qRaceHtml = `
  <div class="selectionContest">
    <h2 id="contest_{CONTEST_INDEX}" class="contestName" tabindex="0">
      {CONTEST_NAME}<br>{CONTEST_SUBTITLE}
      <p class="votingInstructions">{VOTING_INSTRUCTIONS}</p>  	
    </h2>                  
	<div class="questionDiv">
      <p class="question">{QUESTION_TEXT}</p>
      <div class="questionOptionsDiv">
        {QUESTION_OPTIONS}
      </div>
    </div>
  </div>
`

const questionOption = `
  <div class="questionOption">
    <label class="container candidateLabel">      
      <div class="candidateName" aria-hidden="true">{CANDIDATE_NAME}</div>
      <input id="{OVAL_ID}" type="checkbox" class="questionRaceOval" aria-label="{OPTION_ARIA_LABEL}">
      <span class="checkmark ballotCheckbox" aria-hidden="true"></span>
    </label>
  </div>
`

function buildRace(race, raceIndex) {
  if (race.contestType === 'RC') {
    return buildRankChoiceRace(race, raceIndex)
  } else if (race.contestType === 'Q') {
    return buildQuestionRace(race, raceIndex)
  } else {
    return buildRegRace(race, raceIndex)
  }
}

function buildRegRace(race, raceIndex) {
  let txt = rRaceHtml
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{CONTEST_NAME}/g, race.contestName)
    .replace(/{CONTEST_SUBTITLE}/g, race.contestSubtitle)
    .replace(/{VOTING_INSTRUCTIONS}/g, race.votingInstructions)
    .replace(/{VOTE_LIMIT}/g, race.voteFor)
    .replace(/{CANDIDATES}/g, buildRegCandidates(race, raceIndex))
  // console.log(txt)
  return txt
}

function buildRegCandidates(race, raceIndex) {
  let txt = ''
  race.candidates.forEach((candidate, candidateIndex) => {

    if (candidate.candidateCode.includes('writein')) {
      txt += candidateRegWriteIn
        .replace(/{OVAL_ID}/g, raceIndex + '_' + candidateIndex)
        .replace(/{WRITEIN_ARIA_LABEL}/g, buildWriteinAriaLabel(raceIndex, candidateIndex))
    } else {
      txt += candidateRegLine
        .replace(/{CANDIDATE_HEADER_ARIA}/g, buildCandidateAriaLabel(raceIndex, candidateIndex))
        .replace(/{CANDIDATE_NAME}/g, candidate.candidateName)
        .replace(/{OVAL_ID}/g, raceIndex + '_' + candidateIndex)
        .replace(/{CANDIDATE_ARIA_LABEL}/g, buildCandidateAriaLabel(raceIndex, candidateIndex))
        .replace(/{CANDIDATE_SUBTITLE}/g, candidate.candidateSubtitle)
    }
  })
  return txt
}

function buildQuestionOptions(race, raceIndex) {
  let txt = ''
  race.candidates.forEach((candidate, candidateIndex) => {
      txt += questionOption
        .replace(/{CANDIDATE_NAME}/g, candidate.candidateName)
        .replace(/{OVAL_ID}/g, raceIndex + '_' + candidateIndex)
        .replace(/{OPTION_ARIA_LABEL}/g, buildOptionAriaLabel(raceIndex, candidateIndex))
  })
  return txt
}

function buildOptionAriaLabel(raceIndex, candidateIndex) {
  let txt = ''
  // txt += 'Race ' + (raceIndex+1) + ' of ' + ballot.contests.length + ' '
  // txt += 'This is a ballot question. '
  // txt += ballot.contests[raceIndex].contestName + '. '
  // txt += 'Option ' + (candidateIndex + 1) + ' of ' + ballot.contests[raceIndex].candidates.length + ': '
  txt += ballot.contests[raceIndex].candidates[candidateIndex].candidateName
  return txt
}

function buildQuestionRace(race, raceIndex) { 
  let questionText = race.questionText.join('\\n')  
  let txt = qRaceHtml
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{CONTEST_NAME}/g, race.contestName)
    .replace(/{CONTEST_SUBTITLE}/g, race.contestSubtitle)
    .replace(/{VOTING_INSTRUCTIONS}/g, race.votingInstructions)
    .replace(/{QUESTION_TEXT}/g, questionText.replace(/\\n/g, '<br>'))
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{QUESTION_OPTIONS}/g, buildQuestionOptions(race, raceIndex)) 
  return txt
}

function buildRankChoiceRace(race, raceIndex) {
  let choices = race.candidates.length
  let cls = choiceClassName(choices)
  let txt = rcRaceHtml
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{CONTEST_NAME}/g, race.contestName)
    .replace(/{CONTEST_SUBTITLE}/g, race.contestSubtitle)
    .replace(/{VOTING_INSTRUCTIONS}/g, race.votingInstructions)
    .replace(/{RANKS}/g, buildRankHeaders(race))
    .replace(/{CANDIDATES}/g, buildRcCandidates(race, raceIndex))
  return txt
}

function buildRankHeaders(race) {
  const headerHtml = '<th class="cell">{RANK}<br aria-hidden="true"/> Choice</th>'; //scope="col"
  let html = '';
  let rank = 1;
  race.candidates.forEach(candidate => {
    html += headerHtml.replace('{RANK}', choiceLabel(rank));
    rank++;
  })
  return html;
}

function buildRcCandidates(race, contestIndex) {
  let html = '';
  race.candidates.forEach((candidate, candidateIndex) => {
    if (candidate.candidateCode.includes('writein')) {
      html += rcWriteinHtml.replace(/{WRITEIN_HEADER_ID}/g, `${contestIndex}_${candidateIndex}`)
                         .replace(/{WRITEIN_ID}/g, `${contestIndex}_${candidateIndex}`)
                         .replace(/{OVALS}/g, buildRcCandidateOvals(race, contestIndex, candidateIndex));
                   
    }
    else {
      html += rcCandidateHtml.replace(/{CANDIDATE_NAME}/g, candidate.candidateName)
                   .replace(/{CANDIDATE_NAME_ARIA}/g, candidateInfoString(contestIndex, candidateIndex))
                   .replace(/{CANDIDATE_SUBTITLE}/g, candidate.candidateSubtitle)
                   .replace(/{OVALS}/g, buildRcCandidateOvals(race, contestIndex, candidateIndex));
    }
  })
  return html;
}

function buildRcCandidateOvals(race, raceIndex, candidateIndex) {
  let html = '';
  if (race.candidates[candidateIndex].candidateCode.includes('writein')) {
    for (let rankIndex = 0; rankIndex < race.candidates.length; rankIndex++) {
      html += ovalHtml.replace(/{OVAL_ID}/g, `${raceIndex}_${candidateIndex}_${rankIndex}`)
                      .replace(/{OVAL_ARIA_LABEL}/g, `Write-in`)
    }
  }
  else {
    // no heading
    for (let rankIndex = 0; rankIndex < race.candidates.length; rankIndex++) {
      html += ovalHtml.replace(/{OVAL_ID}/g, `${raceIndex}_${candidateIndex}_${rankIndex}`)
                      .replace(/{OVAL_ARIA_LABEL}/g, `${candidateInfoString(raceIndex, candidateIndex)}`)
    }
  }
  return html;
}


function choiceClassName(choices) {
  let cls
  if (choices < 4)
    cls = 'choices-2-3'
  else if (choices < 6)
    cls = 'choices-4-5'
  else if (choices < 8)
    cls = 'choices-6-7'
  else if (choices < 10)
    cls = 'choices-8-9'
  else
    cls = 'choices-10-plus'
  return cls
}

function choiceLabel(choice) {
  let lbl
  if (choice == 1)
    lbl = '1st'
  else if (choice == 2)
    lbl = '2nd'
  else if (choice == 3)
    lbl = '3rd'
  else
    lbl = choice + 'th'
  return lbl
}

function candidateInfoString(raceIndex, candidateIndex) {
    let txt = ''
    const candidate = ballot.contests[raceIndex].candidates[candidateIndex]
    let candidateName = '';
    if (candidate.candidateCode.includes('writein')) {
      // const writeinId = raceIndex + "_" + candidateIndex + "_w";
      // console.log(document.getElementById(writeinId));
      candidateName = "Write-in:";
    }
    else {
      candidateName = candidate.candidateName.replace(/<br>/g, ' and ') + " - " + candidate.candidateSubtitle.replace(/<br>/g, ' ')
    }
    txt += candidateName;
    return txt
}

function shortenedName(raceIndex, candidateIndex) {
  const candidate = ballot.contests[raceIndex].candidates[candidateIndex]
  let split = candidate.candidateName.split('<br>')
  // return last names only when there is more than one candidate in the name, otherwise return the fullname
  if (split.length > 1) {
    let lastNames = new Array()
    for (let name of split) {
      lastNames.push(name.split(',')[0])
    }
    return lastNames.join(' and ')
  } else {
    return candidate.candidateName
  }
}

function buildCandidateAriaLabel(raceIndex, candidateIndex) {
    let txt = ''
    txt += candidateInfoString(raceIndex, candidateIndex)
    return txt
}

function buildWriteinAriaLabel(raceIndex, candidateIndex) {
    let txt = ''
    txt += 'Write-in'
    return txt
}

function fullNameAria(contestIndex, candidateIndex) {
  const candidate = ballot.contests[contestIndex].candidates[candidateIndex];
  const name = candidate.candidateName;
  const subtitle = candidate.candidateSubtitle;
  const aria = `${name} ${subtitle}`;
  return aria;
}

