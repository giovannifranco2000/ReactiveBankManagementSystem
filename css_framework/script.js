const root = document.documentElement;

function updateSizeUnit() {
    const vw = window.innerWidth / 100;
    const vh = window.innerHeight / 100;

    const vmin = Math.min(vw, vh);
    const vmax = Math.max(vw, vh);

    const size = (vmax / vmin) + (vmin / vmax);
    root.style.setProperty("--self-contained-size-unit", size + "px");
}

let resizeTimer;
const THROTTLE_TIME_MS = 100;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateSizeUnit();
    }, THROTTLE_TIME_MS);
});

window.addEventListener("orientationchange", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateSizeUnit();
    }, THROTTLE_TIME_MS);
});

updateSizeUnit();

window.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".hoverable").forEach((element) => {

        // since width is fixed, will only make the element "jump"
        element.addEventListener("mouseenter", (event) => {
            let elementHeight = event.target.offsetHeight;
            event.target.style.height = (elementHeight * 1.2).toString() + "px";
        });

        // since width is fixed, will only make the element "jump"
        element.addEventListener("mouseleave", (event) => {
            let elementHeight = event.target.offsetHeight;
            event.target.style.height = (elementHeight / 1.2).toString() + "px";
        })

    });

    document.querySelectorAll(`[f-action="show-on-hover"]`).forEach((element) => {

        let id = element.getAttribute("f-target");
        let target = document.getElementById(id);
        target.style.display = "none";

        element.addEventListener("mouseenter", (event) => {
            target.style.display = "block";
        });

        target.addEventListener("mouseenter", (event) => {
            target.style.display = "block";
        });

        element.addEventListener("mouseleave", (event) => {
            target.style.display = "none";
        });

        target.addEventListener("mouseleave", (event) => {
            target.style.display = "none";
        });

    });

});