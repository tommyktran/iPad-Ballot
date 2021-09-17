function questionHandler(event) {
    const ovalId = event.target.id
    const contestIndex = ovalId.split('_')[0]
    const candidateIndex = ovalId.split('_')[1]
    uncheckOtherCandidates(contestIndex, candidateIndex);
    reviewBtnHandler();
}

function uncheckOtherCandidatesRC(contestIndex, candidateIndex, rankIndex) {
    for (let c in ballot.contests[contestIndex].candidates) {
        if (c != candidateIndex) {
            const id = contestIndex + '_' + c + '_' + rankIndex
            document.getElementById(id).checked = false
            if (isWriteinCandidate(contestIndex, c)) {
                const writeinBox = document.getElementById(contestIndex + '_' + c + '_w')
                if (writeinBox.textContent !== '') {
                    clearOutRcWriteinAria(contestIndex, c);
                }                
            }
        }
    }
}

function clearOutRcWriteinAria(contestIndex, candidateIndex) {
    // resets all the writein oval aria-labels for Rank Choice Contest
    for (let rankIndex in ballot.contests[contestIndex].candidates) {
        const ordinal = choiceLabel(parseInt(rankIndex) + 1)
        document.getElementById(`${contestIndex}_${candidateIndex}_${rankIndex}`).ariaLabel = `${ordinal} Choice Write-in`;
    }
    document.getElementById(`${contestIndex}_${candidateIndex}_w`).textContent = '';
    document.getElementById(`${contestIndex}_${candidateIndex}_wh`).ariaLabel = 'Write-in'    
}

function uncheckOtherCandidates(contestIndex, selectedCandidateIndex) {
    for (let candidateIndex = 0; candidateIndex < ballot.contests[contestIndex].candidates.length; candidateIndex++) {
        if (candidateIndex != selectedCandidateIndex) {
            const id = contestIndex + '_' + candidateIndex
            document.getElementById(id).checked = false
            if (isWriteinCandidate(contestIndex, candidateIndex)) {
                if (document.getElementById(id + '_w').textContent !== '') {
                    clearRegWriteinAria(id);
                } 
            }
        }
    }
}

function clearRegWriteinAria(id) {
    document.getElementById(`${id}_w`).textContent = '';
    document.getElementById(`${id}_wh`).ariaLabel = 'Write-in';
    document.getElementById(id).ariaLabel = 'Write-in';
}

function regularHandler(event) {	
    const ovalId = event.target.id
    const split = ovalId.split('_')
    const contestIndex = split[0] 
    const candidateIndex = split[1]
    const voteMax = ballot.contests[contestIndex].voteFor
    const isWritein = isWriteinCandidate(contestIndex, candidateIndex)
    let howManySelected = 0
    for (let x = 0; x < ballot.contests[contestIndex].candidates.length; x++) {
        if (document.getElementById(contestIndex + "_" + x).checked == true && x != candidateIndex) {
            howManySelected++
        }
    }    
    if (howManySelected >= voteMax && voteMax>1) {
        document.getElementById("maxChoicesOkButton").addEventListener('click', () => {hideModal('maxChoicesModal', ovalId)})        
        event.preventDefault()
		showModal('maxChoicesModal', ovalId)
		document.getElementById("maxChoicesOkButton").focus()
        return        
    }	
    if (isWritein) {
        const writeinBox = document.getElementById(ovalId + '_w');
        if (writeinBox.textContent === '') {			
			showEnterWriteInModal(ovalId)
			return
        } else { // click is to deselect a writein oval so need to clear the writeinBox
            clearRegWriteinAria(ovalId)
        }
    }
	uncheckOthersAndReview(contestIndex, candidateIndex, voteMax)
}

function showEnterWriteInModal(ovalId) {
	document.getElementById('writeInName').value = ''
	document.getElementById("writeInOkButton").addEventListener('click', () => {writeInModalAnswer(ovalId, 'OK')})        
	document.getElementById("writeInCancelButton").addEventListener('click', () => {writeInModalAnswer(ovalId, 'Cancel')})        
    event.preventDefault()
	document.querySelector('#writeInName').addEventListener('keypress', function(e) {
		if (event.key === 'Enter') {			
			processWriteInName(ovalId)	
		}
	})
	showModal('writeInModal', ovalId)
	document.getElementById("writeInName").focus()
}

function writeInModalAnswer(ovalId, answer) {
    if (answer == "Cancel") {
        document.getElementById('writeInName').value = ''		
    }
	processWriteInName(ovalId)
}	

function processWriteInName(ovalId) {	
	let writeInName = document.getElementById('writeInName').value.trim().toUpperCase()
	if (writeInName != '') {
		const split = ovalId.split('_')
		const contestIndex = split[0] 
		const candidateIndex = split[1]	
		if (ballot.contests[contestIndex].contestType === 'R') {
			if (!writeInNameAlreadyExisted(writeInName, contestIndex, candidateIndex)) {		
				document.getElementById(ovalId).checked = true				
				const voteMax = ballot.contests[contestIndex].voteFor	
				addRegWriteinAria(writeInName, ovalId)
				uncheckOthersAndReview(contestIndex, candidateIndex, voteMax)
			}
		} 
		else {
			document.getElementById(ovalId).checked = true;
			addRcWriteInAria(writeInName, contestIndex, candidateIndex)
			const rankIndex = split[2]	
			uncheckOthersRcAndReview(contestIndex, candidateIndex, rankIndex)				
		}
	}
	document.getElementById('writeInName').value = ''
    hideModal('writeInModal', ovalId)    	        
}

function writeInNameAlreadyExisted(typedWriteInName, contestIndex, candidateIndex) {
	let existed = false
	for (let index in ballot.contests[contestIndex].candidates) {
		let writeInId = contestIndex + '_' + index + '_w'		
		if ((index != candidateIndex) && (document.getElementById(writeInId) != null)) {
            let writeInName = document.getElementById(writeInId).textContent.toUpperCase()
            if (typedWriteInName === writeInName) {				
                existed = true
                break
            }                    
        }
    }		
	return existed
}

function uncheckOthersAndReview(contestIndex, candidateIndex, voteMax) {	
	if (voteMax === 1) {
        uncheckOtherCandidates(contestIndex, candidateIndex)
    }
    reviewBtnHandler();
}

function addRegWriteinAria(writeInName, ovalId) { 
	document.getElementById(ovalId + '_w').textContent = writeInName
    document.getElementById(`${ovalId}_wh`).ariaLabel = `Write-in: ${writeInName}`;
    document.getElementById(ovalId).ariaLabel = `Write-in: ${writeInName}`;
}

function isWriteinCandidate(contestIndex, candidateIndex) {
    return ballot.contests[contestIndex].candidates[candidateIndex].candidateCode.includes('writein');
}

function isIdRcWriteinCandidate(id) {
    const split = id.split('_');
    const contestIndex = split[0];
    const candidateIndex = split[1];
    return ballot.contests[contestIndex].candidates[candidateIndex].candidateCode.includes('writein');
}

function rankChoiceHandler(event) {	
    const ovalId = event.target.id
    let split = ovalId.split('_')
    let contestIndex = split[0];
    let candidateIndex = split[1];
    let rankIndex = split[2];
	let sameColSelection = otherSelectionInCol(contestIndex, candidateIndex, rankIndex)
	if (sameColSelection === '') {
		processRcSelection(contestIndex, candidateIndex, rankIndex)
	} else {
		// If there was previously a selection in the same column, then ask the user to confirm their choice by showing a modal.
		warningUncheckAnotherCandidate(ovalId, sameColSelection)
	}	
}

function processRcSelection(contestIndex, candidateIndex, rankIndex) {
    let isWritein = isWriteinCandidate(contestIndex, candidateIndex)
    if (isWritein) {
        const writeinBox = document.getElementById(contestIndex + '_' + candidateIndex + '_w')
        if (writeinBox.textContent === '') {
			showEnterWriteInModal(contestIndex + '_' + candidateIndex + '_' + rankIndex)
			return
        } else { // there is already a writein name
            let isWriteinDeselection = true 
            for (let r in ballot.contests[contestIndex].candidates) {
                if (r != rankIndex) {
                    const id = contestIndex + '_' + candidateIndex + '_' + r
                    if (document.getElementById(id).checked) {
                        isWriteinDeselection = false
                        break
                    }                    
                }
            }
            if (isWriteinDeselection) {
                clearOutRcWriteinAria(contestIndex, candidateIndex)
            }			
        }
    }
	uncheckOthersRcAndReview(contestIndex, candidateIndex, rankIndex)	
}


function uncheckOthersRcAndReview(contestIndex, candidateIndex, rankIndex) {
    const sameRowSelection = otherSelectionInRow(contestIndex, candidateIndex, rankIndex)
    const sameColSelection = otherSelectionInCol(contestIndex, candidateIndex, rankIndex)
    if (sameRowSelection != '') { 
        document.getElementById(sameRowSelection).checked = false
    }
    if (sameColSelection != '') {
        // will clear out write-in candidates and update all aria-labels
        document.getElementById(sameColSelection).checked = false
		split = sameColSelection.split('_')
		contestIndex = split[0];
		candidateIndex = split[1];
		rankIndex = split[2];
		if (isWriteinCandidate(contestIndex, candidateIndex)) {
            clearOutRcWriteinAria(contestIndex, candidateIndex)
        }				
    }    
    reviewBtnHandler();
}

//return id of a selected oval (if any) on same row of newly selected oval
function otherSelectionInRow(contestIndex, candidateIndex, rankIndex) {
    let otherSelection = ''
    const maxNoOfRanks = ballot.contests[contestIndex].candidates.length; //contest with 7 candidates can have less than 7 rank choices
    for (let rank = 0; rank < maxNoOfRanks; rank++) {
        if (rank != rankIndex) {
            const id = `${contestIndex}_${candidateIndex}_${rank}`			
            if ((document.getElementById(id) != null) && (document.getElementById(id).checked)) {
				otherSelection = id
				break
			}			
        }        
    }
    return otherSelection;
}

//return id of a selected oval (if any) on same column of newly selected oval
function otherSelectionInCol(contestIndex, candidateIndex, rankIndex) {    
    let otherSelection = ''
    const numOfCandidates = ballot.contests[contestIndex].candidates.length;
    for (let index = 0; index < numOfCandidates; index++) {
        if (index != candidateIndex) {
            const id = `${contestIndex}_${index}_${rankIndex}`
            if (document.getElementById(id).checked) {
				otherSelection = id
				break
			}
        }        
    }
    return otherSelection;
}

function addRcWriteInAria(writeInName, contestIndex, candidateIndex) {    
    document.getElementById(contestIndex + '_' + candidateIndex + '_w').textContent = writeInName
    for (let rankIndex in ballot.contests[contestIndex].candidates) {		
        const ordinal = choiceLabel(parseInt(rankIndex) + 1)
        document.getElementById(`${contestIndex}_${candidateIndex}_${rankIndex}`).ariaLabel = `${ordinal} Choice Write-in: ${writeInName}`;
    }
    document.getElementById(`${contestIndex}_${candidateIndex}_wh`).ariaLabel = `Write-in: ${writeInName}`; 
}

function warningUncheckAnotherCandidate(ovalId, sameColSelection) {
	let split = ovalId.split('_')
    let contestIndex = split[0];
    let candidateIndex = split[1];
    let rankIndex = split[2];
	const sameRowSelection = otherSelectionInRow(contestIndex, candidateIndex, rankIndex)
	const ordinal = choiceLabel((parseInt(rankIndex)+ 1))
	const selectedCandidateName = getCandidateName(ovalId)
	let otherCandidateName = getCandidateName(sameColSelection)	
	document.getElementById("rcModalText").innerHTML = `For ${ordinal} choice, you previously selected ${otherCandidateName}. Do you now like to change your ${ordinal} choice to ${selectedCandidateName}?`
	document.getElementById("yesButton").addEventListener('click', () => {modalAnswer(ovalId, sameColSelection, sameRowSelection, "Yes", otherCandidateName)})
	document.getElementById("noButton").addEventListener('click', () => {modalAnswer(ovalId, sameColSelection, sameRowSelection, "No", otherCandidateName)})        
	event.preventDefault()
	showModal('rcModal', ovalId)
	document.getElementById("yesButton").focus()
}


function modalAnswer(ovalId, sameColSelection, sameRowSelection, answer, otherCandidateName) {
	hideModal('rcModal', ovalId)
    document.getElementById(ovalId).focus()   
    if (answer == "Yes") {
		if (isIdRcWriteinCandidate(ovalId)) {
			if (sameRowSelection === '') {
				showEnterWriteInModal(ovalId)
				return
			}
		}
        document.getElementById(sameColSelection).checked = false
        if (isIdRcWriteinCandidate(sameColSelection)) {
            const split = sameColSelection.split('_');
            clearOutRcWriteinAria(split[0], split[1])
        }
        if (sameRowSelection != '') {
            document.getElementById(sameRowSelection).checked = false
        }
        document.getElementById(ovalId).checked = true;
		reviewBtnHandler();
    }      
}

function showModal(modalId, returnFocusEleId) {	
    const modal = document.getElementById(modalId);
    modal.style = 'display:block;'
    document.getElementById('main').ariaHidden = 'true'
    document.getElementById('main').inert = 'true'
    document.getElementById("overlay").style = 'display:block;'

    // add all the elements inside modal which you want to make focusable
    const  focusableElements = ['h2', 'p', 'button'];
    const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal  
    const focusableContent = modal.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal
	



    document.addEventListener('keydown', function modalKeyHandler(e) {
        let isTabPressed = e.key === 'Tab';
        let isEscPressed = e.key === 'Escape';
        if (!isTabPressed && !isEscPressed) return;
        if (e.shiftKey && isTabPressed) { // if shift key pressed for shift + tab combination
            if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus(); // add focus for the last focusable element
            e.preventDefault();
            }
        }
        else if (isTabPressed && !isEscPressed) {
            if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
                firstFocusableElement.focus(); // add focus for the first focusable element
                e.preventDefault();
            }
        }
        else if (isEscPressed && !isTabPressed) {
            hideModal(modalId, returnFocusEleId);
            document.removeEventListener('keydown', modalKeyHandler);
        } 
    });	
    // firstFocusableElement.focus(); 
    // firstFocusableElement.sendAccessibilityEvent(AccessibilityEvent.TYPE_VIEW_FOCUSED);
    modal.getElementsByTagName('h2')[0].tabIndex = 0;
    modal.getElementsByTagName('h2')[0].focus();
    console.log(firstFocusableElement);
}

function hideModal(modalId, returnFocusEleId) {
    document.getElementById('main').ariaHidden = 'false'
    document.getElementById('main').inert = 'false'
    document.getElementById("overlay").style = 'display:none;'
    if (modalId == 'rcModal') {
        recreateNode(document.getElementById("yesButton"));
        recreateNode(document.getElementById("noButton"));
        document.getElementById("rcModal").style = 'display:none;'
        document.getElementById("overlay").style = 'display:none;'
    }
    else if (modalId == 'pwModal') {
        document.getElementById("pwModal").style = 'display:none;'
        document.getElementById("overlay").style = 'display:none;'
    }
    else if (modalId == 'maxChoicesModal') {
        document.getElementById("maxChoicesModal").style = 'display:none;'
        document.getElementById("overlay").style = 'display:none;'
    }
	else if (modalId == 'writeInModal') {
		recreateNode(document.getElementById("writeInOkButton"));
        recreateNode(document.getElementById("writeInCancelButton"));
		recreateNode(document.getElementById("writeInName"));
        document.getElementById("writeInModal").style = 'display:none;'
        document.getElementById("overlay").style = 'display:none;'
    }	
	if (returnFocusEleId != '') {
		document.getElementById(returnFocusEleId).focus();
	}
    return;
}


function recreateNode(el, withChildren) {
    if (withChildren) {
      el.parentNode.replaceChild(el.cloneNode(true), el);
    }
    else {
      var newEl = el.cloneNode(false);
      while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
      el.parentNode.replaceChild(newEl, el);
    }
}

function getCandidate(ovalId) {
    return ballot.contests[ovalId.split('_')[0]].candidates[ovalId.split('_')[1]]
}
