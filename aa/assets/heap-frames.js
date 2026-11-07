document.querySelectorAll('.heap-diagram').forEach(diagram => {
  const frames = [...diagram.querySelectorAll('.heap-frame')];
  const controls = diagram.querySelector('.heap-controls');
  const previous = controls.querySelector('[data-heap-prev]');
  const next = controls.querySelector('[data-heap-next]');
  const position = controls.querySelector('output');
  let index = 0;

  function render() {
    frames.forEach((frame, frameIndex) => {
      frame.hidden = frameIndex !== index;
    });
    previous.disabled = index === 0;
    next.disabled = index === frames.length - 1;
    position.value = `${index + 1} / ${frames.length}`;
  }

  previous.addEventListener('click', () => {
    index -= 1;
    render();
  });
  next.addEventListener('click', () => {
    index += 1;
    render();
  });
  controls.hidden = false;
  render();
});
