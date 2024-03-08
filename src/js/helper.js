const EXPONENT_NUMBER_MAP = {
    "0": "⁰",
    "1": "ⁱ",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹"
}

const EXPONENT_SPECIAL_MAP = {
    ".": "·"
}
// return true if it's a number
function IsNum(input) {
    return new RegExp("[0-9]").exec(input)
}

// Return true is it's a exponent number
function IsExp(input){
    return Object.values(EXPONENT_NUMBER_MAP).includes(input)
}

// REturn true if it's a exponent special character
function IsExpSpecial(input) {
    return Object.values(EXPONENT_SPECIAL_MAP).includes(input)
}

// Return true if it's a exponent special character OR a exponent number
function IsValidExpExpr(input) {
    return IsExp(input) || IsExpSpecial(input)
}

// return true if it's not a number
function IsAlpha(input) {
    return !IsNum(input)
}

// Return true if the character can be a exponent
function IsCharCanBeExp(input){
    return FromNumToExp(input) !== null
}

// Transform the character to a exponent if possible if it's possible. Else return null
function FromNumToExp(input) {
    let number = EXPONENT_NUMBER_MAP[input]
    let special = EXPONENT_SPECIAL_MAP[input]

    if(number) {
        return number
    } else if(special) {
        return special
    }

    return null
}

// Transform the character the a number if possible. Else return a empty string
function FromExpToNum(input) {
    let numStr = ""

    for(let singleDigit of input) {
        // Get all the values from exponent number map and find the number that exponent correspond to
        let numberIndex = Object.values(EXPONENT_NUMBER_MAP).findIndex((value) => value === singleDigit)
        // Get all the values from exponent special character map and find the number that exponent correspond to
        let specialIndex = Object.values(EXPONENT_SPECIAL_MAP).findIndex((value) => value === singleDigit)
    
        // Add it to the final result if the index returned is not -1
        if(numberIndex !== -1) { 
            numStr += Object.keys(EXPONENT_NUMBER_MAP)[numberIndex]
        } else if(specialIndex !== -1) {
            numStr += Object.keys(EXPONENT_SPECIAL_MAP)[specialIndex]
        }
    }

    return numStr
}