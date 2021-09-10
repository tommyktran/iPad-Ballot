let activeWriteinOvalId = ''
let loadTimer = setInterval(initPage, 100)
const idHtmlTemplate = '{contestIndex}_{candidateIndex}_{rankIndex}'

function initPage() {
  if (document.readyState == 'complete') {

    clearInterval(loadTimer)

    let elm = document.getElementById("contests")
    ballot.contests.forEach((race, index, contests) => {
      elm.insertAdjacentHTML("beforeend", buildRace(race, index))
    })
	
	elm = document.getElementById("uocava")	
	if (elm != null) {
		elm.insertAdjacentHTML("beforeend", uocava)		
	}

    //start running other javascript after page is rendered
    let question = document.querySelectorAll('.questionRaceOval')
    question.forEach(checkbox => checkbox.addEventListener('click', questionHandler))

    let test_all = document.querySelectorAll('.regularRaceOval')
    test_all.forEach(checkbox => checkbox.addEventListener('click', regularHandler))

    let rc = document.querySelectorAll('.rcOval')	
    rc.forEach(checkbox => checkbox.addEventListener('click', rankChoiceHandler))
	
	document.querySelector('#signedby').addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {			
			processPassword()	
		}
	});
	
    document.getElementById('doneButton_AffidavitPage').addEventListener('click', (event) => {
		processPassword()	    
    });
	
    reviewBtnHandler();
	elm = document.getElementById('ballotInstructions');
	if (elm != null) {
		elm.focus();	
	} else {
		document.getElementById('step1').focus();
	}    
  }
}

function processPassword() {
	const passwordEle = document.getElementById('signedby');
	var md = forge.md.sha256.create();  
	md.start();  
	md.update('IVS' + passwordEle.value, "utf8");  
	var hashPassword = md.digest().toHex();        	  
	if (hashPassword === myPassword) {
		createPDF();
		document.querySelector('main').innerHTML = `
			<div id="center">
				<h1 id="thankyouForVoting" style="text-align:center;font-family:arial;" tabindex="0">Thank you for voting!</h1>
			</div> 
		`;
		document.body.style.backgroundColor = "whitesmoke";
		//document.getElementById('thankyouForVoting').focus();
		document.getElementById('thankyouForVoting').scrollIntoView();      }
	else {		
		showModal('pwModal', 'signedby')
	}
}

function addWriteinsToData() {
  ballot.contests.forEach((contest, contestIndex) => {
    if (contest.contestType === 'R') {
      const voteForValue = contest.voteFor
      for (let i = 0; i < voteForValue; i++) {
        let newWriteinCandidate = {
          candidateName: '',
          candidateCode: 'writein' + '-' + i,
          selected: 0
        }
        contest.candidates.push(newWriteinCandidate)
      }
    }
  })
}


let uocava = `<label>I am a (check only one):</label><br><br>
    <input id="uniform" type="radio" class="rcCheckmark" name="uniformOrOverseas" value="uniform" checked>
	<label for="uniform">Member of the Uniformed Services or Merchant Marine on active duty, or an eligible spouse or dependent, and absent from place of registration.</label><br><br>
    <input id="overseas" type="radio" class="rcCheckmark" name="uniformOrOverseas" value="overseas">
    <label for="overseas">U.S. citizen residing outside the United States (temporarily or indefinitely).</label><br>`
  

