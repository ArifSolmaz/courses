"""Embedded in the lecture notebooks by refresh_notebook_interface.py.

Only standard ipywidgets and IPython are used; notebooks remain self-contained.
"""
import functools
import traceback
import ipywidgets as widgets
from IPython import get_ipython
from IPython.display import display, HTML
from IPython.utils.capture import capture_output
from ipywidgets import interactive as _PhysicsInteractive
from ipywidgets.widgets.interaction import show_inline_matplotlib_plots

# Set this explicitly: otherwise a local kernel can choose a desktop backend
# and block at plt.show(), leaving the notebook apparently frozen.
if get_ipython() is not None:
    get_ipython().run_line_magic("matplotlib", "inline")

try:
    from google.colab import output as _colab_output
except ImportError:
    pass
else:
    _colab_output.enable_custom_widget_manager()

_physics_panels = []
_physics_callback_errors = []


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
.phy101-panel { border: 1px solid #a9b9c9; border-radius: 8px; padding: 8px; }
.phy101-controls { padding: 4px 8px 4px 0; box-sizing: border-box; overflow-x: hidden; }
.phy101-plot-output img { max-width: 100%; height: auto; object-fit: contain; }
.phy101-plot-output .output_area { overflow: visible; }
.phy101-plot-output table { font-size: 13px; width: 100%; }
.phy101-plot-output .animation { max-width: 100%; }
.phy101-plot-output .animation img { max-height: 390px; width: auto; object-fit: contain; }
.phy101-animation-panel { max-height: 470px; overflow: auto; }
.phy101-animation-panel .animation { display: flex; flex-direction: column; }
.phy101-animation-panel .animation img { order: 2; max-width: 100%; height: auto; }
.phy101-animation-panel .anim-controls { order: 1; position: sticky; top: 0;
  z-index: 2; background: white; color: #172433; padding: 4px; }
.phy101-plot-output .phy101-animation-panel { max-height: 410px; }
@media (max-width: 650px) {
  .phy101-panel { flex-direction: column !important; }
  .phy101-controls { width: 100% !important; flex-basis: auto !important;
                     max-height: 170px; overflow-y: auto; }
  .phy101-plot-output { width: 100% !important; flex-basis: auto !important;
                       max-height: 350px !important; }
}
</style>"""
display(HTML(PHYSICS_STYLE))


def physics_animation_html(animation):
    """A self-contained animation pane with playback controls kept in view."""
    return HTML(PHYSICS_STYLE + '<div class="phy101-animation-panel">' +
                animation.to_jshtml(default_mode="once") + "</div>")


def _physics_controls(items):
    """Fit full labels and postpone costly redraws until a slider is released."""
    flat = []
    for item in items:
        if isinstance(item, (widgets.HBox, widgets.VBox)):
            flat.extend(item.children)
        else:
            flat.append(item)
    for control in flat:
        if hasattr(control, "continuous_update"):
            control.continuous_update = False
        if hasattr(control, "style") and "description_width" in control.style.traits():
            control.style.description_width = "initial"
        control.layout.width = "calc(100% - 8px)"
        control.layout.min_width = "0"
    # Include the style in each output: Colab may isolate output frames.
    style = widgets.HTML(value=PHYSICS_STYLE, layout=widgets.Layout(display="none"))
    box = widgets.VBox([style] + flat, layout=widgets.Layout(
        flex="0 0 245px", width="245px", min_width="0", max_width="100%"))
    box.add_class("phy101-controls")
    return box


def _physics_output(output):
    output.layout = widgets.Layout(
        flex="1 1 320px", min_width="0", max_width="100%",
        height="480px", overflow="auto", margin="0")
    output.add_class("phy101-plot-output")
    return output


def physics_panel(controls, output):
    """Keep custom button controls beside a separately scrolling result pane."""
    panel = widgets.Box([_physics_controls(controls), _physics_output(output)],
        layout=widgets.Layout(display="flex", flex_flow="row wrap",
                              align_items="flex-start", width="100%"))
    panel.add_class("phy101-panel")
    return panel


class _PhysicsStableInteractive(_PhysicsInteractive):
    """Replace one persistent output model only after a redraw has completed.

    Sending clear_output followed by an inline figure depends on callback message
    capture in the frontend. Explicit MIME records keep repeated slider changes
    visible in Jupyter/Colab, without clearing the surrounding controls.
    """
    def update(self, *args):
        self.kwargs = {}
        if self.manual:
            self.manual_button.disabled = True
        try:
            for control in self.kwargs_widgets:
                self.kwargs[control._kwarg] = control.get_interact_value()
            with capture_output(stdout=True, stderr=True, display=True) as captured:
                self.result = self.f(**self.kwargs)
                show_inline_matplotlib_plots()
                if self.auto_display and self.result is not None:
                    display(self.result)
            records = []
            if captured.stdout:
                records.append({"output_type": "stream", "name": "stdout", "text": captured.stdout})
            if captured.stderr:
                records.append({"output_type": "stream", "name": "stderr", "text": captured.stderr})
            records.extend({"output_type": "display_data", "data": output.data,
                            "metadata": output.metadata or {}} for output in captured.outputs)
            # Keep the old result visible during calculation; publish the complete
            # replacement as one widget-state update, including its PNG/HTML data.
            self.out.outputs = tuple(records)
        except Exception:
            _physics_callback_errors.append((getattr(self.f, "__name__", "callback"), traceback.format_exc()))
            self.out.outputs = ({"output_type": "stream", "name": "stderr",
                                 "text": traceback.format_exc()},)
        finally:
            if self.manual:
                self.manual_button.disabled = False


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


def physics_interactive(function, **controls):
    """An interactive widget with the same arguments as ipywidgets.interactive."""
    @functools.wraps(function)
    def checked(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except Exception as error:
            _physics_callback_errors.append((function.__name__, repr(error)))
            raise

    panel = _PhysicsStableInteractive(checked, {"auto_display": True}, **controls)
    inputs = [child for child in panel.children if child is not panel.out]
    panel.children = (_physics_controls(inputs), _physics_output(panel.out))
    panel.layout = widgets.Layout(display="flex", flex_flow="row wrap",
                                  align_items="flex-start", width="100%")
    panel.add_class("phy101-panel")
    _physics_panels.append(panel)
    return panel


def physics_interact(function=None, **controls):
    """Support both @physics_interact(...) and physics_interact(function, ...)."""
    if function is None:
        return lambda function: physics_interact(function, **controls)
    panel = physics_interactive(function, **controls)
    function.widget = panel
    display(panel)
    return function
