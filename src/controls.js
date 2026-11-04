export function createControls(onLook) {
  const stick = document.querySelector('#joystick');
  const knob = document.querySelector('#joystick-knob');
  const lookZone = document.querySelector('#look-zone');
  const keys = new Set();
  let stickPointer = null, lookPointer = null;
  let analog = { x: 0, y: 0 }, previousLook = null;

  function updateStick(event) {
    const bounds = stick.getBoundingClientRect();
    const radius = (bounds.width - 52) / 2;
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(dx, dy);
    const scale = distance > radius ? radius / distance : 1;
    const x = dx * scale, y = dy * scale;
    knob.style.transform = `translate(${x}px, ${y}px)`;
    // A small dead zone prevents accidental movement when the thumb rests.
    const strength = Math.max(0, (Math.min(distance / radius, 1) - 0.12) / 0.88);
    analog = distance ? { x: dx / distance * strength, y: dy / distance * strength } : { x: 0, y: 0 };
  }
  function releaseStick() {
    stickPointer = null;
    analog = { x: 0, y: 0 };
    knob.style.transform = 'translate(0px, 0px)';
    stick.dataset.active = 'false';
  }
  stick.addEventListener('pointerdown', event => {
    if (stickPointer !== null) return;
    event.preventDefault();
    stickPointer = event.pointerId;
    stick.setPointerCapture(event.pointerId);
    stick.dataset.active = 'true';
    updateStick(event);
  });
  stick.addEventListener('pointermove', event => { if (event.pointerId === stickPointer) updateStick(event); });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.addEventListener(name, event => { if (event.pointerId === stickPointer) releaseStick(); });
  lookZone.addEventListener('pointerdown', event => {
    if (lookPointer !== null) return;
    event.preventDefault();
    lookPointer = event.pointerId;
    previousLook = { x: event.clientX, y: event.clientY };
    lookZone.setPointerCapture(event.pointerId);
  });
  lookZone.addEventListener('pointermove', event => {
    if (event.pointerId !== lookPointer) return;
    onLook(event.clientX - previousLook.x, event.clientY - previousLook.y);
    previousLook = { x: event.clientX, y: event.clientY };
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) lookZone.addEventListener(name, event => { if (event.pointerId === lookPointer) { lookPointer = null; previousLook = null; } });
  const supported = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'];
  addEventListener('keydown', event => {
    if (!supported.includes(event.key.toLowerCase()) || event.target.closest('button,input,textarea,select')) return;
    event.preventDefault(); keys.add(event.key.toLowerCase());
  });
  addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  function clear() { keys.clear(); releaseStick(); lookPointer = null; previousLook = null; }
  addEventListener('blur', clear);
  document.addEventListener('visibilitychange', clear);
  return {
    read() {
      const x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
      const y = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
      const length = Math.hypot(x, y);
      return length ? { x: x / length, y: y / length, strength: 1, sprint: keys.has('shift') } : { ...analog, strength: Math.hypot(analog.x, analog.y), sprint: false };
    },
  };
}
