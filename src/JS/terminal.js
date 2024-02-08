console.log = function () { 
    //dispatch to parent window
    //find file that called this function
    //find line number
    //send to parent window
    var stack = new Error().stack
    var caller = stack.split('\n')[1]
    var file = caller.split('/').pop()
    window.parent.postMessage(['console.log',file, ...arguments], '*')
}
console.error = function () {
    var stack = new Error().stack
    var caller = stack.split('\n')[1]
    var file = caller.split('/').pop()
    window.parent.postMessage(['console.error',file, ...arguments], '*')
}
console.warn = function () {
    var stack = new Error().stack
    var caller = stack.split('\n')[1]
    var file = caller.split('/').pop()
    window.parent.postMessage(['console.warn',file, ...arguments], '*')
}
console.info = function () {
    var stack = new Error().stack
    var caller = stack.split('\n')[1]
    var file = caller.split('/').pop()
    window.parent.postMessage(['console.info',file, ...arguments], '*')
}
console.debug = function () {
    var stack = new Error().stack
    var caller = stack.split('\n')[1]
    var file = caller.split('/').pop()
    window.parent.postMessage(['console.debug',file, ...arguments], '*')
}
console.trace = function () {
    var stack = new Error().stack
    var caller = stack.split('\n')[1]
    var file = caller.split('/').pop()
    window.parent.postMessage(['console.trace',file, ...arguments], '*')
}

console.clear = function () {
    window.parent.postMessage(['console.clear'], '*')
}

window.onerror = function (message, source, lineno, colno, error) {
    var stack = new Error().stack
    var caller = stack.split('\n')[1]
    var file = caller.split('/').pop()
    window.parent.postMessage(['console.error',file, message], '*')
}