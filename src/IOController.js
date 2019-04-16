/**
 * The IOController controls the input of keys/controller data to the manager.
 */
function initialize() {
    document.onkeydown = function (e) {
        switch (String.fromCharCode(e.keyCode)) {
            case 'W':
                layer3Generator.movePlayer('UP');
                break;
            case 'A':
                layer3Generator.movePlayer('LEFT');
                break;
            case 'S':
                layer3Generator.movePlayer('DOWN');
                break;
            case 'D':
                layer3Generator.movePlayer('RIGHT');
                break;
            case 'I':
                inspect();
                break;
        }
    };
}

window.addEventListener('load', initialize);