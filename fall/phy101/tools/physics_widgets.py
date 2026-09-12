"""Shared demonstration interface, embedded in every PHY101 notebook.

Only standard ipywidgets, IPython and matplotlib are used, so the notebooks stay
self-contained in Colab and in a local Jupyter. The design goals are:

* A slider change must always produce a visible reaction. The status line under
  the controls says "Updating…" immediately and reports the draw time afterwards.
* The graph is replaced through the same Output-widget route that
  ``ipywidgets.interact`` uses (``clear_output(wait=True)`` followed by a fresh
  display), which is the most widely tested path in Colab and Jupyter. No
  output-capturing context is used: ipykernel 7 dispatches widget messages
  concurrently and IPython's capture object breaks that dispatch.
* Live updates while dragging are switched on when a graph draws quickly and
  switched off (update on release) when it draws slowly, so the kernel never
  falls behind a fast slider.
"""
import functools
import sys
import time
import traceback

import ipywidgets as widgets
from IPython import get_ipython
from IPython.display import HTML, clear_output, display

# Force the inline backend. Otherwise a local kernel may choose a desktop
# backend and block at plt.show(), which looks like a frozen notebook.
if get_ipython() is not None:
    get_ipython().run_line_magic("matplotlib", "inline")

_physics_panels = []
_physics_callback_errors = []

# Draw-time thresholds (seconds) for switching live dragging on and off.
PHYSICS_LIVE_ON = 0.12
PHYSICS_LIVE_OFF = 0.25


def physics_frames(frame_count, maximum=60):
    """Sample display frames, retaining both endpoints and all simulation data."""
    count = int(frame_count)
    shown = min(count, maximum)
    if shown <= 1:
        return list(range(shown))
    return [round(index * (count - 1) / (shown - 1)) for index in range(shown)]


def physics_interval(frame_count, interval_ms):
    """Preserve first-to-last playback duration when display frames are sampled."""
    shown = len(physics_frames(frame_count))
    return interval_ms if shown <= 1 else interval_ms * (int(frame_count) - 1) / (shown - 1)


PHYSICS_STYLE = """<style>
.phy101-panel { border: 1px solid #a9b9c9; border-radius: 8px; padding: 8px; background: #fff; }
.phy101-controls { padding: 0 0 2px; box-sizing: border-box; }
.phy101-status { font-size: 12px; color: #4a5a6a; padding: 0 2px 6px; min-height: 18px; }
.phy101-status.busy { color: #b45309; }
.phy101-plot-output img { max-width: 100%; height: auto; object-fit: contain; }
.phy101-plot-output .output_area { overflow: visible; }
.phy101-plot-output table { font-size: 13px; width: 100%; }
.phy101-plot-output .animation { max-width: 100%; }
.phy101-plot-output .animation img { max-width: 100%; height: auto; object-fit: contain; }
.phy101-animation-panel { max-width: 100%; }
.phy101-animation-panel .animation { display: flex; flex-direction: column; }
.phy101-animation-panel .animation img { order: 2; max-width: 100%; height: auto; }
.phy101-animation-panel .anim-controls { order: 1; background: white; color: #172433; padding: 4px; }
@media (max-width: 650px) {
  .phy101-controls, .phy101-plot-output { width: 100% !important; }
}
</style>"""
display(HTML(PHYSICS_STYLE))


def physics_animation_html(animation):
    """A self-contained animation pane with playback controls kept in view."""
    return HTML(PHYSICS_STYLE + '<div class="phy101-animation-panel">' +
                animation.to_jshtml(default_mode="once") + "</div>")


def _physics_controls(items):
    """Lay the controls out as a wrapping toolbar with full-length labels."""
    flat = []
    for item in items:
        if isinstance(item, (widgets.HBox, widgets.VBox)):
            flat.extend(item.children)
        else:
            flat.append(item)
    for control in flat:
        if hasattr(control, "style") and "description_width" in control.style.traits():
            control.style.description_width = "initial"
        control.layout.width = "310px"
        control.layout.flex = "0 1 310px"
        control.layout.max_width = "100%"
        control.layout.min_width = "0"
        control.layout.margin = "2px 6px 2px 0"
        if isinstance(control, widgets.Button):
            control.layout.width = "auto"
            control.layout.flex = "0 0 auto"
    # Repeat the style inside the widget tree: Colab isolates output frames.
    style = widgets.HTML(value=PHYSICS_STYLE, layout=widgets.Layout(display="none"))
    box = widgets.Box([style] + flat, layout=widgets.Layout(
        display="flex", flex_flow="row wrap", align_items="center",
        width="100%", min_width="0", max_width="100%"))
    box.add_class("phy101-controls")
    return box


def _physics_output(output):
    output.layout = widgets.Layout(
        width="100%", min_width="0", max_width="100%",
        height="auto", overflow="visible", margin="0")
    output.add_class("phy101-plot-output")
    return output


def physics_panel(controls, output):
    """Button-driven demos: a compact control toolbar directly above the result."""
    panel = widgets.Box([_physics_controls(controls), _physics_output(output)],
        layout=widgets.Layout(display="flex", flex_flow="column",
                              align_items="stretch", width="100%"))
    panel.add_class("phy101-panel")
    return panel


def physics_show_figure(figure):
    """Display one inline figure and close its pyplot registration afterwards."""
    import matplotlib.pyplot as plt
    display(figure)
    plt.close(figure)


def physics_vector_axes(axes, points):
    """Equal x/y scales and limits covering all arrow endpoints, including sums."""
    import numpy as np
    coordinates = np.asarray(points, dtype=float).reshape(-1, 2)
    span = max(1.0, float(np.max(np.abs(coordinates)))) * 1.22
    axes.set(xlim=(-span, span), ylim=(-span, span), xlabel="x component", ylabel="y component")
    axes.set_aspect("equal", adjustable="box")
    axes.axhline(0, color="#718096", linewidth=0.7)
    axes.axvline(0, color="#718096", linewidth=0.7)
    axes.grid(alpha=0.2)


class PhysicsPanel:
    """Controls, a status line and one Output widget that shows the latest result."""

    def __init__(self, function, controls):
        self.f = function
        self.controls = controls
        self.out = _physics_output(widgets.Output())
        self.status = widgets.HTML(value="")
        self.status.add_class("phy101-status")
        self.seconds = None
        self.live = True
        self.updates = 0
        self.last_outputs = 0
        self.figures = 0
        self.error = None
        visible = []
        for control in controls.values():
            if isinstance(control, widgets.fixed):
                continue
            visible.append(control)
            if hasattr(control, "continuous_update"):
                control.continuous_update = True
            control.observe(self._changed, names="value")
        self.widget = widgets.VBox([_physics_controls(visible), self.status, self.out],
                                   layout=widgets.Layout(width="100%"))
        self.widget.add_class("phy101-panel")
        self.children = self.widget.children
        _physics_panels.append(self)
        self.render()

    # Compatibility with the earlier validation code.
    @property
    def layout(self):
        return self.widget.layout

    def _changed(self, change):
        self.render()

    def _set_live(self, live):
        if live == self.live:
            return
        self.live = live
        for control in self.controls.values():
            if hasattr(control, "continuous_update"):
                control.continuous_update = live

    def render(self):
        self.status.value = "⏳ Updating… / Güncelleniyor…"
        self.status.add_class("busy")
        started = time.perf_counter()
        kwargs = {name: control.value for name, control in self.controls.items()}
        self.error = None
        self.figures = 0
        # Count everything the demonstration shows (figures, HTML, animations, text)
        # by wrapping the display publisher and stdout for this draw only.
        shell = get_ipython()
        publisher = getattr(shell, "display_pub", None) if shell is not None else None
        if publisher is not None:
            original_publish = publisher.publish

            def counting_publish(*args, **kwargs):
                self.figures += 1
                return original_publish(*args, **kwargs)
            publisher.publish = counting_publish
        stdout = sys.stdout
        original_write = stdout.write

        def counting_write(text):
            if text.strip():
                self.figures += 1
            return original_write(text)
        stdout.write = counting_write
        try:
            # The previous result stays visible until the new one arrives.
            with self.out:
                clear_output(wait=True)
                try:
                    result = self.f(**kwargs)
                    from ipywidgets.widgets.interaction import show_inline_matplotlib_plots
                    show_inline_matplotlib_plots()
                    if result is not None:
                        display(result)
                except Exception:
                    self.error = traceback.format_exc()
                    _physics_callback_errors.append((getattr(self.f, "__name__", "callback"), self.error))
                    print(self.error)
        finally:
            if publisher is not None and publisher.__dict__.get("publish") is counting_publish:
                del publisher.publish
            if stdout.__dict__.get("write") is counting_write:
                del stdout.write
        self.last_outputs = self.figures
        self.seconds = time.perf_counter() - started
        self.updates += 1
        if self.seconds > PHYSICS_LIVE_OFF:
            self._set_live(False)
        elif self.seconds < PHYSICS_LIVE_ON:
            self._set_live(True)
        self.status.remove_class("busy")
        mode = ("updates while you drag / sürüklerken güncellenir" if self.live
                else "updates when you release the slider / kaydırıcıyı bırakınca güncellenir")
        self.status.value = (f"✓ Drawn in {self.seconds:.2f} s · {mode}" if self.error is None
                             else "⚠ The demonstration reported an error; see the message below.")


def physics_interactive(function, **controls):
    """Build a panel like ipywidgets.interactive, returning the panel object."""
    @functools.wraps(function)
    def checked(*args, **kwargs):
        return function(*args, **kwargs)

    return PhysicsPanel(checked, controls)


def physics_interact(function=None, **controls):
    """Support both @physics_interact(...) and physics_interact(function, ...)."""
    if function is None:
        return lambda function: physics_interact(function, **controls)
    panel = physics_interactive(function, **controls)
    function.widget = panel.widget
    function.panel = panel
    display(panel.widget)
    return function
