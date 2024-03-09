// Global input (is local to this file)
let input = ""

function HandleNum(){
    let data = ""
    
    // If the input is a number and the input is a dot 
    // then register the input and delete the first character from the input
    while(IsNum(input[0]) || input[0] == ".") {
        data += input[0]
        Flush()
    }

    return data
}

function HandleExp(){
    let data = ""
    
    // If the input is a valid exponent expression 
    // then register the input and delete the first character from the input
    while(IsValidExpExpr(input[0])) {
        data += input[0]
        Flush()
    }

    return data
}

// All the possible type of data supported
const INPUT_TYPE = {
    // A basic number
    Literal: Symbol("Literal"),
    // +-/* operator
    Operand: Symbol("Operand"),
    // % operator
    Percent: Symbol("Percent"),
    // ² operator
    Power: Symbol("Power"),
    // √ operator
    Sqrt: Symbol("Sqrt"),
    // ⅟ operator
    DivideByOne: Symbol("DivideByOne")
}

// Remove the first character from the input
function Flush() {
    input = input.slice(1)
}

function CreateInput(inputType, input) {
    return {
        inputType,
        input
    }
}

function CreateExponent(exp, input) {
    return {
        inputType: INPUT_TYPE.Power,
        exp,
        input
    }
}

function Lexer(entry) {
    let result = []

    input = entry.trim()

    while(input.length > 0) {
        if(IsNum(input[0])) {
            result.push(CreateInput(INPUT_TYPE.Literal, HandleNum()))
        }
        if(IsValidExpExpr(input[0])) {
            result.push(CreateInput(INPUT_TYPE.Power, HandleExp()))
        }
        if(input[0] === "√") {
            result.push(CreateInput(INPUT_TYPE.Sqrt, null))
        }
        if(input[0] === "⅟") {
            result.push(CreateInput(INPUT_TYPE.DivideByOne, null))
        }
        if(input[0] == "%") {
            result.push(CreateInput(INPUT_TYPE.Percent, null))
        }
        if(input[0] === '+' || input[0] === '-' || input[0] === '*' || input[0] === '÷') {
            let operand = input[0]

            // If the operand is a divider sign. Then just change it to the divide js sign
            if(operand === "÷") {
                operand = "/"
            }

            result.push(CreateInput(INPUT_TYPE.Operand, operand))
        }

        
        Flush()
    }
    
    return result
}

// Process will format and assiociate all the data from the lexer to a more constructed form
function Process(entry) {
    let lexer = Lexer(entry)
    let processed = []

    while(lexer.length > 0) {
        let data = lexer[0]
        switch(data.inputType) {
            // Assiociate the number in front of the DivideByOne argument and create the input. Then remove those 2 from the lexer
            case INPUT_TYPE.DivideByOne:
                processed.push(CreateInput(data.inputType, lexer[1]))
                lexer = lexer.slice(2)
                break
            // Assiociate the number in front of the Sqrt argument and create the input. Then remove those 2 from the lexer
            case INPUT_TYPE.Sqrt:
                processed.push(CreateInput(data.inputType, lexer[1]))
                lexer = lexer.slice(2)
                break
            // Assiociate the Power argument to the last processed number and then remove the number from the processed list
            // Also remove the Power argument from the lexer
            case INPUT_TYPE.Power:
                let lastPower = processed.pop();
                processed.push(CreateExponent(data.input, lastPower))
                lexer = lexer.slice(1)
                break
            // Assiociate the Percent argument to the last processed number and then remove the number from the processed list
            // Also remove the Percent argument from the lexer 
            case INPUT_TYPE.Percent:
                let lastPercent = processed.pop();
                processed.push(CreateInput(data.inputType, lastPercent))
                lexer = lexer.slice(1)
                break
            // If any of the above condition did not proc then just put the data unprocessed and remove it from the lexer 
            default:
                processed.push(CreateInput(data.inputType, data.input))
                lexer = lexer.slice(1)
                break
        }
    }

    return processed
}

// This is where we create the string to be evaluate by js
// The process of evaluation could have been done better by making the computation yourself.
// Or using a library.
// But it's more difficult and i wanted it to be full vanilla. It's also not the point of this project
function Evaluate(entry) {
    let processed = Process(entry)
    let jstr = ""

    while(processed.length > 0) {
        let data = processed[0]

        // Evaluate the result if needed and then add it as a string to the js string
        switch(data.inputType) {
            case INPUT_TYPE.DivideByOne:
                jstr += `${1 / data.input.input}`
                break
            case INPUT_TYPE.Sqrt:
                jstr += Math.sqrt(data.input.input).toString()
                break
            case INPUT_TYPE.Percent:
                jstr += `${1 * (data.input.input / 100)}`
                break
            case INPUT_TYPE.Power:
                jstr += Math.pow(data.input.input, FromExpToNum(data.exp)).toString()
                break
            default:
                jstr += data.input
                break
        }
        // Remove the processed input
        processed = processed.slice(1)
    }
    
    return eval(jstr)
}