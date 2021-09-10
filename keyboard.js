function doneBtnKeyHandler(event) {
    if (event.shiftKey && event.key === 'ArrowUp') {
        moveToTop()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        const lastContestIndex = ballot.contests.length - 1
        const lastCandidateIndex = ballot.contests[lastContestIndex].candidates.length - 1
        let nextElementId = lastContestIndex + '_' + lastCandidateIndex
        if (ballot.contests[lastContestIndex].contestType === 'RC') {
            nextElementId = nextElementId + '_0'
        }
        document.getElementById(nextElementId).focus()
        event.preventDefault()
    }
}

function keypressHandler(event) {
    const currentId = event.target.id
    const idParts = currentId.split('_')
    let contestIndex, candidateIndex, rankIndex
    if (idParts.length > 0) {
        contestIndex = idParts[0]
        if (idParts.length > 1) {
            candidateIndex = idParts[1]
            if (idParts.length > 2) {
                rankIndex = idParts[2]
            }
        }
    }
    if (event.key === "ArrowUp") {
        if (event.shiftKey) {
            moveToTop();
        } else {
            if (candidateIndex === '0') {
                if (contestIndex > '0') {
                    moveToPreviousContest(contestIndex)
                }
            } else {
                moveToPreviousCandidate(contestIndex, candidateIndex, rankIndex)
            }
        }
    } else if (event.key === "ArrowDown") {
        const lastContestIndex = ballot.contests.length - 1
        const lastCandidateIndex = ballot.contests[lastContestIndex].candidates.length - 1
        if (event.shiftKey || (contestIndex == lastContestIndex && candidateIndex == lastCandidateIndex)) {
            moveToBottom()
        } else {
            if (candidateIndex == ballot.contests[contestIndex].candidates.length - 1) {
                if (contestIndex < ballot.contests.length - 1) {
                    moveToNextContest(contestIndex)
                }
            } else {
                moveToNextCandidate(contestIndex, candidateIndex, rankIndex)
            }
        }
    } else if (event.key === 'ArrowRight') {
        if (candidateIndex == ballot.contests[contestIndex].candidates.length - 1 && rankIndex == ballot.contests[contestIndex].candidates.length - 1) {
            if (contestIndex < ballot.contests.length - 1)
                moveToNextContest(contestIndex)
        } else if (rankIndex < ballot.contests[contestIndex].candidates.length - 1) {
            increaseRank(contestIndex, candidateIndex, rankIndex);
        } else if (rankIndex == ballot.contests[contestIndex].candidates.length - 1) {
            moveToNextCandidateFirstRank(contestIndex, candidateIndex, rankIndex)
        } else {
            if (candidateIndex == ballot.contests[contestIndex].candidates.length - 1) {
                if (contestIndex < ballot.contests.length - 1)
                    moveToNextContest(contestIndex)
            } else {
                moveToNextCandidate(contestIndex, candidateIndex, rankIndex);
            }
        }
    } else if (event.key === 'ArrowLeft') {
        if (candidateIndex == 0 && rankIndex == 0) {
            if (contestIndex > 0)
                moveToPreviousContest(contestIndex)
        } else if (rankIndex > 0) {
            decreaseRank(contestIndex, candidateIndex, rankIndex)
        } else if (rankIndex == 0) {
            moveToPreviousCandidateLastRank(contestIndex, candidateIndex, rankIndex)
        } else {
            if (candidateIndex == 0) {
                if (contestIndex > '0')
                    moveLeftPreviousContest(contestIndex)
            } else {
                moveToPreviousCandidate(contestIndex, candidateIndex, rankIndex)
            }
        }
    }
}

function moveToNextCandidateFirstRank(event, contestIndex, candidateIndex) {
    candidateIndex = parseInt(candidateIndex) + 1
    let nextElementId = contestIndex + '_' + candidateIndex + '_0'
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function moveToPreviousCandidateLastRank(event, contestIndex, candidateIndex, rankIndex) {
    candidateIndex = parseInt(candidateIndex) - 1
    rankIndex = ballot.contests[contestIndex].candidates.length - 1
    let nextElementId = contestIndex + '_' + candidateIndex + '_' + rankIndex
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function increaseRank(event, contestIndex, candidateIndex, rankIndex) {
    rankIndex = parseInt(rankIndex) + 1
    let nextElementId = contestIndex + '_' + candidateIndex + '_' + rankIndex
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function decreaseRank(event, contestIndex, candidateIndex, rankIndex) {
    rankIndex = parseInt(rankIndex) - 1
    let nextElementId = contestIndex + '_' + candidateIndex + '_' + rankIndex
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function moveToNextContest(event, contestIndex) {
    contestIndex = parseInt(contestIndex) + 1
    let nextElementId = contestIndex + '_0'
    if (ballot.contests[contestIndex].contestType === 'RC') {
        let rankIndex = '0'
        nextElementId += '_' + rankIndex
    }
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function moveToNextCandidate(event, contestIndex, candidateIndex, rankIndex) {
    candidateIndex = parseInt(candidateIndex) + 1
    let nextElementId = contestIndex + '_' + candidateIndex
    if (ballot.contests[contestIndex].contestType === 'RC') {
        nextElementId += '_' + rankIndex
    }
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function moveToBottom(event) {
    event.preventDefault()
    document.getElementById('doneButton').focus()
}

function moveToTop(event) {
    let nextElementId = '0_0'
    if (ballot.contests[0].contestType === 'RC') {
        nextElementId += '_0'
    }
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function moveToPreviousContest(event, contestIndex) {
    contestIndex = contestIndex - 1
    let candidateIndex = ballot.contests[contestIndex].candidates.length - 1
    let nextElementId = contestIndex + '_' + candidateIndex
    if (ballot.contests[contestIndex].contestType === 'RC') {
        let rankIndex = '0'
        nextElementId += '_' + rankIndex
    }
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function moveLeftPreviousContest(event, contestIndex) {
    contestIndex = contestIndex - 1
    let candidateIndex = ballot.contests[contestIndex].candidates.length - 1
    let nextElementId = contestIndex + '_' + candidateIndex
    if (ballot.contests[contestIndex].contestType === 'RC') {
        let rankIndex = ballot.contests[contestIndex].candidates.length - 1
        nextElementId += '_' + rankIndex
    }
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}

function moveToPreviousCandidate(event, contestIndex, candidateIndex, rankIndex) {
    candidateIndex = candidateIndex - 1
    let nextElementId = contestIndex + '_' + candidateIndex
    if (ballot.contests[contestIndex].contestType === 'RC') {
        nextElementId += '_' + rankIndex
    }
    document.getElementById(nextElementId).focus()
    event.preventDefault()
}