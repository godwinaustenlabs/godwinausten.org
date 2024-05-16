function writer(){

fetch('testMetaTags.html').then(response => response.text()).then(text => {


const container = document.createElement('div');
container.innerHTML = text;
const headChildNodes = Array.from(container.children);
headChildNodes.forEach(node => document.head.appendChild(node));

}
);
};

document.addEventListener('DOMContentLoaded', writer);