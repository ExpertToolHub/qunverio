/* ----------------------------------------------------------
   6. HTML RENDER FUNCTION
   ---------------------------------------------------------- */
function qvsnRenderHTML() {
  return `
    <div class="qvsn-wrap">

      <!-- Header -->
      <div class="qvsn-header">
        <div class="qvsn-title">📚 AI Study Notes Generator</div>
        <div class="qvsn-sub">Topic daalo → AI handwriting notes banayega → PNG/PDF export karo</div>
      </div>

      <!-- Input Card -->
      <div class="qvsn-card">
        <label class="qvsn-label" for="qvsn-topic">📝 Topic</label>
        <input
          type="text"
          id="qvsn-topic"
          class="qvsn-input"
          placeholder="e.g. Renewable Energy Sources"
          autocomplete="off"
        />

        <div class="qvsn-row">
          <div>
            <label class="qvsn-label" for="qvsn-level">📊 Detail Level</label>
            <select id="qvsn-level" class="qvsn-select">
              <option value="short">Short (1 page)</option>
              <option value="medium" selected>Medium (2-3 pages)</option>
              <option value="detailed">Detailed (4-5 pages)</option>
            </select>
          </div>

          <div>
            <label class="qvsn-label" for="qvsn-subject">🎓 Subject (optional)</label>
            <input
              type="text"
              id="qvsn-subject"
              class="qvsn-input"
              placeholder="e.g. Physics"
              autocomplete="off"
            />
          </div>
        </div>

        <div class="qvsn-row">
          <div>
            <label class="qvsn-label" for="qvsn-language">🌐 Language</label>
            <select id="qvsn-language" class="qvsn-select">
              <option value="english" selected>English</option>
              <option value="hindi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          <div>
            <label class="qvsn-label" for="qvsn-pen">🖊️ Pen Color</label>
            <select id="qvsn-pen" class="qvsn-select">
              <option value="blue" selected>Blue Pen</option>
              <option value="black">Black Pen</option>
              <option value="green">Green Pen</option>
            </select>
          </div>
        </div>

        <button id="qvsn-generate" class="qvsn-btn">✨ Generate Notes</button>

        <div id="qvsn-status" class="qvsn-status" style="display:none;"></div>
        <div id="qvsn-error" class="qvsn-error" style="display:none;"></div>
      </div>

      <!-- Actions (hidden until notes generated) -->
      <div id="qvsn-actions-wrap" class="qvsn-card" style="display:none;">
        <div class="qvsn-actions">
          <button id="qvsn-edit" class="qvsn-btn qvsn-btn-secondary">✏️ Edit Mode</button>
          <button id="qvsn-regen" class="qvsn-btn qvsn-btn-secondary">🔄 Regenerate</button>
          <button id="qvsn-png" class="qvsn-btn">🖼️ PNG (HD)</button>
          <button id="qvsn-pdf" class="qvsn-btn">📄 PDF</button>
          <button id="qvsn-print" class="qvsn-btn qvsn-btn-secondary">🖨️ Print</button>
          <button id="qvsn-clear" class="qvsn-btn qvsn-btn-secondary">🗑️ Clear</button>
        </div>
      </div>

      <!-- Results Container (notebook pages render here) -->
      <div id="qvsn-pages" class="qvsn-pages"></div>

    </div>
  `;
}

/* ----------------------------------------------------------
   7. EXPOSE RENDERER TO GLOBAL
   ---------------------------------------------------------- */
window.QVSN.renderHTML = qvsnRenderHTML;