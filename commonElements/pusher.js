// This script will be called in the first line of body tag.
// This script will push the common elements required by every html page
// <head> element will automatically be appended with meta favicon tags and descriptions
// header and footer will reqire divs with id 'navbar' & 'footer'
// To add the SIde Clip typeform use a div with id 'typeformSideClip'


function headWriter(){
    fetch('/commonElements/head.html')
        .then(response => response.text())
        .then(text => {
            const container = document.createElement('div');
            container.innerHTML = text;
            const headNodes = Array.from(container.children);
            headNodes.forEach(node => document.head.appendChild(node));
        })
};

function navbarWriter(){
    fetch('/commonElements/navbar.html')
    .then(response => response.text())
    .then(text => {
        const container = document.getElementById('navbar');
        container.innerHTML = text;
    })
};

function footerWriter(){
    fetch('/commonElements/footer.html')
    .then(response => response.text())
    .then(text => {
        const container = document.getElementById('footer');
        container.innerHTML = text;
    })
};

function typeformSideClip(){
    fetch('/commonElements/typeformSideClip.html')
    .then(response => response.text())
    .then(text => {
        const container = document.getElementById('typeformSideClip');
        container.innerHTML = text;
    })

}

function pusher(){

    headWriter();
    navbarWriter();
    footerWriter();
    typeformSideClip();

};

document.addEventListener('DOMContentLoaded', pusher());