const VALID_KEYBOARD_KEY = {
    "0": Symbol("0"),
    "1": Symbol("1"),
    "2": Symbol("2"),
    "3": Symbol("3"),
    "4": Symbol("4"),
    "5": Symbol("5"),
    "6": Symbol("6"),
    "7": Symbol("7"),
    "8": Symbol("8"),
    "9": Symbol("9"),
    "*": Symbol("*"),
    "-": Symbol("-"),
    "/": Symbol("/"),
    "+": Symbol("+"),
    "%": Symbol("%"),
    ".": Symbol("."),
}

function GetLastLetterFromPos(pos) {
    return result.value.slice(pos - 1, pos)
}

function GetLastNumberFromPos(pos) {
    let start = 0
    let end = result.value.length

    for(let i = pos; i < result.value.length; i++) {
        let letter = result.value[i]
        
        if(IsAlpha(letter) && letter !== ".") {
            end = i
            break
        }
    }

    for(let i = pos; i > 0; i--) {
        let letter = result.value[i - 1]
        
        if(IsAlpha(letter) && letter !== ".") {
            start = i
            break
        }
    }

    return result.value.slice(start, end)
}

function GetLastExpFromPos(pos) {
    let start = 0
    let end = result.value.length

    for(let i = pos; i < result.value.length; i++) {
        let letter = result.value[i]
        
        if(!IsValidExpExpr(letter)) {
            end = i
            break
        }
    }

    for(let i = pos; i > 0; i--) {
        let letter = result.value[i - 1]
        
        if(!IsValidExpExpr(letter)) {
            start = i
            break
        }
    }

    return result.value.slice(start, end)
}

function ValidateKeyboardInput(input, pos) {
    let lastLetter = GetLastLetterFromPos(pos)

    // If the letter (char) cannot be a exponent AND
    // the last letter is not a number AND
    // the input is not the backspace sign AND
    // the input is not the exponent sign.
    // Then set the writing mode to normal
    if(!IsCharCanBeExp(input) &&
        !IsNum(lastLetter) &&
        input !== "⇍" &&
        input !== "x²") {
        writingMode = WRITING_MODE.normal
    }

    // If the input is a dot and there is already a dot in the last number then do not validate the input
    // Remember that input is indenpendant of writing mode.
    if(input === ".") {
        if(writingMode === WRITING_MODE.normal && GetLastNumberFromPos(pos).includes(".") || 
           writingMode === WRITING_MODE.exp && GetLastExpFromPos(pos).includes("·")
        ) {
            return false
        }
    }

    if(writingMode == WRITING_MODE.normal && IsAlpha(input) && IsExp(lastLetter)) {
        return true
    }

    if(IsAlpha(input) && lastLetter === "%") {
        return true
    }

    // If the input is a letter AND the last letter is a alpha OR
    // the input is a letter AND the input display is empty OR
    // the input is a number AND the last letter from the display is a percent
    // Then do not allow the input 
    if(IsAlpha(input) && IsAlpha(lastLetter) && !IsValidExpExpr(lastLetter) ||
       IsNum(input) && lastLetter === "%") {
        return false
    }

    return true
}

// Get the valid key from the keyboard input. Will return null if key is invalid
function GetValidKey(key) {
    for(let validKey in VALID_KEYBOARD_KEY) {
        // If we find the key and if we are in the normal writing mode then allow the input
        if(key === validKey) {
            return key
        }
    }

    return null
}

function RefreshWrintingMode(index) {
    let lastLetter = GetLastLetterFromPos(index)
    if(IsValidExpExpr(lastLetter)) {
        writingMode = WRITING_MODE.exp
    } else {
        writingMode = WRITING_MODE.normal
    }
}

function OnInput(event) {
    if(event.key === "ArrowLeft" || event.key === "ArrowRight") {
        let index = 0

        if(event.key === "ArrowLeft") {
            index = result.selectionStart - 1
        } else {
            index = result.selectionStart + 1
        }

        RefreshWrintingMode(index)
        return
    }

    if(event.key === "c" && event.control || event.key === "v" && event.control) {
        return
    }

    // if the key pressed is backspace.
    if(event.key === "Backspace") {
        // If the input is equal to "Infinity" then clear everything. Else remove the last letter
        if(result.value === "Infinity" || result.value == "NaN" || result.value.length === 1) {
            Clear()
            return event.preventDefault()
        }

        RefreshWrintingMode(result.selectionStart - 1)
        return
    }

    // If the key is Enter then do the operation
    if(event.key === "Enter" || event.key === "=") {
        return Equal()
    }

    // If the input is the keyboard exponent sign then activate exponent mode
    if(event.key === "²") {
        Exp()
        return event.preventDefault()
    }

    let validKey = GetValidKey(event.key)

    if(validKey) {
        // If the input is not valid. Then do not allow the input to spread to the display
        if(!ValidateKeyboardInput(event.key, result.selectionStart)) {
            return event.preventDefault()
        }

        // However if we are in the exponent mode and the input is a valid exponent key
        if(writingMode === WRITING_MODE.exp && IsCharCanBeExp(validKey)) {
            // Get the position of the input cursor
            let selectionStart = result.selectionStart
            // Get the beggining input display from input cursor
            let begin = result.value.slice(0, selectionStart)
            // Get the end input display from the input cursor
            let end = result.value.slice(selectionStart)

            // Reconstruct the input display and place the exponent character
            result.value = begin + FromNumToExp(event.key) + end
            // Set the cursor to the front of the last know position (by default the cursor is gonna go the end of the display)
            result.setSelectionRange(selectionStart + 1, selectionStart + 1)
            // Since we change the selection range. We also need to set the scroll the end
            result.scrollLeft = result.scrollWidth

            // Prevent the original input to spread to the end
            event.preventDefault()
        }
    } else {
        event.preventDefault()
    }
}