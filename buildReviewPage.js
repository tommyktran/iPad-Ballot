const selectedVote = `<p>{CANDIDATE_NAME}</p>`
const rankedVote = `<p>{RANK} choice: {CANDIDATE_NAME}</p>`
const noSelection = `<div class="reviewPageNoSelection">No Selection</div>`
const reviewContestHtml = `
    <div id="review_contest_{REVIEW_ID}" class="reviewContest" role="button" tabIndex="0">
        <p id="review_header_{REVIEW_ID}" class="reviewContestHeader">{CONTESTNAME}  (Vote for {VOTEFOR})</p>
        <div id="review_candidates_{REVIEW_ID}" class="reviewCandidates">
            {CANDIDATES}
        </div>
    </div>   
`
function syncSelectedVotesToBallotData() {
    ballot.contests.forEach((contest, contestIndex) => {
        contest.candidates.forEach((candidate, candidateIndex) => {
            candidate.selected = 0
            let eleId = `${contestIndex}_${candidateIndex}`;
            if (contest.contestType == 'RC') {
                for (let rankIndex = 0; rankIndex < contest.candidates.length; rankIndex++) {
                    eleId = `${contestIndex}_${candidateIndex}_${rankIndex}`;
                    if (document.getElementById(eleId).checked) {
                        candidate.selected = rankIndex + 1;
                        if (candidate.candidateCode.includes('writein')) {
                            candidate.candidateName = document.getElementById(`${contestIndex}_${candidateIndex}_w`).textContent
                        }                        
                    }
                }
            }
            else {
                if (document.getElementById(eleId).checked) {
                    candidate.selected = 1;
                    if (candidate.candidateCode.includes('writein')) {
                        candidate.candidateName = document.getElementById(`${contestIndex}_${candidateIndex}_w`).textContent
                    }       
                }
            }
        })
    })
    
    return ballot
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


function reviewBtnHandler(event) {
    syncSelectedVotesToBallotData();
    const reviewPage = document.getElementById("reviewPage")
    const reviewBody = document.querySelector('#reviewBody')

    reviewBody.innerHTML = ''
    ballot.contests.forEach((race, index, contests) => {
        reviewBody.insertAdjacentHTML("beforeend", buildReview(race, index))
    })
    const reviewContestClickables = document.querySelectorAll('.reviewContest')	
    reviewContestClickables.forEach(contest => contest.addEventListener('click', reviewBoxesHandler))
    
    // adds keydown functionality when SPACEBAR or ENTER is pressed without screen-reader
    reviewContestClickables.forEach(contest => contest.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') {
            const contestId = e.target.id.replace('review_', '')
            document.getElementById(contestId).focus()
            document.getElementById(contestId).scrollIntoView()
        }
    }))
		
}

function doneAndCreatePdf() {
    syncSelectedVotesToBallotData()
    createBallotPdf(ballot)
}

function buildReview(race, raceIndex) {
    let text = reviewContestHtml
    text = text.replace(/{REVIEW_ID}/g, raceIndex)
    text = text.replace('{CONTESTNAME}', race.contestName)
    if (race.contestType === 'RC') {
        text = text.replace('Vote for {VOTEFOR}', 'Rank Choice')
    } else {
        text = text.replace('{VOTEFOR}', race.voteFor)
    }
    if (race.contestType === 'RC') {
        text = text.replace('{CANDIDATES}', buildReviewRankedVotes(race, raceIndex))
    } else {
        text = text.replace('{CANDIDATES}', buildReviewSelectedVotes(race, raceIndex))
    }
    return text;
}


function buildReviewSelectedVotes(race, raceIndex) {
    let text = ''
    race.candidates.forEach((candidate, candidateIndex) => {
        if (candidate.selected === 1) {
            if (candidate.candidateCode.includes("writein")) {
                text += selectedVote.replace('{CANDIDATE_NAME}', `Write-in: ${candidate.candidateName}`)
            } else {
                text += selectedVote.replace('{CANDIDATE_NAME}', getCandidateName(raceIndex + '_' + candidateIndex))
            }            
        }
    })
    if (text.trim() === '') {
        text += noSelection
    }
    return text
}

function buildReviewRankedVotes(race, raceIndex) {
    let text = ''
    for (let i = 1; i < race.candidates.length + 1; i++) {
        for (let j = 0; j < race.candidates.length; j++) {
            if (race.candidates[j].selected === i) {
                text += rankedVote
                text = text
                    .replace('{RANK}', choiceLabel(i))
                    .replace('{CANDIDATE_NAME}', getCandidateName(raceIndex + '_' + j))
            }
        }
    }
    if (text.trim() === '') {
        text += noSelection
    }
    return text
}

function reviewBoxesHandler(event) {
	const contestId = this.id.replace('review_', '')
    document.getElementById(contestId).focus()
    document.getElementById(contestId).scrollIntoView()
}

function backBtnHandler() {
    const reviewPage = document.getElementById("reviewPage")
    const selectionPage = document.getElementById('selection')
    const header = document.querySelector('header')
    reviewPage.style.display = 'none'
    selectionPage.style.display = 'block'   
    document.querySelector('input[type="checkbox"]').focus() // places focus on the first oval on page
    const reviewBody = document.getElementById('reviewBody')
    reviewBody.innerHTML = '';
    header.scrollIntoView();
}

// returns string with candidate's name + subtitle with all the html-text cleaned up (such as &quot; and <br>)
// takes 1 argument: a string for the candidate's ovalId
function getCandidateName(ovalId) {
    const candidate = getCandidate(ovalId)
    const contestIndex = ovalId.split('_')[0]
    let name = ''
    if (candidate.candidateCode.includes('writein')) {
        const split = ovalId.split('_')
        const writeinBox = document.getElementById(split[0] + '_' + split[1] + '_w')
        name = 'Write-in: ' + writeinBox.textContent
    } else {
        name = candidate.candidateName.replace(/<br>/g, ' and ')
		if (ballot.contests[contestIndex].contestType != 'Q') {
			let subtitle = candidate.candidateSubtitle
			if (subtitle.includes(`<br>`)) {				
				let partySectionIndex = subtitle.indexOf(`<br>`)
				name += ', ' + subtitle.substr(partySectionIndex, subtitle.length - partySectionIndex).replace(/<br>/g, '')			
			}       
			else if (!subtitle.match(/^\d/)) {
				name += ', ' + subtitle
			}
		}
    }
    if (name.includes('&quot;')) {
        name = name.replace(/&quot;/g, '"')
    }
    return name
}