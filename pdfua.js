const elementType = {
    part: 'Part',
    article: 'Art',
    section: 'Sect',
    div: 'Div',
    paragraph: 'P',
    header: 'H',
    header1: 'H1',
    header2: 'H2',
    header3: 'H3',
    header4: 'H4',
    header5: 'H5',
    header6: 'H6'
}

const placeHolder = {
    length: '$LENGTH$',
    contents: '$CONTENTS$',
    kid: '$KID$',
    parent: '$PARENT$',
    nextKey: '$NEXT_KEY$',
    pageCount: '$PAGE_COUNT$',
    title: '$TITLE$',
    dateTime: '$DATE_TIME$'
}

/*
const fixedObjNo = {
    docInfo: 1,
    docCatalog: 2,
    metaData: 3,
    f0Font: 4,
    f0FontDesc: 5,
    f0CidSet: 6,
    f0FontFile: 7,
    f1Font: 8,
    f1FontDesc: 9,
    f1FontCidSet: 10,
    f1FontFile: 11,
    pageTree: 12,
    parentTree: 13,
    structTree: 14,
    structElemDocument: 15
}
*/

const fixedObjNo = {
    docInfo: 1,
    docCatalog: 2,
    metaData: 3,
    f0Font: 4,
    f1Font: 5,
    pageTree: 6,
    parentTree: 7,
    structTree: 8,
    structElemDocument: 9
}

const metadata= 
`<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?> 
<x:xmpmeta xmlns:x="adobe:ns:meta/"> 
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"> 
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"> 
      <dc:format>application/pdf</dc:format> 
      <dc:title> 
        <rdf:Alt> 
          <rdf:li xml:lang="x-default">$TITLE$</rdf:li> 
        </rdf:Alt> 
      </dc:title> 
      <dc:description> 
        <rdf:Alt> 
          <rdf:li xml:lang="x-default" /> 
        </rdf:Alt> 
      </dc:description> 
      <dc:creator> 
        <rdf:Seq> 
          <rdf:li /> 
        </rdf:Seq> 
      </dc:creator> 
    </rdf:Description> 
    <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/"> 
      <pdf:Keywords /> 
      <pdf:Producer>IVS LLC</pdf:Producer> 
    </rdf:Description> 
    <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/"> 
      <xmp:CreatorTool>IVS LLC</xmp:CreatorTool> 
      <xmp:CreateDate>$DATE_TIME$-05:00</xmp:CreateDate> 
      <xmp:ModifyDate>$DATE_TIME$-05:00</xmp:ModifyDate> 
    </rdf:Description> 
    <rdf:Description rdf:about="" xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/"> 
      <pdfuaid:part>1</pdfuaid:part> 
    </rdf:Description> 
  </rdf:RDF> 
</x:xmpmeta> 
<?xpacket end="w"?>
`

class TextElement {
    constructor(x, y, fontCode, fontSize, textString) {
        this.x = x
        this.y = y
        this.fontCode = fontCode,   // F0 (regular Arial) or F1 (bold Arial)
        this.fontSize = fontSize,
        this.textString = textString
    }
}

class PdfUA {
    objects = []
    pageCount = 0
    objNoLastElements = []
    objNoParentElements
    objNoPage
    objNoPageContents
    pageContents
    nextMcid
    
    // *****************************************************
    // Functions to be called from outside the class
    // *****************************************************
    constructor(title, author) {
        let curTimeDate = this._getCurrentTimeDate()
        // Make sure the following order match the values defined in const fixedObjNo
        this._addObjectDocumentInformation(title, author, curTimeDate)
        this._addObjectDocumentCatalog()
        this._addObjectMetaData(curTimeDate, title)
        // this._add8FontObjects()
        this._addFontHelvetica()
        this._addFontHelveticaBold()
        this._addObjectPageTree()
        this._addObjectParentTree()
        this._addObjectStructTreeRoot()
        this._addStructElement('Document', 0, title)
        this.addPage()
    }

    addPage() {
        this._finalizeCurPage()
        // Page contents object
        this._addObjectPageContents()
        this.objNoPageContents = this.objects.length
        // Page object
        this._addObjectPage(this.objNoPageContents, this.pageCount)
        this.objNoPage = this.objects.length
        // Update page tree object
        this._insertAtPlaceHolder(fixedObjNo.pageTree, placeHolder.kid, `${this.objNoPage} 0 R`)
        // Parent elements object
        this._addObjectParentElements()
        this.objNoParentElements = this.objects.length
        // Add to parent tree
        this._addParentElementsIntoParentTree(this.pageCount, this.objNoParentElements)
        // Adjust other variables
        this.pageCount++
        this.pageContents = ''
        this.nextMcid = 0
    }

    // The following function returns 
    //      false, if the element type or element level is invalid
    //      true, otherwise.
    // To add an element at the root level, set parentObjNo to 0
    // If textElements is present, the strings will be drawn as one marked content item.
    addElement(elementType, elementLevel, title, textElements = []) {
        if (elementLevel == 0) return false     // element level 0 (/Document) should only be called from the class constructor
        if (elementLevel > this.objNoLastElements.length) return false     // element level can only grow 1 at a time
        if (!this._validStructType(elementType)) return false
        this._addStructElement(elementType, elementLevel, title, textElements)
        return true
    }

    addArtifactText(textElements) {
        let pdfCommand = this._getDrawTextCommand(textElements)		
        this.pageContents += this._getArtifact(pdfCommand)
    }

    drawLine(penWidth, x1, y1, x2, y2) {
        let pdfCommand = this._getDrawLineCommand(penWidth, x1, y1, x2, y2)
        this.pageContents += this._getArtifact(pdfCommand)
    }

    drawRectangle(penWidth, x, y, dx, dy, filled) {
        let pdfCommand = this._getDrawRectangleCommand(penWidth, x, y, dx, dy, filled)
        this.pageContents += this._getArtifact(pdfCommand)
    }

    drawOval(penWidth, centerX, centerY, ovalWidth, ovalHeight, filled) {
        let pdfCommand = this._getDrawOvalCommand(penWidth, centerX, centerY, ovalWidth, ovalHeight, filled)
        this.pageContents += this._getArtifact(pdfCommand)
    }

    savePdf(fileName) {
        this._finalizeCurPage()
        this._finalizePdf()
        const bytes = new TextEncoder('windows-1252', { NONSTANDARD_allowLegacyEncoding: true })
            .encode(this._getFileContents());
        const blob = new Blob([bytes]);
        const fr = new FileReader();
        fr.readAsArrayBuffer(blob);
        saveAs(blob, fileName);    
    } 

    // *****************************************************
    // Functions to add each type of object
    // *****************************************************

    _addObjectDocumentInformation(title, author, now) {
        let curDateTime = now.year + now.month + now.day + now.hour + now.minute + now.second
        this._addObject(`<</Creator (IVS LLC)/Producer (IVS LLC)/Author (${author})` + 
            `/CreationDate (D:${curDateTime}-05'00')/ModDate (D:${curDateTime}-05'00')/Title (${title})>>`)
    }
    
    _addObjectDocumentCatalog() {
        this._addObject(`<</Type /Catalog/Version /1.7` + 
            `/Pages ${fixedObjNo.pageTree} 0 R` + 
            `/Lang (en-US)` + 
            `/Metadata ${fixedObjNo.metaData} 0 R` + 
            `/ViewerPreferences <</DisplayDocTitle true>>/MarkInfo <</Marked true>>` + 
            `/StructTreeRoot ${fixedObjNo.structTree} 0 R>>`)
    }

    _addObjectMetaData(now, title) {
        let curDateTime = now.year + '-' + now.month + '-' + now.day + 'T' + now.hour + ':' + now.minute + ':' + now.second 
        let meta = metadata.replace(placeHolder.dateTime, curDateTime).replace(placeHolder.title, title)
        this._addObject(`<</Type /Metadata/Subtype /XML/Length ${meta.length} >>\nstream\n${meta}endstream`)
    }

    _addObjectStructTreeRoot() {
        this._addObject(`<</Type /StructTreeRoot/ParentTreeNextKey ${placeHolder.nextKey}` + 
            `/ParentTree ${fixedObjNo.parentTree} 0 R/K [${fixedObjNo.structElemDocument} 0 R]>>`)
    }

    _addStructElement(elementType, elementLevel, title, textElements = []) {
        let objNoNewElement
        let objNoParent = (elementLevel == 0) ? fixedObjNo.structTree : this.objNoLastElements[elementLevel-1]

        if (textElements.length == 0) {
            objNoNewElement = this._addObjectStructTreeElement(elementType, objNoParent, title)
        } else {
            objNoNewElement = this._addObjectStructTreeElement(elementType, objNoParent, title, this.nextMcid)
            this.pageContents += `/${elementType} <</MCID ${this.nextMcid}>>\nBDC\n${this._getDrawTextCommand(textElements)}\nEMC\n`
            this._insertAtPlaceHolder(this.objNoParentElements, placeHolder.parent, `${objNoNewElement} 0 R`)
            this.nextMcid += 1
        }
        this._insertAtPlaceHolder(objNoParent, placeHolder.kid, `${objNoNewElement} 0 R`)
        // Adjust the objNoLastElements array
        while (elementLevel < this.objNoLastElements.length) {
            this.objNoLastElements.pop()
        }
        this.objNoLastElements.push(objNoNewElement)
    }

    _addObjectStructTreeElement(elementType, parentObjNo, title, mcid = -1) {
        let obj = `<</Type /StructElem/S /${elementType}/T (${title}) /P ${parentObjNo} 0 R /K `
        obj += (mcid < 0) ? `[${placeHolder.kid}]` : `${mcid} /Pg ${this.objNoPage} 0 R`
        this._addObject(obj + `>>`)
        return this.objects.length;
    }

    _addObjectParentTree() {
        this._addObject(`<</Nums [${placeHolder.kid}] >>`)
    }

    _addObjectParentElements() {
        this._addObject(`[${placeHolder.parent}]`)
    }

    _addObjectPageTree() {
        this._addObject(`<</Type /Pages /Kids [${placeHolder.kid}] /Count ${placeHolder.pageCount} >>`)
    }

    _addObjectPageContents() {
        this._addObject(`<</Length ${placeHolder.length} >>\nstream${placeHolder.contents}\nendstream`)
    }

    _addObjectPage(contentsObjNo, parentTreeKey) {
        this._addObject(`<</Type /Page /Parent ${fixedObjNo.pageTree} 0 R` + 
            `/Resources << /Font << /F0 ${fixedObjNo.f0Font} 0 R  /F1 ${fixedObjNo.f1Font} 0 R >> >>` +
            `/MediaBox [0 0 612 792] /Contents ${contentsObjNo} 0 R` +
            `/StructParents ${parentTreeKey} >>`)
    }

    _add8FontObjects() {
        this.objects.push(objF0Font + '\n')
        this.objects.push(objF0FontDescriptor + '\n')
        this.objects.push(objF0CidSet + '\n')
        this.objects.push(this._cleanupFontStream(objF0FontFile) + '\n')
        this.objects.push(objF1Font + '\n')
        this.objects.push(objF1FontDescriptor + '\n')
        this.objects.push(objF1CidSet + '\n')
        this.objects.push(this._cleanupFontStream(objF1FontFile) + '\n')
    }

    _addFontHelvetica() {
        this._addObject(`<</Type /Font /Subtype /Type1 /Name /F0 /BaseFont /Helvetica >>`) 
    }

    _addFontHelveticaBold() {
        this._addObject(`<</Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica-Bold >>`) 
    }

    // *****************************************************
    // Functions to draw PDF elements
    // *****************************************************

    _getDrawTextCommand(textElements) {
        let contents = `BT\n`
        textElements.forEach((text) => {
            let x = this._myX(text.x)
            let y = this._myY(text.y)
            contents += `/${text.fontCode} ${text.fontSize} Tf 1 0 0 1 ${x} ${y} Tm (${text.textString}) Tj\n`
        })
        return contents + `ET\n`
    }

    _getDrawLineCommand(penWidth, x1, y1, x2, y2) {
        x1 = this._myX(x1)
        y1 = this._myY(y1)
        x2 = this._myX(x2)
        y2 = this._myY(y2)
        return `${penWidth} w ${x1} ${y1} m ${x2} ${y2} l S\n`
    }

    _getDrawRectangleCommand(penWidth, x, y, width, height, filled) {
        x = this._myX(x)
        y = this._myY(y)
        let w = this._myX(width)
        let h = this._myX(height)
        let cmd = filled ? 'B' : 'S'
        return `${penWidth} w ${x} ${y} ${w} ${h} re ${cmd}`
    }

    _getDrawOvalCommand(penWidth, centerX, centerY, ovalWidth, ovalHeight, filled) {
        let x = this._myX(centerX)
        let y = this._myY(centerY)
        let w = this._myX(ovalWidth / 2)
        let h = this._myX(ovalHeight / 2)
        let w1 = 0.552 * w
        let h1 = 0.552 * h
        let cmd = filled ? 'B' : 'S'
        return `${penWidth} w ${x-w} ${y} m ` +
            `${x-w} ${y+h1} ${x-w1} ${y+h} ${x} ${y+h} c ` +
            `${x+w1} ${y+h} ${x+w} ${y+h1} ${x+w} ${y} c ` +
            `${x+w} ${y-h1} ${x+w1} ${y-h} ${x} ${y-h} c ` +
            `${x-w1} ${y-h} ${x-w} ${y-h1} ${x-w} ${y} c ` +
            `${cmd}\n`
    }

    // *****************************************************
    // Functions to adjust objects as the PDF is being built
    // *****************************************************
    
    _finalizeCurPage() {
        if (this.pageCount > 0) {
            let contents = `\n${this.pageContents}\n`
            // Finalize page contents object
            this._replacePlaceHolder(this.objNoPageContents, placeHolder.length, contents.length)
            this._replacePlaceHolder(this.objNoPageContents, placeHolder.contents, contents)
            // Finalize parent elements object
            this._clearPlaceHolder(this.objNoParentElements, placeHolder.parent)
        }
    }

    _finalizePdf() {
        // Clear all kid placeholders
        this.objects.forEach((obj, index) => this.objects[index] = obj.replace(placeHolder.kid, ''))
        // Finalize page tree object
        this._replacePlaceHolder(fixedObjNo.pageTree, placeHolder.pageCount, this.pageCount)
        // Finalize structure tree root object
        this._replacePlaceHolder(fixedObjNo.structTree, placeHolder.nextKey, this.pageCount)
    }

    _addParentElementsIntoParentTree(pageIndex, parentElementsObjNo) {
        let obj = this.objects[fixedObjNo.parentTree - 1]
        obj = obj.replace(placeHolder.kid, `${pageIndex} ${parentElementsObjNo} 0 R ${placeHolder.kid}`)
        this.objects[fixedObjNo.parentTree - 1] = obj
    }

    _addParentIntoParentElements(parentObjNo) {
        let obj = this.objects[this.objNoParentElements - 1]
        obj = obj.replace(placeHolder.parent, `${parentObjNo} 0 R ${placeHolder.parent}`)
        this.objects[this.objNoParentElements - 1] = obj
    }

    _getFileContents() {
        let fileContents = `%PDF-1.7\n%ÐÄÆ´ÎÅÔº±°®³®±®±\n`
        let offset = fileContents.length

        fileContents += this.objects.join('') +
            `xref\n0 ${this.objects.length+1}\n0000000000 65535 f\n`

        this.objects.forEach((obj) => {
            fileContents += this._padleft(offset, 10) + ' 00000 n\n'
            offset += obj.length
        })

        fileContents += `trailer\n` +
            `<</Size ${this.objects.length+1}\n/Root ${fixedObjNo.docCatalog} 0 R\n` + 
            `/Info ${fixedObjNo.docInfo} 0 R` +
            `>>\n` +
            `startxref\n` +
            `${offset}\n` +
            `%%EOF\n`

        return fileContents
    }

    // *****************************************************
    // Other utility functions
    // *****************************************************

    _getCurrentTimeDate() {
        let curDateTime = new Date();
        return {
            year: curDateTime.getFullYear(),
            month: this._padleft(curDateTime.getMonth() + 1, 2),
            day: this._padleft(curDateTime.getDate(), 2),
            hour: this._padleft(curDateTime.getHours(), 2),
            minute: this._padleft(curDateTime.getMinutes(), 2),
            second: this._padleft(curDateTime.getSeconds(), 2)
        }
    }

    _padleft(str, len) {
        str = ('0'.repeat(len) + str)
        return str.substring(str.length - len)
    }

    _addObject(obj) {
        obj = `${this.objects.length + 1} 0 obj\n${obj}\nendobj\n`
        this.objects.push(obj)
    }

    _validStructType(typeName) {
        for (const property in elementType) {
            if (elementType[property] == typeName) return true
        }
        return false
    }

    _myX(x) {
        let myX = Math.round(x * 7.2) / 10.0   // Multiply x by .72 & round to 1 decimal
        return myX
    }

    _myY(y) {
        // Similar to _myX, but reverse y direction w/ origin at upper left corner
        let myY = 792 - Math.round(y * 7.2) / 10.0 
        return myY
    }

    _clearPlaceHolder(objNo, targetPlaceHolder) {
        this.objects[objNo - 1] = this.objects[objNo - 1].replace(targetPlaceHolder, '')
    }

    _replacePlaceHolder(objNo, targetPlaceHolder, stringToReplace) {
        this.objects[objNo - 1] = this.objects[objNo - 1].replace(targetPlaceHolder, stringToReplace)        
    }

    _insertAtPlaceHolder(objNo, targetPlaceHolder, stringToInsert) {
        this.objects[objNo - 1] = this.objects[objNo - 1].replace(targetPlaceHolder, stringToInsert + ' ' + targetPlaceHolder)
    }

    _isStructElementObject(objNo) {
        let obj = String(this.objects[objNo - 1])
        return (obj.includes('/Type /StructElem') > 0)
    }

    _getArtifact(pdfCommand) {
        return `/Artifact <</Type /Layout>>\nBDC\n${pdfCommand}\nEMC\n`
    }

    _cleanupFontStream(obj) {
        return obj.replaceAll("TILDE", "`").replaceAll("BACK","\\")
                .replaceAll("SPECIAL","${").replaceAll("CARRIAGE","\r");
    }
}
