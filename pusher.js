// This script will be called in the first line of body tag.
// This script will push the common elements required by every html page
// <head> element will automatically be appended with meta favicon tags and descriptions
// header and footer will reqire divs with id 'navbar' & 'footer'
// To add the SIde Clip typeform use a div with id 'typeformSideClip'
// <script src="//embed.typeform.com/next/embed.js"></script>
// enter typeform url in url


const url = '//embed.typeform.com/next/embed.js';

function headWriter(){
    fetch('https://godwinausten.org/commonElements/head.html')
        .then(response => response.text())
        .then(text => {
            const container = document.createElement('div');
            container.innerHTML = text;
            const headNodes = Array.from(container.children);
            headNodes.forEach(node => document.head.appendChild(node));
        })
        .catch(error => console.log(error))
};

function navbarWriter(){
    fetch('/commonElements/navbar.html')
    .then(response => response.text())
    .then(text => {
        const container = document.getElementById('navbar');
        container.innerHTML = text;
    })
    .catch(error => console.log(error))
};

function footerWriter(){
    fetch('https://godwinausten.org/commonElements/footer.html')
    .then(response => response.text())
    .then(text => {
        const container = document.getElementById('footer');
        container.innerHTML = text;
    })
    .catch(error => console.log(error))
};

function typeformSideClip(){
    fetch('https://godwinausten.org/commonElements/typeformSideClip.html')
    .then(response => response.text())
    .then(text => {
        const container = document.getElementById('typeformSideClip');
        container.innerHTML = text;
    })
    .catch(error => console.log(error))

};

function typeformScript(url){

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = onLoad => console.log('tf script injected in body');
    script.onerror = onError => console.log('tf script error' + onError);
    
    document.body.appendChild(script);

};

function loader(){
    document.getElementById('loader').style.display = 'none';
    document.getElementById('content').style.display = 'block';
};

function pusher(){

    headWriter();
    navbarWriter();
    footerWriter();
    typeformSideClip();
    typeformScript(url);
    setTimeout(loader, 3000);

};

document.addEventListener('DOMContentLoaded', pusher());