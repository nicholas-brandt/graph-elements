import GraphAddon from "../graph-addon/graph-addon.js";import require from "../../helper/require.js";import requestTimeDifference from "../../helper/requestTimeDifference.js";import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
export default class GraphTracker extends GraphAddon {
  constructor() {
    super();
    let _tracking_mode,
      _tracking_count,
      _tracking_initial_time;
    Object.defineProperties(this, {
      trackingMode: {
        get() {
          return _tracking_mode
        },
        set(tracking_mode) {
          switch (tracking_mode) {
            case "hiding":
              _tracking_mode = "hiding";
              break;case "normal":
              _tracking_mode = "normal";
              break;default:
              _tracking_mode = "adaptive";
          }
        },
        configurable: !0,
        enumerable: !0
      },
      trackingCount: {
        get() {
          return _tracking_count
        },
        set(tracking_count) {
          const parsed = parseFloat(tracking_count);
          if (!isNaN(parsed)) {
            _tracking_count = parsed
          }
        },
        configurable: !0,
        enumerable: !0
      },
      trackingInitialTime: {
        get() {
          return _tracking_initial_time
        },
        set(tracking_initial_time) {
          const parsed = parseFloat(tracking_initial_time);
          if (!isNaN(parsed)) {
            _tracking_initial_time = parsed
          }
        },
        configurable: !0,
        enumerable: !0
      }
    });
    this.trackingMode = this.getAttribute("tracking-mode");
    this.trackingCount = 30;
    this.trackingInitialTime = 10
  }
  async hosted() {
    console.log("graph-tracker: attach link in to host");
    const host = await this.host;
    host.shadowRoot.addEventListener("graph-structure-change", () => {
      try {
        this.__bindNodes(host)
      } catch (error) {
        console.error(error)
      }
    });this.__bindNodes(host)
  }
  __bindNodes(host) {
    console.log("graph-tracker: bind tracker to nodes");
    for (const [key, node] of host.nodes) {
      if (!node.hammer) {
        node.hammer = new Hammer(node.element)
      }
      if (!node.trackerInstalled) {
        node.trackerInstalled = !0;node.hammer.get("pan").set({
          direction: Hammer.DIRECTION_ALL
        });node.hammer.on("pan", this.__trackNode.bind(this, host, node));node.hammer.on("panstart", this.__trackStart.bind(this, host, node));node.hammer.on("panend", this.__trackEnd.bind(this, host, node));node.hammer.on("pancancel", this.__trackEnd.bind(this, host, node))
      }
    }
  }
  async __trackNode(host, node, event) {
    try {
      console.log("graph-tracker: node track event", event);
      node.x += event.deltaX - (node.__deltaX || 0);
      node.y += event.deltaY - (node.__deltaY || 0);
      node.__deltaX = event.isFinal ? 0 : event.deltaX;
      node.__deltaY = event.isFinal ? 0 : event.deltaY;await host.__requestBroadcast("graph-update");
      if ("adaptive" == this.trackingMode && !node.links_hidden) {
        const time_difference = await requestTimeDifference();
        node.trackingTime = (node.trackingTime * (this.trackingCount - 1) + time_difference) / this.trackingCount;
        if (17 < node.trackingTime && node.tracking) {
          console.log("graph-tracker: adaptively hiding links", time_difference);this.__hideLinks(host, node)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  __trackStart(host, node) {
    node.tracking = !0;
    node.trackingTime = this.trackingInitialTime;node.element.classList.add("tracking");
    if ("hiding" == this.trackingMode) {
      console.log("graph-tracker: normally hiding links");this.__hideLinks(host, node)
    }
  }
  __trackEnd(host, node) {
    node.tracking = !1;node.element.classList.remove("tracking");this.__unhideLinks(host, node)
  }
  __hideLinks(host, node) {
    console.log("graph-tracker: hide links");
    node.links_hidden = !0;
    for (const [source, target, link] of host.graph.edges()) {
      if (source == node.key || target == node.key) {
        if (link.element) {
          link.element.animate([{
            opacity: getComputedStyle(link.element).opacity
          }, {
            opacity: 0
          }], 250).addEventListener("finish", () => {
            link.element.style.visibility = "hidden"
          })
        }
      }
    }
  }
  __unhideLinks(host, node) {
    if (node.links_hidden) {
      node.links_hidden = !1;console.log("graph-tracker: unhiding links");
      for (const [source, target, link] of host.graph.edges()) {
        if (source == node.key || target == node.key) {
          link.element.style.visibility = "";
          if (link.element) {
            link.element.animate([{
              opacity: 0
            }, {
              opacity: getComputedStyle(link.element).opacity
            }], 500)
          }
        }
      }
    }
  }
}
(async() => {
  try {
    await require(["Hammer"]);await customElements.whenDefined("graph-display");customElements.define("graph-tracker", GraphTracker)
  } catch (error) {
    console.error(error)
  }
})();