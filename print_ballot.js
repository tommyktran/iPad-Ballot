let contestIndex = 0
let candidateIndex = 0	
const notSelected = '0.1|  not selected.'
const uniformedServices = 'or dependent, and absent from place of registration.'
	
function getToday() {
	let today = new Date()
	let dd = String(today.getDate()).padStart(2, '0')
	let mm = String(today.getMonth() + 1).padStart(2, '0')
	let yyyy = today.getFullYear()
	return mm + '/' + dd + '/' + yyyy
}	
	
function createPDF() {	
	data = data.replace('MM/dd/yyyy', getToday())	
	let statements = data.split('||')
	let statement = statements[0]
	let strs = statement.split('|')
	let pdfUA = new PdfUA(strs[1], strs[2])		
	for (let i = 1; i < statements.length; i++) {	
		statement = statements[i]
		let command = statement.charAt(0)
		switch(command) {
			case '1':	
				pdfUA.addPage()
				break
			case '2':
				if (statement.endsWith(notSelected)) {
					let voteCount = ballot.contests[contestIndex].candidates[candidateIndex].selected
					if (voteCount > 0) {
						statements[i+voteCount] = statements[i+voteCount].replace(/.$/,"1")
						statement = updateCandidateSelection(statement, voteCount)						
					}
					toNextCandidate()
				} else if (statement.endsWith(uniformedServices)){
					if (document.getElementsByName('uniformOrOverseas')[0].checked) {
						statements[i-1] = statements[i-1].replace(/.$/,"1") //fill the first oval: Uniformed
						addDraw(pdfUA, statements[i-1])	
					} else {
						statements[i+1] = statements[i+1].replace(/.$/,"1") //update the next oval: overseas
					}
				}
				addElement(pdfUA, statement)
				break
			case '3':
				addArtifactText(pdfUA, statement)
				break				
			case '4':					
			case '5':									
			case '6':
				addDraw(pdfUA, statement)			
				break					
			case '7':
				let fileName = statement.substr(2, statement.length -2)				
				pdfUA.savePdf(fileName)
				break
			default:
				alert('createPDF()- Command ' + command + ' is invalid: ' + statement)				
		}
	}	
}

function updateCandidateSelection(statement, voteCount) {
	let contest = ballot.contests[contestIndex]
	if (contest.contestType == 'RC') {
		let choices = ['','first', 'second', 'third', 'fourth', 'fifth', 'sixth']
		statement = statement.replace(notSelected, '0.1|  selected as ' + choices[voteCount] + ' choice.')
	} else {
		statement = statement.replace(notSelected, '0.1|  selected.')
	}
	let candidate = contest.candidates[candidateIndex]
	if (candidate.candidateCode == 'writein') {
		statement = statement.replace('| Write-in:|', '| Write-in: ' + candidate.candidateName + '|')
	}
	return statement
}
 
function toNextCandidate() {
	candidateIndex ++	
	if (ballot.contests[contestIndex].candidates.length == candidateIndex) {		
		candidateIndex = 0
		contestIndex ++
	}
}

function addElement(pdfUA, statement) {
	//AddElement|elementType|parentElement|title[|text| fontType|fontSize|x|y|dx|dy||
	let strs = statement.split('|')
	let elemType = strs[1]
	switch(elemType) {
		case '1':	
			elemType = elementType.part
			break
		case '2':	
			elemType = elementType.section
			break
		case '3':	
			elemType = elementType.div
			break
		case '4':	
			elemType = elementType.header1
			break
		case '5':	
			elemType = elementType.header2
			break
		case '6':	
			elemType = elementType.header3
			break
		case '7':	
			elemType = elementType.paragraph
			break			
		default:					
	}
	let title = strs[3]
	if (strs.length == 4) {
		pdfUA.addElement(elemType, strs[2], title) 
	} else {
		let textElements = getTextElements(strs, 4)
		pdfUA.addElement(elemType, strs[2], title, textElements) 
	}
}

function addArtifactText(pdfUA, statement) {	
	let strs = statement.split('|')
	let textElements = getTextElements(strs, 1)
	pdfUA.addArtifactText(textElements) 	
}

function addDraw(pdfUA, statement) {	
	let strs = statement.split('|')
	let command = strs[0]
	let penWidth = parseFloat(strs[1])
	let num1 = parseFloat(strs[2])
	let num2 = parseFloat(strs[3])
	let num3 = parseFloat(strs[4])
	let num4 = parseFloat(strs[5])
	if (command == '4') {
		pdfUA.drawLine(penWidth, num1, num2, num3, num4)
	} else {
		let filled = false
		if (strs.length > 6) {
			filled = (strs[6] == '0' ? false : true)
		}
		if (command == '5') {
			pdfUA.drawRectangle(penWidth, num1, num2+num4, num3, num4, filled)
		} else {
			pdfUA.drawOval(penWidth, num1+num3/2, num2+num4/2, num3, num4, filled)
		}
	}		
}


function getTextElements(strs, startIndex) {	
	let i = startIndex
	let textElements = []
	while (i < strs.length - 1) {	
		let x = parseFloat(strs[i])
		let y = parseFloat(strs[i+1])
		let fontCode = (strs[i+2]=='0' ? 'F0' : 'F1')	
		let fontSize = parseFloat(strs[i+3])
		let textString = strs[i+4]
		textElements.push(new TextElement(x, y, fontCode, fontSize, textString))
		i += 5
	}
	return textElements
}	
