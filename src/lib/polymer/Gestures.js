/*
@license
Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/*
 * nicholas.brandt@mail.de
 * Modified version of polymer's gestures.html
 * */
const wrap = node => node;
// detect native touch action support
const HAS_NATIVE_TA = typeof document.head.style.touchAction === 'string';
const GESTURE_KEY = '__polymerGestures';
const HANDLED_OBJ = '__polymerGesturesHandled';
const TOUCH_ACTION = '__polymerGesturesTouchAction';
// radius for tap and track
const TAP_DISTANCE = 25;
const TRACK_DISTANCE = 5;
// number of last N track positions to keep
const TRACK_LENGTH = 2;
// Disabling "mouse" handlers for 2500ms is enough
const MOUSE_TIMEOUT = 2500;
const MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'click'];
// an array of bitmask values for mapping MouseEvent.which to MouseEvent.buttons
const MOUSE_WHICH_TO_BUTTONS = [0, 1, 4, 2];
const MOUSE_HAS_BUTTONS = (function() {
    try {
        return new MouseEvent('test', {
            buttons: 1
        }).buttons === 1;
    } catch (e) {
        return false;
    }
})();
// Check for touch-only devices
const IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);
// touch will make synthetic mouse events
// `preventDefault` on touchend will cancel them,
// but this breaks `<input>` focus and link clicks
// disable mouse handlers for MOUSE_TIMEOUT ms after
// a touchend to ignore synthetic mouse events
const mouseCanceller = function(mouseEvent) {
    // Check for sourceCapabilities, used to distinguish synthetic events
    // if mouseEvent did not come from a device that fires touch events,
    // it was made by a real mouse and should be counted
    // http://wicg.github.io/InputDeviceCapabilities/#dom-inputdevicecapabilities-firestouchevents
    const sc = mouseEvent.sourceCapabilities;
    if (sc && !sc.firesTouchEvents) {
        return;
    }
    // skip synthetic mouse events
    mouseEvent[HANDLED_OBJ] = {
        skip: true
    };
    // disable "ghost clicks"
    if (mouseEvent.type === 'click') {
        const path = Polymer.dom(mouseEvent).path;
        for (const part of path) {
            if (part === POINTERSTATE.mouse.target) {
                return;
            }
        }
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
    }
};

function setupTeardownMouseCanceller(setup) {
    for (const en of MOUSE_EVENTS) {
        if (setup) {
            document.addEventListener(en, mouseCanceller, true);
        } else {
            document.removeEventListener(en, mouseCanceller, true);
        }
    }
}

function ignoreMouse() {
    if (IS_TOUCH_ONLY) {
        return;
    }
    if (!POINTERSTATE.mouse.mouseIgnoreJob) {
        setupTeardownMouseCanceller(true);
    }
    const unset = function() {
        setupTeardownMouseCanceller();
        POINTERSTATE.mouse.target = null;
        POINTERSTATE.mouse.mouseIgnoreJob = null;
    };
    POINTERSTATE.mouse.mouseIgnoreJob = Polymer.Debounce(POINTERSTATE.mouse.mouseIgnoreJob, unset, MOUSE_TIMEOUT);
}

function hasLeftMouseButton(ev) {
    const type = ev.type;
    // exit early if the event is not a mouse event
    if (MOUSE_EVENTS.indexOf(type) === -1) {
        return false;
    }
    // ev.button is not reliable for mousemove (0 is overloaded as both left button and no buttons)
    // instead we use ev.buttons (bitmask of buttons) or fall back to ev.which (deprecated, 0 for no buttons, 1 for left button)
    if (type === 'mousemove') {
        // allow undefined for testing events
        let buttons = ev.buttons === undefined ? 1 : ev.buttons;
        if ((ev instanceof window.MouseEvent) && !MOUSE_HAS_BUTTONS) {
            buttons = MOUSE_WHICH_TO_BUTTONS[ev.which] || 0;
        }
        // buttons is a bitmask, check that the left button bit is set (1)
        return Boolean(buttons & 1);
    } else {
        // allow undefined for testing events
        const button = ev.button === undefined ? 0 : ev.button;
        // ev.button is 0 in mousedown/mouseup/click for left button activation
        return button === 0;
    }
}

function isSyntheticClick(ev) {
    if (ev.type === 'click') {
        // ev.detail is 0 for HTMLElement.click in most browsers
        if (ev.detail === 0) {
            return true;
        }
        // in the worst case, check that the x/y position of the click is within
        // the bounding box of the target of the event
        // Thanks IE 10 >:(
        const t = Gestures.findOriginalTarget(ev);
        const bcr = t.getBoundingClientRect();
        // use page x/y to account for scrolling
        const {
            pageX: x,
            pageY: y
        } = ev;
        // ev is a synthetic click if the position is outside the bounding box of the target
        return !((x >= bcr.left && x <= bcr.right) && (y >= bcr.top && y <= bcr.bottom));
    }
    return false;
}
const POINTERSTATE = {
    mouse: {
        target: null,
        mouseIgnoreJob: null
    },
    touch: {
        x: 0,
        y: 0,
        id: -1,
        scrollDecided: false
    }
};

function firstTouchAction(ev) {
    const path = Polymer.dom(ev).path;
    for (const n of path) {
        if (n[TOUCH_ACTION]) {
            return n[TOUCH_ACTION];
        }
    }
    return 'auto';
}

function trackDocument(stateObj, movefn, upfn) {
    stateObj.movefn = movefn;
    stateObj.upfn = upfn;
    document.addEventListener('mousemove', movefn);
    document.addEventListener('mouseup', upfn);
}

function untrackDocument(stateObj) {
    document.removeEventListener('mousemove', stateObj.movefn);
    document.removeEventListener('mouseup', stateObj.upfn);
    stateObj.movefn = null;
    stateObj.upfn = null;
}
const Gestures = {
    gestures: {},
    recognizers: [],
    deepTargetFind: function(x, y) {
        let node = document.elementFromPoint(x, y);
        let next = node;
        // this code path is only taken when native ShadowDOM is used
        // if there is a shadowroot, it may have a node at x/y
        // if there is not a shadowroot, exit the loop
        while (next && next.shadowRoot) {
            // if there is a node at x/y in the shadowroot, look deeper
            next = next.shadowRoot.elementFromPoint(x, y);
            if (next) {
                node = next;
            }
        }
        return node;
    },
    // a cheaper check than Polymer.dom(ev).path[0];
    findOriginalTarget: function(ev) {
        // shadowdom
        if (ev.path) {
            return ev.path[0];
        }
        // shadydom
        return ev.target;
    },
    handleNative: function(ev) {
        let handled;
        const type = ev.type;
        const node = wrap(ev.currentTarget);
        const gobj = node[GESTURE_KEY];
        if (!gobj) {
            return;
        }
        const gs = gobj[type];
        if (!gs) {
            return;
        }
        if (!ev[HANDLED_OBJ]) {
            ev[HANDLED_OBJ] = {};
            if (type.slice(0, 5) === 'touch') {
                const t = ev.changedTouches[0];
                if (type === 'touchstart') {
                    // only handle the first finger
                    if (ev.touches.length === 1) {
                        POINTERSTATE.touch.id = t.identifier;
                    }
                }
                if (POINTERSTATE.touch.id !== t.identifier) {
                    return;
                }
                if (!HAS_NATIVE_TA) {
                    if (type === 'touchstart' || type === 'touchmove') {
                        Gestures.handleTouchAction(ev);
                    }
                }
                // disable synth mouse events, unless this event is itself simulated
                if (type === 'touchend') {
                    POINTERSTATE.mouse.target = Polymer.dom(ev).rootTarget;
                    // ignore syntethic mouse events after a touch
                    ignoreMouse();
                }
            }
        }
        handled = ev[HANDLED_OBJ];
        // used to ignore synthetic mouse events
        if (handled.skip) {
            return;
        }
        const recognizers = Gestures.recognizers;
        // reset recognizer state
        for (const r of recognizers) {
            if (gs[r.name] && !handled[r.name]) {
                if (r.flow && r.flow.start.indexOf(ev.type) > -1 && r.reset) {
                    r.reset();
                }
            }
        }
        // enforce gesture recognizer order
        for (const r of recognizers) {
            if (gs[r.name] && !handled[r.name]) {
                handled[r.name] = true;
                r[type](ev);
            }
        }
    },
    handleTouchAction: function(ev) {
        const t = ev.changedTouches[0];
        const type = ev.type;
        if (type === 'touchstart') {
            POINTERSTATE.touch.x = t.clientX;
            POINTERSTATE.touch.y = t.clientY;
            POINTERSTATE.touch.scrollDecided = false;
        } else if (type === 'touchmove') {
            if (POINTERSTATE.touch.scrollDecided) {
                return;
            }
            POINTERSTATE.touch.scrollDecided = true;
            const ta = firstTouchAction(ev);
            let prevent = false;
            const dx = Math.abs(POINTERSTATE.touch.x - t.clientX);
            const dy = Math.abs(POINTERSTATE.touch.y - t.clientY);
            if (!ev.cancelable) {
                // scrolling is happening
            } else if (ta === 'none') {
                prevent = true;
            } else if (ta === 'pan-x') {
                prevent = dy > dx;
            } else if (ta === 'pan-y') {
                prevent = dx > dy;
            }
            if (prevent) {
                ev.preventDefault();
            } else {
                Gestures.prevent('track');
            }
        }
    },
    // automate the event listeners for the native events
    add: function(node, evType, handler) {
        // SD polyfill: handle case where `node` is unwrapped, like `document`
        node = wrap(node);
        const recognizer = this.gestures[evType];
        const deps = recognizer.deps;
        const name = recognizer.name;
        let gobj = node[GESTURE_KEY];
        if (!gobj) {
            node[GESTURE_KEY] = gobj = {};
        }
        for (const dep of deps) {
            // don't add mouse handlers on iOS because they cause gray selection overlays
            if (IS_TOUCH_ONLY && MOUSE_EVENTS.indexOf(dep) > -1) {
                continue;
            }
            let gd = gobj[dep];
            if (!gd) {
                gobj[dep] = gd = {
                    _count: 0
                };
            }
            if (gd._count === 0) {
                node.addEventListener(dep, this.handleNative);
            }
            gd[name] = (gd[name] || 0) + 1;
            gd._count = (gd._count || 0) + 1;
        }
        node.addEventListener(evType, handler);
        if (recognizer.touchAction) {
            this.setTouchAction(node, recognizer.touchAction);
        }
    },
    // automate event listener removal for native events
    remove: function(node, evType, handler) {
        // SD polyfill: handle case where `node` is unwrapped, like `document`
        node = wrap(node);
        const recognizer = this.gestures[evType];
        const deps = recognizer.deps;
        const name = recognizer.name;
        const gobj = node[GESTURE_KEY];
        if (gobj) {
            for (const dep of deps) {
                let gd = gobj[dep];
                if (gd && gd[name]) {
                    gd[name] = (gd[name] || 1) - 1;
                    gd._count = (gd._count || 1) - 1;
                    if (gd._count === 0) {
                        node.removeEventListener(dep, this.handleNative);
                    }
                }
            }
        }
        node.removeEventListener(evType, handler);
    },
    register: function(recog) {
        this.recognizers.push(recog);
        for (const emit of recog.emits) {
            this.gestures[emit] = recog;
        }
    },
    findRecognizerByEvent: function(evName) {
        for (const r of this.recognizers) {
            for (const n of r.emits) {
                if (n === evName) {
                    return r;
                }
            }
        }
        return null;
    },
    // set scrolling direction on node to check later on first move
    // must call this before adding event listeners!
    setTouchAction: function(node, value) {
        if (HAS_NATIVE_TA) {
            node.style.touchAction = value;
        }
        node[TOUCH_ACTION] = value;
    },
    fire: function(target, type, detail) {
        const ev = new CustomEvent(type, {
            detail,
            bubbles: true,
            cancelable: true
        });
        target.dispatchEvent(ev);
        // forward `preventDefault` in a clean way
        if (ev.defaultPrevented) {
            const preventer = detail.preventer || detail.sourceEvent;
            if (preventer && preventer.preventDefault) {
                preventer.preventDefault();
            }
        }
    },
    prevent: function(evName) {
        const recognizer = this.findRecognizerByEvent(evName);
        if (recognizer.info) {
            recognizer.info.prevent = true;
        }
    },
    /**
     * Reset the 2500ms timeout on processing mouse input after detecting touch input.
     *
     * Touch inputs create synthesized mouse inputs anywhere from 0 to 2000ms after the touch.
     * This method should only be called during testing with simulated touch inputs.
     * Calling this method in production may cause duplicate taps or other gestures.
     *
     * @method resetMouseCanceller
     */
    resetMouseCanceller: function() {
        if (POINTERSTATE.mouse.mouseIgnoreJob) {
            POINTERSTATE.mouse.mouseIgnoreJob.complete();
        }
    }
};
Gestures.register({
    name: 'downup',
    deps: ['mousedown', 'touchstart', 'touchend'],
    flow: {
        start: ['mousedown', 'touchstart'],
        end: ['mouseup', 'touchend']
    },
    emits: ['down', 'up'],
    info: {
        movefn: null,
        upfn: null
    },
    reset: function() {
        untrackDocument(this.info);
    },
    mousedown: function(e) {
        if (!hasLeftMouseButton(e)) {
            return;
        }
        const t = Gestures.findOriginalTarget(e);
        const self = this;
        const movefn = function movefn(e) {
            if (!hasLeftMouseButton(e)) {
                self.fire('up', t, e);
                untrackDocument(self.info);
            }
        };
        const upfn = function upfn(e) {
            if (hasLeftMouseButton(e)) {
                self.fire('up', t, e);
            }
            untrackDocument(self.info);
        };
        trackDocument(this.info, movefn, upfn);
        this.fire('down', t, e);
    },
    touchstart: function(e) {
        this.fire('down', Gestures.findOriginalTarget(e), e.changedTouches[0], e);
    },
    touchend: function(e) {
        this.fire('up', Gestures.findOriginalTarget(e), e.changedTouches[0], e);
    },
    fire: function(type, target, event, preventer) {
        Gestures.fire(target, type, {
            x: event.clientX,
            y: event.clientY,
            sourceEvent: event,
            preventer: preventer,
            prevent: function(e) {
                return Gestures.prevent(e);
            }
        });
    }
});
Gestures.register({
    name: 'track',
    touchAction: 'none',
    deps: ['mousedown', 'touchstart', 'touchmove', 'touchend'],
    flow: {
        start: ['mousedown', 'touchstart'],
        end: ['mouseup', 'touchend']
    },
    emits: ['track'],
    info: {
        x: 0,
        y: 0,
        state: 'start',
        started: false,
        moves: [],
        addMove: function(move) {
            if (this.moves.length > TRACK_LENGTH) {
                this.moves.shift();
            }
            this.moves.push(move);
        },
        movefn: null,
        upfn: null,
        prevent: false
    },
    reset: function() {
        this.info.state = 'start';
        this.info.started = false;
        this.info.moves = [];
        this.info.x = 0;
        this.info.y = 0;
        this.info.prevent = false;
        untrackDocument(this.info);
    },
    hasMovedEnough: function(x, y) {
        if (this.info.prevent) {
            return false;
        }
        if (this.info.started) {
            return true;
        }
        const dx = Math.abs(this.info.x - x);
        const dy = Math.abs(this.info.y - y);
        return (dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE);
    },
    mousedown: function(e) {
        if (!hasLeftMouseButton(e)) {
            return;
        }
        const t = Gestures.findOriginalTarget(e);
        const self = this;
        const movefn = function movefn(e) {
            const x = e.clientX,
                y = e.clientY;
            if (self.hasMovedEnough(x, y)) {
                // first move is 'start', subsequent moves are 'move', mouseup is 'end'
                self.info.state = self.info.started ? (e.type === 'mouseup' ? 'end' : 'track') : 'start';
                if (self.info.state === 'start') {
                    // if and only if tracking, always prevent tap
                    Gestures.prevent('tap');
                }
                self.info.addMove({
                    x: x,
                    y: y
                });
                if (!hasLeftMouseButton(e)) {
                    // always fire "end"
                    self.info.state = 'end';
                    untrackDocument(self.info);
                }
                self.fire(t, e);
                self.info.started = true;
            }
        };
        const upfn = function upfn(e) {
            if (self.info.started) {
                movefn(e);
            }
            // remove the temporary listeners
            untrackDocument(self.info);
        };
        // add temporary document listeners as mouse retargets
        trackDocument(this.info, movefn, upfn);
        this.info.x = e.clientX;
        this.info.y = e.clientY;
    },
    touchstart: function(e) {
        const ct = e.changedTouches[0];
        this.info.x = ct.clientX;
        this.info.y = ct.clientY;
    },
    touchmove: function(e) {
        const t = Gestures.findOriginalTarget(e);
        const ct = e.changedTouches[0];
        const x = ct.clientX,
            y = ct.clientY;
        if (this.hasMovedEnough(x, y)) {
            if (this.info.state === 'start') {
                // if and only if tracking, always prevent tap
                Gestures.prevent('tap');
            }
            this.info.addMove({
                x: x,
                y: y
            });
            this.fire(t, ct);
            this.info.state = 'track';
            this.info.started = true;
        }
    },
    touchend: function(e) {
        const t = Gestures.findOriginalTarget(e);
        const ct = e.changedTouches[0];
        // only trackend if track was started and not aborted
        if (this.info.started) {
            // reset started state on up
            this.info.state = 'end';
            this.info.addMove({
                x: ct.clientX,
                y: ct.clientY
            });
            this.fire(t, ct, e);
        }
    },
    fire: function(target, touch, preventer) {
        const secondlast = this.info.moves[this.info.moves.length - 2];
        const lastmove = this.info.moves[this.info.moves.length - 1];
        const dx = lastmove.x - this.info.x;
        const dy = lastmove.y - this.info.y;
        let ddx, ddy = 0;
        if (secondlast) {
            ddx = lastmove.x - secondlast.x;
            ddy = lastmove.y - secondlast.y;
        }
        return Gestures.fire(target, 'track', {
            state: this.info.state,
            x: touch.clientX,
            y: touch.clientY,
            dx: dx,
            dy: dy,
            ddx: ddx,
            ddy: ddy,
            sourceEvent: touch,
            preventer: preventer,
            hover: function() {
                return Gestures.deepTargetFind(touch.clientX, touch.clientY);
            }
        });
    }
});
Gestures.register({
    name: 'tap',
    deps: ['mousedown', 'click', 'touchstart', 'touchend'],
    flow: {
        start: ['mousedown', 'touchstart'],
        end: ['click', 'touchend']
    },
    emits: ['tap'],
    info: {
        x: NaN,
        y: NaN,
        prevent: false
    },
    reset: function() {
        this.info.x = NaN;
        this.info.y = NaN;
        this.info.prevent = false;
    },
    save: function(e) {
        this.info.x = e.clientX;
        this.info.y = e.clientY;
    },
    mousedown: function(e) {
        if (hasLeftMouseButton(e)) {
            this.save(e);
        }
    },
    click: function(e) {
        if (hasLeftMouseButton(e)) {
            this.forward(e);
        }
    },
    touchstart: function(e) {
        this.save(e.changedTouches[0], e);
    },
    touchend: function(e) {
        this.forward(e.changedTouches[0], e);
    },
    forward: function(e, preventer) {
        const dx = Math.abs(e.clientX - this.info.x);
        const dy = Math.abs(e.clientY - this.info.y);
        const t = Gestures.findOriginalTarget(e);
        // dx,dy can be NaN if `click` has been simulated and there was no `down` for `start`
        if (isNaN(dx) || isNaN(dy) || (dx <= TAP_DISTANCE && dy <= TAP_DISTANCE) || isSyntheticClick(e)) {
            // prevent taps from being generated if an event has canceled them
            if (!this.info.prevent) {
                Gestures.fire(t, 'tap', {
                    x: e.clientX,
                    y: e.clientY,
                    sourceEvent: e,
                    preventer: preventer
                });
            }
        }
    }
});
const DIRECTION_MAP = {
    x: 'pan-x',
    y: 'pan-y',
    none: 'none',
    all: 'auto'
};
// export
// Polymer.Gestures = Gestures;
export default Gestures;