window.onload = function () {
    var publishStatus = 1;
    var statusSymbol = document.getElementById('publish-status-symbol');
    if (statusSymbol) {
        statusSymbol.remove();
    }
    if ([3, 4, 5].indexOf(publishStatus) !== -1) {
        statusSymbol = document.createElement('img');
        statusSymbol.setAttribute('src', './images/publish_status_' + publishStatus + '.svg');
        statusSymbol.setAttribute('id', 'publish-status-symbol');
        statusSymbol.setAttribute('width', '100');
        statusSymbol.style.position = 'absolute'; statusSymbol.style.left = '-3px';
        statusSymbol.style.top = '0';
        if (statusSymbol) {
            document.body.appendChild(statusSymbol);
        }
    }
}