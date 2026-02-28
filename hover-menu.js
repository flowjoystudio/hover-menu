(function () {
  "use strict";

  var activeDropdown = null;
  var svgEl = null;
  var mouseX = 0;
  var mouseY = 0;

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function isTouchDevice() {
    return window.matchMedia("(hover: none)").matches;
  }

  function getAttr(el, name, fallback) {
    var val = el.getAttribute(name);
    return val !== null ? val : fallback;
  }

  function applyTransitionStyles(submenu, duration, easing, transition, direction) {
    submenu.style.transition = "none";
    submenu.style.opacity = "0";

    if (transition === "slide" || transition === "fade-slide") {
      var axis = direction === "right" ? "translateX(-8px)" : "translateY(-8px)";
      submenu.style.transform = axis;
    }

    // Store settings on element for use during show/hide
    submenu._fjDuration = duration;
    submenu._fjEasing = easing;
    submenu._fjTransition = transition;
    submenu._fjDirection = direction;
  }

  function showSubmenu(submenu) {
    submenu.style.display = "";
    // Force reflow
    submenu.offsetHeight;
    submenu.style.transition = "opacity " + submenu._fjDuration + "ms " + submenu._fjEasing + ", transform " + submenu._fjDuration + "ms " + submenu._fjEasing;
    submenu.style.opacity = "1";
    if (submenu._fjTransition === "slide" || submenu._fjTransition === "fade-slide") {
      submenu.style.transform = "translateX(0) translateY(0)";
    }
  }

  function hideSubmenu(submenu) {
    submenu.style.transition = "opacity " + submenu._fjDuration + "ms " + submenu._fjEasing + ", transform " + submenu._fjDuration + "ms " + submenu._fjEasing;
    submenu.style.opacity = "0";
    if (submenu._fjTransition === "slide" || submenu._fjTransition === "fade-slide") {
      var axis = submenu._fjDirection === "right" ? "translateX(-8px)" : "translateY(-8px)";
      submenu.style.transform = axis;
    }
    setTimeout(function () {
      submenu.style.display = "none";
    }, submenu._fjDuration);
  }

  // ─── Safe Triangle ─────────────────────────────────────────────────────────

  function removeSafeTriangle() {
    if (svgEl && svgEl.parentNode) {
      svgEl.parentNode.removeChild(svgEl);
    }
    svgEl = null;
  }

  function drawSafeTriangle(parent, submenu, direction) {
    removeSafeTriangle();

    var pRect = parent.getBoundingClientRect();
    var sRect = submenu.getBoundingClientRect();

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("data-flowjoy", "safe-triangle");

    var svgLeft, svgTop, svgWidth, svgHeight, pathD;

    if (direction === "right") {
      svgLeft = pRect.right;
      svgTop = sRect.top;
      svgWidth = sRect.left - pRect.right + sRect.width;
      svgHeight = sRect.height;

      var cursorY = mouseY - svgTop;
      cursorY = Math.max(0, Math.min(svgHeight, cursorY));

      var gapWidth = sRect.left - pRect.right;

      pathD = "M 0," + cursorY + " L " + gapWidth + ",0 L " + gapWidth + "," + svgHeight + " Z";
    } else {
      // down
      svgLeft = sRect.left;
      svgTop = pRect.bottom;
      svgWidth = sRect.width;
      svgHeight = sRect.top - pRect.bottom + sRect.height;

      var cursorX = mouseX - svgLeft;
      cursorX = Math.max(0, Math.min(svgWidth, cursorX));

      var gapHeight = sRect.top - pRect.bottom;

      pathD = "M " + cursorX + ",0 L 0," + gapHeight + " L " + svgWidth + "," + gapHeight + " Z";
    }

    Object.assign(svg.style, {
      position: "fixed",
      left: svgLeft + "px",
      top: svgTop + "px",
      width: svgWidth + "px",
      height: svgHeight + "px",
      pointerEvents: "none",
      zIndex: "99999",
      overflow: "visible"
    });

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", "transparent");
    path.setAttribute("pointer-events", "auto");
    svg.appendChild(path);
    document.body.appendChild(svg);
    svgEl = svg;
  }

  // ─── Open / Close ──────────────────────────────────────────────────────────

  function openDropdown(parent, submenu, direction) {
    if (activeDropdown && activeDropdown.parent !== parent) {
      closeDropdown(activeDropdown.parent, activeDropdown.submenu);
    }

    activeDropdown = { parent: parent, submenu: submenu, direction: direction };
    parent.setAttribute("fj-hover-menu-open", "");
    showSubmenu(submenu);
    drawSafeTriangle(parent, submenu, direction);
  }

  function closeDropdown(parent, submenu) {
    parent.removeAttribute("fj-hover-menu-open");
    hideSubmenu(submenu);
    removeSafeTriangle();
    activeDropdown = null;
  }

  function isOverElement(el) {
    if (!el) return false;
    var rect = el.getBoundingClientRect();
    return (
      mouseX >= rect.left &&
      mouseX <= rect.right &&
      mouseY >= rect.top &&
      mouseY <= rect.bottom
    );
  }

  function isOverSafeTriangle() {
    if (!svgEl) return false;
    var path = svgEl.querySelector("path");
    if (!path) return false;
    try {
      var pt = svgEl.createSVGPoint();
      pt.x = mouseX;
      pt.y = mouseY;
      // Convert from fixed viewport coords to SVG local coords
      var rect = svgEl.getBoundingClientRect();
      pt.x = mouseX - rect.left;
      pt.y = mouseY - rect.top;
      return path.isPointInFill(pt);
    } catch (e) {
      return false;
    }
  }

  // ─── Mouse tracking ────────────────────────────────────────────────────────

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!activeDropdown) return;

    var parent = activeDropdown.parent;
    var submenu = activeDropdown.submenu;
    var direction = activeDropdown.direction;

    // Redraw triangle with updated cursor position
    drawSafeTriangle(parent, submenu, direction);

    // If cursor is over parent or submenu, keep open
    if (isOverElement(parent) || isOverElement(submenu)) return;

    // If cursor is in safe triangle, keep open
    if (isOverSafeTriangle()) return;

    // Otherwise close
    closeDropdown(parent, submenu);
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  function init() {
    if (isTouchDevice()) return;

    var parents = document.querySelectorAll("[fj-hover-menu='parent']");
    if (!parents || parents.length === 0) return;

    document.addEventListener("mousemove", onMouseMove);

    parents.forEach(function (parent) {
      var direction = parent.getAttribute("fj-hover-menu-direction");

      if (!direction || (direction !== "right" && direction !== "down")) {
        console.warn("[fj-hover-menu] Missing or invalid fj-hover-menu-direction on element:", parent, "— Expected 'right' or 'down'. Skipping.");
        return;
      }

      var submenu = parent.querySelector("[fj-hover-menu='submenu']");
      if (!submenu) {
        console.warn("[fj-hover-menu] No fj-hover-menu='submenu' found inside parent:", parent, "— Skipping.");
        return;
      }

      // Read transition controls
      var duration = parseInt(getAttr(parent, "fj-hover-menu-duration", "150"), 10);
      var easing = getAttr(parent, "fj-hover-menu-easing", "ease");
      var transition = getAttr(parent, "fj-hover-menu-transition", "fade");

      // Validate transition value
      if (["fade", "slide", "fade-slide"].indexOf(transition) === -1) {
        console.warn("[fj-hover-menu] Invalid fj-hover-menu-transition value '" + transition + "' on element:", parent, "— Defaulting to 'fade'.");
        transition = "fade";
      }

      // Initialise submenu styles
      submenu.style.display = "none";
      applyTransitionStyles(submenu, duration, easing, transition, direction);

      parent.addEventListener("mouseenter", function () {
        openDropdown(parent, submenu, direction);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
