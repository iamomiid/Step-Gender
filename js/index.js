const alertElement = document.getElementById('alert')
const submitElement = document.getElementById('submit')
const saveElement = document.getElementById('save')
const textInput = document.getElementById('text')
const radioElements = document.getElementsByName('gender')
const clearChoiceElement = document.getElementById('clear-choice')
const genderPredictionElement = document.getElementById('gender-prediction')
const genderAccuracyElement = document.getElementById('gender-accuracy')
const answerElement = document.getElementById('answer')
const clearAnswerElement = document.getElementById('answer-clear')

/**
 * Shows alert popup
 * @param {string} text 
 */
const showAlert = (text) => {
    alertElement.innerText = text;
    alertElement.classList.remove('hidden')

    setTimeout(() => {
        alertElement.classList.add('hidden')
    }, 5000)
}

/**
 * Return current selection of radio buttons
 * @returns null or selection
 */
const getSelection = () => {
    for (const item of radioElements) {
        if (item.checked) {
            return item.value;
        }
    }
    return null
}

/**
 * Applies the response to multiple elements
 * @param {PredictionResponse} data 
 */
const applyPrediction = (data) => {
    genderPredictionElement.innerText = data.gender;
    genderAccuracyElement.innerText = data.probability;

    for (const item of radioElements) {
        if (item.value === data.gender) {
            item.checked = true;
        }
    }
}

/**
 * Retrieves data from localstorage
 * @returns current saved data
 */
const getData = () => {
    const data = window.localStorage.getItem("db")

    if (!data) {
        return {}
    }

    return JSON.parse(data)
}

/**
 * Clears selected radio button
 */
const clearChoiceHandler = () => {
    for (const item of radioElements) {
        item.checked = false;
    }
}

/**
 * Gets data from api or localstorage and prints out data
 * @param {MouseEvent} e 
 * @returns 
 */
const submitHandler = async (e) => {
    e.preventDefault();
    answerElement.classList.add('hidden')
    clearChoiceHandler()
    const name = textInput.value;
    const data = getData();

    if (!/^[a-zA-Z\s]*$/.test(name)) {
        showAlert('Bad character is given. Change input.')
        return;
    }

    if (data[name]) {
        applyPrediction(data[name])
        answerElement.classList.remove('hidden')
        return
    }

    try {
        const res = await fetch(`https://api.genderize.io/?name=${name}`).then(v => v.json())

        if (res.gender === null) {
            showAlert("Failed to get gender. Try entering manually")
            return;
        }

        return applyPrediction(res)
    } catch (error) {
        showAlert("Some error happened. Try again")
        console.error(error)
    }
}

/**
 * Saves data to localstorage
 * @param {MouseEvent} e 
 * @returns 
 */
const saveHandler = (e) => {
    e.preventDefault();
    answerElement.classList.add('hidden')
    const selection = getSelection();
    const name = textInput.value;

    if (selection === null) {
        showAlert("You should enter gender")
        return
    }

    const data = getData();

    if (genderPredictionElement.innerText !== selection) {
        genderAccuracyElement.innerText = '-'
        genderPredictionElement.innerText = selection
    }

    data[name] = { gender: selection, probability: genderAccuracyElement.innerText }
    window.localStorage.setItem("db", JSON.stringify(data))
    answerElement.classList.remove('hidden')
}

/**
 * Removes data from localstorage
 * @param {MouseEvent} e 
 */
const clearAnswerHandler = (e) => {
    e.preventDefault();
    const data = getData();
    const name = textInput.value;
    delete data[name]
    window.localStorage.setItem("db", JSON.stringify(data))
    answerElement.classList.add('hidden')
}

// Event Listeners
submitElement.addEventListener('click', submitHandler)
saveElement.addEventListener('click', saveHandler)
clearChoiceElement.addEventListener('click', clearChoiceHandler)
clearAnswerElement.addEventListener('click', clearAnswerHandler)