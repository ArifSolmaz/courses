# Runs in a private setup namespace, leaving student globals untouched.
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64
from offline_ui import plot

def show_offline(*args, **kwargs):
    for number in plt.get_fignums():
        figure = plt.figure(number)
        image = io.BytesIO()
        figure.savefig(image, format='png', dpi=110, bbox_inches='tight')
        plot(base64.b64encode(image.getvalue()).decode('ascii'))
        plt.close(figure)
plt.show = show_offline
