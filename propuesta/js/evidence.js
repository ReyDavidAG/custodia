import { esc, icon } from "./ui.js";

export function evidenceField(id) {
  return `<fieldset class="field evidence" data-evidence="${id}">
    <legend>Evidencia de entrega</legend>
    <div class="seg" role="radiogroup" aria-label="Tipo de evidencia">
      <label><input type="radio" name="${id}-mode" value="sign" checked><span>${icon("pen")}Firma en pantalla</span></label>
      <label><input type="radio" name="${id}-mode" value="file"><span>${icon("camera")}Foto o PDF</span></label>
    </div>
    <div class="evidence__sign" data-mode="sign">
      <canvas class="pad" width="600" height="200" aria-label="Recuadro para firmar con el dedo o el mouse"></canvas>
      <div class="pad__foot"><span class="muted small">Firma de quien recibe</span><button class="link-btn" type="button" data-clear>Borrar firma</button></div>
    </div>
    <label class="evidence__file drop" data-mode="file" hidden>
      <input type="file" accept="image/*,application/pdf" capture="environment">
      <span class="drop__icon">${icon("upload")}</span>
      <span class="drop__text"><b>Toma una foto o sube el PDF</b><small>De la hoja firmada. Hasta 10 MB.</small></span>
    </label>
    <p class="field__help" data-help>Sin evidencia no se puede cerrar la entrega.</p>
  </fieldset>`;
}

export function bindEvidence(root, id) {
  const box = root.querySelector(`[data-evidence="${id}"]`);
  const canvas = box.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--color-ink").trim();
  let drawing = false;
  let strokes = 0;
  let file = null;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = ink || "currentColor";
  const at = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * canvas.width, ((e.clientY - r.top) / r.height) * canvas.height];
  };
  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(...at(e));
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    ctx.lineTo(...at(e));
    ctx.stroke();
  });
  canvas.addEventListener("pointerup", () => {
    if (drawing) strokes++;
    drawing = false;
    box.dispatchEvent(new Event("evidence", { bubbles: true }));
  });
  box.querySelector("[data-clear]").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes = 0;
    box.dispatchEvent(new Event("evidence", { bubbles: true }));
  });
  box.addEventListener("change", (e) => {
    if (e.target.name === `${id}-mode`) {
      box.querySelectorAll("[data-mode]").forEach((el) => (el.hidden = el.dataset.mode !== e.target.value));
    }
    if (e.target.type === "file") {
      file = e.target.files[0] ?? null;
      const text = box.querySelector(".drop__text");
      text.innerHTML = file ? `<b>${esc(file.name)}</b><small>${Math.ceil(file.size / 1024)} KB · listo</small>` : `<b>Toma una foto o sube el PDF</b><small>De la hoja firmada. Hasta 10 MB.</small>`;
      box.querySelector(".drop").classList.toggle("is-ready", !!file);
    }
    box.dispatchEvent(new Event("evidence", { bubbles: true }));
  });
  return {
    value() {
      const mode = box.querySelector(`input[name="${id}-mode"]:checked`).value;
      if (mode === "sign") return strokes ? { kind: "firma", image: canvas.toDataURL("image/png") } : null;
      return file ? { kind: file.type === "application/pdf" ? "pdf" : "foto", name: file.name } : null;
    },
    fail(msg) {
      const help = box.querySelector("[data-help]");
      help.textContent = msg;
      help.classList.add("is-error");
      box.classList.add("animate-nudge");
      setTimeout(() => box.classList.remove("animate-nudge"), 400);
    },
  };
}
