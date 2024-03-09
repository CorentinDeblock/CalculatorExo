const WRITING_MODE = {
    normal: Symbol("normal"),
    exp: Symbol("exp")
}

// Max css display 
// 1.761050914342067e+308 (22)

// Get all the buttons
let result = document.getElementById("result")
let buttons = document.getElementsByName("calc-button")

// Add the on click event on non automatic assiocated buttons
document.getElementById("CE").addEventListener("click", RemoveLastNumber)
document.getElementById("C").addEventListener("click", Clear)
document.getElementById("remove").addEventListener("click", RemoveLastLetter)
document.getElementById("equal").addEventListener("click", Equal)
document.getElementById("plusorminus").addEventListener("click", PlusOrMinus)
document.getElementById("exp").addEventListener("click", Exp)

let powLight = document.getElementById("pow-light")

let writingMode = WRITING_MODE.normal

function RefreshLight() {
    if(writingMode == WRITING_MODE.normal) {
        powLight.classList.remove("pow-enabled")
        powLight.classList.add("pow-disabled")
    } else {
        powLight.classList.add("pow-enabled")
        powLight.classList.remove("pow-disabled")
    }
}

function Exp(){
    let lastNumber = GetLastNumber();
    let lastLetter = GetLastLetter();

    // Check if the last letter of the display is not a exponent expresion
    if(!IsValidExpExpr(lastLetter)) {
        // If the writing mode is normal then use exponent write mode. Else use normal write mode
        if(writingMode === WRITING_MODE.normal) {
            writingMode = WRITING_MODE.exp
        } else {
            writingMode = WRITING_MODE.normal
        }
    }

    // If there is input on the display. Then allow exponent write mode
    if(lastNumber != "") {
        writingMode = WRITING_MODE.exp
    }
    
    RefreshLight()
}

// Clear the input on the display. Then set the writing mode to normal and refresh the pow light 
function Clear(){
    result.value = ""
    writingMode = WRITING_MODE.normal
    RefreshLight()
}

// Remove the last letter and if the input on the display is empty set the writing mode to normal
function RemoveLastLetter() {
    result.value = result.value.slice(0, result.value.length - 1)

    if(result.value === "") {
        writingMode = WRITING_MODE.normal
        RefreshLight()
    }
}

function GetLastLetter(){
    return result.value.slice(result.value.length - 1)
}

// Plus or less function for the plus or less button
function PlusOrMinus(){
    // Remove the last number (exponent is also taken)
    let num = RemoveLastNumber()

    // After that. Get the last letter of the display (the letter just before the number)
    let lastLetter = GetLastLetter()

    // If the last letter is a minus then delete it. Else add it
    if(lastLetter === "-") {
        RemoveLastLetter();
    } else {
        result.value += "-"
    }

    result.value += num;
}

function GetLastNumber(){
    let number = "";

    // Store number from right to left (backward)
    for(let i = result.value.length; i > 0; i--) {
        let letter = result.value[i - 1]

        // Stop if the input is NaN, a dot or not a valid exponent expression
        if(IsAlpha(letter) && letter !== "." && !IsValidExpExpr(letter)) {
            break
        }
        number += letter
    }

    // Reserve it to be left to right (forward)
    number = number.split("").reverse().join("")

    return number
}

function GetLastExp(){
    let number = "";
    
    // Store exponent from right to left (backward)
    for(let i = result.value.length; i > 0; i--) {
        let letter = result.value[i - 1]

        // Stop if the input is a number or a exponent dot
        if(IsNum(letter) && letter !== "·") {
            break
        }
        number += letter
    }

    // Reserve it to be left to right (forward)
    number = number.split("").reverse().join("")

    return number
}

// Remove the last number on the result screen and return it
function RemoveLastNumber(){
    let number = GetLastNumber()

    // Remove the number from the result
    if(number != "") {
        // Save the display input
        let display = result.value
        // Remove the number from the display
        display = display.slice(0, display.length - number.length)
        // Refresh the input display
        result.value = display
    }

    return number
}

function RemoveLastExp(){
    let number = GetLastExp()

    // Remove the number from the result
    if(number != "") {
        // Save the display input
        let display = result.value
        // Remove the exponent from the display
        display = display.slice(0, display.length - number.length)
        // Refresh the input display
        result.value = display
    }

    return number
}

// Handle allow to position number from a argument (ex: *-$x -> 4 -> *-4)
function Handle(handler){
    // Get and remove the last number on the input display
    let number = RemoveLastNumber();
    // Get the operand from the handler
    let operand = handler.replace("$x", "");

    // If number is not empty AND the last letter is not the operand. Put the formated data on the input display. Else put the number back
    if(number != "" && GetLastLetter() != operand) {
        result.value += handler.replace("$x", number)
    } else if(GetLastLetter() === operand) {
        result.value += number
    }
}

function ValidateInput(input) {
    let lastLetter = GetLastLetter()

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
        if(writingMode === WRITING_MODE.normal && GetLastNumber().includes(".") || 
           writingMode === WRITING_MODE.exp && GetLastExp().includes("·")
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

    if(IsAlpha(input) && IsExpSpecial(lastLetter)) {
        return false
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

function RefreshDisplay(button) {
    return () => {
        if(!ValidateInput(button.innerText)){
            return
        }
        
        // If input is valid. Get the handle
        let handler = button.getAttribute("handler")
        // If the handler exist then proceed to handle it
        if(handler) {
            Handle(handler)
        }
        else {
            // Save the button inner text
            let data = button.innerText

            // If button input can be a exponent and the writing mode is on exponent. Then proceed to convert the input to a exponent input
            if(IsCharCanBeExp(button.innerText) && writingMode === WRITING_MODE.exp) {
                data = FromNumToExp(button.innerText)
            }

            // Add the data to the display
            result.value += data
        }
        
        RefreshLight()
    }
}

buttons.forEach(btn => {
    // Bind the click event on every button that do not have the nodisplay attribute
    if(!btn.hasAttribute("nodisplay")) {
        btn.addEventListener("click", RefreshDisplay(btn))
    }
})

result.addEventListener("keydown", (input) => {
    OnInput(input)
    RefreshLight()
})

function Equal(){
    if(IsNum(GetLastLetter()) || GetLastLetter() === "%" || IsExp(GetLastLetter())) {
        result.value = Evaluate(result.value)
        writingMode = WRITING_MODE.normal
    }
}