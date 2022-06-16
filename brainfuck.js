const delay = document.getElementById('delay');
const input = document.getElementById('input');
const output = document.getElementById('output');
const warning = document.getElementById('warning');


const sleep = ms => new Promise(r => setTimeout(r, ms));
let running = false;
let pause = false;
let pointer = 0;
let position = 0;

document.getElementById('start').addEventListener('click', async (e) => {
    if (running) return;
    running = true;
    reset();

    var code = input.value;

    while (position < code.length && running) {
        while (pause) await sleep(0);
        let memory = document.getElementById('m' + pointer);

        input.selectionEnd = position;
        input.selectionStart = position;
        input.blur();
        input.focus();
        input.selectionEnd = position + 1;

        warning.textContent = "No warnings";

        if (![">", "<", "+", "-", "[", "]", ",", "."].includes(code[position])) {
            position++;
            continue;
        }

        if (code[position] === ">") movePointer(1);
        if (code[position] === "<") movePointer(-1);

        if (code[position] === "+") {
            memory.textContent = Number(memory.textContent) + 1;
            if (Number(memory.textContent) > 255) memory.textContent = 0;
        }
        if (code[position] === "-") {
            memory.textContent = Number(memory.textContent) - 1;
            if (Number(memory.textContent) < 0) memory.textContent = 255;
        } 

        if (code[position] === "[") {
            if (memory.textContent == 0) {
                const pos = position + 1;
                let cb = 0;
                while (code[position] !== "]" || cb != 1) {
                    if (code[position] === "[") cb++;
                    if (code[position] === "]") cb--;

                    position++;
                    if (position > code.length) {
                        warning.textContent = "[ bracket at position " + pos + " has no sister to jump towards!";
                        return running = false;
                    }
                }
            }
        }
        if (code[position] === "]") {
            if (memory.textContent != 0) {
                const pos = position + 1;
                let cb = 0;
                while (code[position] !== "[" || cb != 1) {
                    if (code[position] === "]") cb++;
                    if (code[position] === "[") cb--;
                    
                    position--;
                    if (position < 0) {
                        warning.textContent = "] bracket at position " + pos + " has no sister to jump back to!";
                        return running = false;
                    }
                }
            }
        }

        if (code[position] === ",") {
            try { memory.textContent = prompt("Input Character").charCodeAt(0); }
            catch { memory.textContent = 0 }
        }
        if (code[position] === ".") {
            output.value += String.fromCharCode(Number(memory.textContent));
            output.scrollTop = output.scrollHeight;
        }

        position++;
        await sleep(10 * delay.value);
    }

    return running = false;
});

document.getElementById('pause').addEventListener('click', pauseF);

function pauseF() {
    pause = !pause;
    if (pause) document.getElementById('pause').textContent = "Continue";
    else document.getElementById('pause').textContent = "Pause";
}

function movePointer(i) {
    document.getElementById('m' + pointer).style.backgroundColor = "black";
    document.getElementById('m' + pointer).style.color = "white";
    document.getElementById('m' + pointer).style.borderColor = "rgb(44, 44, 77)";

    pointer += i;

    var array = document.getElementsByClassName('membox');
    if (pointer >= array.length) document.getElementById('membank').innerHTML += '<div class="membox" id="m' + pointer + '">0</div>';
    if (pointer < 0) pointer = array.length - 1;

    document.getElementById('m' + pointer).style.backgroundColor = "white";
    document.getElementById('m' + pointer).style.color = "black";
    document.getElementById('m' + pointer).style.borderColor = "black";
}

function reset() {
    position = 0;
    if (pause) pauseF();
    while (pointer > 0) movePointer(-1);

    const array = document.getElementsByClassName('membox');
    for (var i = 0; i < array.length; i++) array[i].textContent = "0";
    output.value = "";
}

function changeDelay() { document.getElementById('delayA').textContent = document.getElementById('delay').value / 100 + "s delay"; }

// IDE manager
input.addEventListener('keydown', (e) => {
    const validKeys = ["[", "]", "+", "-", ".", ",", "<", ">"]

    const code = input.value;
    const pos = input.selectionStart;

    if (validKeys.includes(e.key)) {
        if (!( [ undefined, " ", "\n", e.key ].includes(code[pos - 1]))) {
            input.value = code.slice(0, pos + 1) + " " + code.slice(pos + 1);
            input.selectionStart = input.selectionEnd = pos + 1;
        }

        if (e.key === "[") {
            input.value = code.slice(0, pos) + "]" + code.slice(pos);
            input.selectionStart = input.selectionEnd = pos;
        }
    }

    if (e.key === "Enter") {
        e.preventDefault();

        let j = pos - 1;
        let spaceCount = 0;
        while (![undefined, "\n"].includes(code[j])) {
            if (code[j] === " ") spaceCount++;
            else spaceCount = 0;
            j--;
        }
        let string = " ".repeat(spaceCount);
        let newTab = 0;
        if (code[pos - 1] === "[") {
            string = "  " + string + "\n" + " ".repeat(spaceCount);
            newTab = 2;
        }

        input.value = code.slice(0, pos) + "\n" + string + code.slice(pos);
        input.selectionStart = input.selectionEnd = pos + 1 + spaceCount + newTab;
    }
});

input.addEventListener('keydown', (e) => { running = false; });