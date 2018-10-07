export default
function fixCSSPart(graph_contextmenu) {
    graph_contextmenu.insertAdjacentHTML("beforeend", `<style><!-- inject: ./fixCSSPart.css --></style>`);
}