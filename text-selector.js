function getContiniousStrAt(str, charNumber, goodSymbol) {
    let part1 = ''
    let part2 = ''
    for (let i = charNumber; i < str.length; i++) {
        if (!goodSymbol.test(str[i]))
            break
        part2 += str[i]
    }
    for (let i = charNumber - 1; i >= 0; i--) {
        if (!goodSymbol.test(str[i]))
            break
        part1 = str[i] + part1
    }   
    return part1 + part2
}


function getTextInfo(x, y, doc) {
    let range
    let textNode
    let offset
    if (doc.caretPositionFromPoint) {
        range = doc.caretPositionFromPoint(x, y)
        textNode = range.offsetNode
        offset = range.offset
    } else if (doc.caretRangeFromPoint) {
        // Use WebKit-proprietary fallback method
        range = doc.caretRangeFromPoint(x, y)
        textNode = range.startContainer
        offset = range.startOffset
    }

    if (textNode?.nodeType === 3)
        return [textNode, offset]
    return [null, null]
}


function getWord(x, y, doc) {
    const [textNode, offset] = getTextInfo(x, y, doc)
    if (!textNode) return ''
    const goodSymbol = RegExp(/\p{L}|-|'|`|’/, 'u') //TODO: а иероглифы всякие
    return getContiniousStrAt(textNode.data, offset, goodSymbol)
}

function getSentence(x, y, doc) {
    const [textNode, offset] = getTextInfo(x, y, doc)
    if (!textNode) return ''
    const goodSymbol = RegExp(/[^.!?]/, 'u')
    return getContiniousStrAt(textNode.data, offset, goodSymbol)
}

export function setOnTextChosenCallback(func) {
    onTextChosen = func
}

var onTextChosen = (word, event) => {console.log(word)}
var cancelClick = false
export function SetTranslateEventListeners(doc) {
    const body = doc.getElementsByTagName("body")[0]
    //TODO: тач
    body.addEventListener("click", (event) => {
        // console.log(event.detail)
        cancelClick = true
        if (event.detail == 1) {
            cancelClick = false
            setTimeout(() => {
                if (cancelClick) return
                const selectedString = doc.getSelection().toString() 
                if (selectedString.length === 0)
                    onTextChosen(getWord(event.clientX, event.clientY, doc), event)
                else
                    onTextChosen(selectedString, event)
            }, 200) //TODO: соригинальничать
        }

        else {
            onTextChosen(getSentence(event.clientX, event.clientY, doc), event)
        }
    })
}