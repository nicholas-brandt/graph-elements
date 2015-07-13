addEventListener("WebComponentsReady", () => {
    let app = document.querySelector("graphjs-app");
    if (!app.nodes) app.nodes = [{
        x: 100,
        y: 100,
        radius: 50
    }, {
        x: 200,
        y: 100,
        radius: 25
    }, {
        x: 200,
        y: 200,
        radius: 30
    }];
});