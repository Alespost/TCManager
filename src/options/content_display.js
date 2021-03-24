"use strict";

function displayContent()
{
    document.title = localizedMessage('options_title');
    displayHeaders();
    displayTableContent();
}

function displayHeaders() {
    document.getElementById('options_header').innerText = localizedMessage('options_header');
}

function displayTableContent() {
    document.getElementById('purposes_header').innerText = localizedMessage('purposes_header');
    document.getElementById('special_features_header').innerText = localizedMessage('special_features_header');
    document.getElementById('global_header').innerText = localizedMessage('options_global');

}