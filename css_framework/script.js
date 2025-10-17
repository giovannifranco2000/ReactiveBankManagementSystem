window.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".hoverable").forEach((element) => {

        element.addEventListener("mouseenter", (event) => {
            elementHeight = event.target.offsetHeight;
            event.target.style.height = (elementHeight * 1.2).toString() + "px";
        });

        element.addEventListener("mouseleave", (event) => {
            elementHeight = event.target.offsetHeight;
            event.target.style.height = (elementHeight / 1.2).toString() + "px";
        })
        
    });

});