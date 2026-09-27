/* ============================================================
   RESUME BUILDER — Qunverio (FINAL v11)
   - Ultra HD Photo (1100×1300 — 10x)
   - Photo limit 20 MB
   - PDF pixel ratio 8x (max quality)
   - 7 Templates perfect
   - A4 multi-page smart logic
   ============================================================ */

// ====== STYLES INJECT ======
(function resumeInjectStyles() {
  if (document.getElementById('resume-builder-styles')) return;
  const style = document.createElement('style');
  style.id = 'resume-builder-styles';
  style.textContent = `
    .rb-wrap { max-width: 1100px; margin: 0 auto; padding: 12px; }
    .rb-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .rb-tab { padding: 10px 16px; border-radius: 8px; border: 1px solid #2a2a3e; background: #1a1a2e; color: #e0e0e0; cursor: pointer; font-size: 13px; font-weight: 500; transition: all .2s; font-family: inherit; }
    .rb-tab.active { background: linear-gradient(135deg,#00d4ff,#7b2ff7); color: #fff; border-color: transparent; }
    .rb-panel { display: none; }
    .rb-panel.active { display: block; animation: rbFade .3s ease; }
    @keyframes rbFade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .rb-section { background: #1a1a2e; border: 1px solid #2a2a3e; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
    .rb-section h3 { margin: 0 0 14px; font-size: 16px; display: flex; align-items: center; gap: 8px; color: #fff; }
    .rb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .rb-field { display: flex; flex-direction: column; gap: 4px; }
    .rb-field label { font-size: 11px; opacity: .75; font-weight: 500; text-transform: uppercase; letter-spacing: .4px; color: #e0e0e0; }
    .rb-field input, .rb-field select, .rb-field textarea { padding: 9px 12px; border-radius: 8px; border: 1px solid #2a2a3e; background: #0f0f1a; color: #e0e0e0; font-size: 13px; font-family: inherit; outline: none; transition: border .2s; width: 100%; box-sizing: border-box; }
    .rb-field input:focus, .rb-field textarea:focus, .rb-field select:focus { border-color: #00d4ff; }
    .rb-field textarea { resize: vertical; min-height: 70px; }
    .rb-field input[type="color"] { height: 40px; padding: 4px; cursor: pointer; }
    .rb-counter { font-size: 10px; opacity: .6; text-align: right; color: #e0e0e0; }
    .rb-item { background: #0f0f1a; border: 1px solid #2a2a3e; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
    .rb-item-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .rb-item-head strong { font-size: 13px; opacity: .85; color: #e0e0e0; }
    .rb-btns { display: flex; gap: 6px; }
    .rb-btn { padding: 7px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 500; font-family: inherit; transition: all .2s; }
    .rb-btn.primary { background: linear-gradient(135deg,#00d4ff,#7b2ff7); color: #fff; }
    .rb-btn.ghost { background: #1a1a2e; border: 1px solid #2a2a3e; color: #e0e0e0; }
    .rb-btn.danger { background: #e74c3c; color: #fff; }
    .rb-btn.success { background: #10b981; color: #fff; }
    .rb-btn.small { padding: 4px 8px; font-size: 11px; }
    .rb-btn:hover { transform: translateY(-1px); opacity: .9; }
    .rb-add { width: 100%; padding: 11px; border-radius: 8px; border: 1px dashed #2a2a3e; background: transparent; color: #00d4ff; cursor: pointer; font-size: 13px; font-weight: 500; margin-top: 4px; font-family: inherit; }
    .rb-add:hover { background: rgba(0,212,255,.05); }
    .rb-actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0 8px; padding: 14px; background: #1a1a2e; border-radius: 12px; border: 1px solid #2a2a3e; position: sticky; top: 10px; z-index: 10; }
    .rb-actions .rb-btn { flex: 1; min-width: 100px; padding: 10px; }
    .rb-actions-hint { font-size: 10.5px; color: #888; margin-bottom: 12px; text-align: center; line-height: 1.6; padding: 0 6px; }
    .rb-actions-hint strong { color: #aaa; }
    .rb-progress { height: 6px; background: #2a2a3e; border-radius: 3px; overflow: hidden; margin-bottom: 14px; }
    .rb-progress-fill { height: 100%; background: linear-gradient(90deg,#00d4ff,#7b2ff7); transition: width .4s; }
    .rb-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #0f0f1a; border: 1px solid #2a2a3e; border-radius: 20px; font-size: 12px; color: #e0e0e0; margin: 4px 4px 0 0; }
    .rb-chip button { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 14px; padding: 0; line-height: 1; }

    .rb-photo-preview { display: flex; align-items: center; gap: 12px; margin-top: 8px; padding: 10px; background: #0f0f1a; border: 1px solid #2a2a3e; border-radius: 10px; }
    .rb-photo-preview img { width: 80px; height: 100px; object-fit: cover; border-radius: 6px; border: 1px solid #2a2a3e; }
    .rb-photo-preview .rpp-info { flex: 1; font-size: 12px; color: #a0a0a0; }
    .rb-photo-preview .rpp-info strong { color: #00d4ff; display: block; margin-bottom: 4px; }

    .rb-crop-modal { position: fixed; inset: 0; background: rgba(0,0,0,.9); z-index: 99999; display: none; flex-direction: column; }
    .rb-crop-modal.active { display: flex; }
    .rb-crop-header { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a2a3e; background: #1a1a2e; }
    .rb-crop-header h3 { color: #fff; font-size: 15px; margin: 0; }
    .rb-crop-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; overflow: hidden; position: relative; }
    .rb-crop-body img { max-width: 100%; max-height: 100%; display: block; }
    .rb-crop-footer { padding: 14px 18px; display: flex; gap: 10px; border-top: 1px solid #2a2a3e; background: #1a1a2e; }
    .rb-crop-footer button { flex: 1; padding: 12px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .rb-crop-footer .cancel { background: #2a2a3e; color: #e0e0e0; }
    .rb-crop-footer .apply { background: linear-gradient(135deg,#00d4ff,#7b2ff7); color: #fff; }

    /* ===== PREVIEW ===== */
    .rb-preview-wrap { background: #555; padding: 14px; border-radius: 12px; overflow: auto; max-height: 85vh; }
    .rb-preview { width: 794px; min-height: auto; margin: 0 auto; background: #fff; color: #222; font-family: 'Segoe UI', Arial, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,.4); }

    .rb-preview .rb-h { display: flex; gap: 24px; align-items: flex-start; justify-content: space-between; }
    .rb-preview .rb-h-info { flex: 1; min-width: 0; }
    .rb-preview .rb-h-photo { flex-shrink: 0; }

    /* ===== MODERN ===== */
    .rb-preview.tpl-modern .rb-h { background: linear-gradient(135deg, var(--rc, #00d4ff), #7b2ff7); color: #fff; padding: 32px 40px; }
    .rb-preview.tpl-modern .rb-h-photo { width: 110px; height: 130px; border-radius: 8px; object-fit: cover; border: 3px solid rgba(255,255,255,.5); }
    .rb-preview.tpl-modern .rb-h-info h1 { margin: 0 0 6px; font-size: 30px; font-weight: 700; }
    .rb-preview.tpl-modern .rb-h-info .rb-title { font-size: 15px; opacity: .9; margin-bottom: 10px; }
    .rb-preview.tpl-modern .rb-h-info .rb-contacts { font-size: 12px; opacity: .95; line-height: 1.7; word-break: break-word; }
    .rb-preview.tpl-modern .rb-body { padding: 30px 40px; }

    /* ===== PROFESSIONAL ===== */
    .rb-preview.tpl-professional .rb-h { padding: 30px 40px 20px; border-bottom: 2px solid #222; }
    .rb-preview.tpl-professional .rb-h-photo { width: 100px; height: 120px; border-radius: 6px; object-fit: cover; border: 2px solid #222; }
    .rb-preview.tpl-professional .rb-h-info h1 { margin: 0 0 6px; font-size: 30px; letter-spacing: 2px; text-transform: uppercase; }
    .rb-preview.tpl-professional .rb-h-info .rb-title { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #666; margin-bottom: 12px; }
    .rb-preview.tpl-professional .rb-h-info .rb-contacts { font-size: 12px; color: #444; line-height: 1.7; word-break: break-word; }
    .rb-preview.tpl-professional .rb-body { padding: 24px 40px; }

    /* ===== MINIMAL ===== */
    .rb-preview.tpl-minimal .rb-h { padding: 30px 40px 16px; }
    .rb-preview.tpl-minimal .rb-h-photo { width: 90px; height: 110px; border-radius: 6px; object-fit: cover; }
    .rb-preview.tpl-minimal .rb-h-info h1 { margin: 0 0 4px; font-size: 30px; font-weight: 300; letter-spacing: 1px; }
    .rb-preview.tpl-minimal .rb-h-info .rb-title { font-size: 14px; color: #888; margin-bottom: 10px; }
    .rb-preview.tpl-minimal .rb-h-info .rb-contacts { font-size: 12px; color: #666; line-height: 1.7; word-break: break-word; }
    .rb-preview.tpl-minimal .rb-body { padding: 16px 40px 30px; }

    /* ===== ATS CLASSIC ===== */
    .rb-preview.tpl-ats .rb-h { padding: 26px 40px 16px; border-bottom: 2px solid #333; }
    .rb-preview.tpl-ats .rb-h-photo { width: 90px; height: 110px; border-radius: 4px; object-fit: cover; border: 1px solid #999; }
    .rb-preview.tpl-ats .rb-h-info h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #111; }
    .rb-preview.tpl-ats .rb-h-info .rb-title { font-size: 14px; color: #444; margin-bottom: 8px; }
    .rb-preview.tpl-ats .rb-h-info .rb-contacts { font-size: 11.5px; color: #555; line-height: 1.6; word-break: break-word; }
    .rb-preview.tpl-ats .rb-body { padding: 20px 40px; }
    .rb-preview.tpl-ats .rb-sec-title { color: #111; border-bottom: 1.5px solid #333; }
    .rb-preview.tpl-ats .rb-edu-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; }
    .rb-preview.tpl-ats .rb-edu-table th { background: #f0f0f0; border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-weight: 700; color: #222; }
    .rb-preview.tpl-ats .rb-edu-table td { border: 1px solid #ccc; padding: 6px 8px; color: #333; }

    /* ===== EXECUTIVE SERIF ===== */
    .rb-preview.tpl-executive { font-family: Georgia, 'Times New Roman', serif; }
    .rb-preview.tpl-executive .rb-h { padding: 28px 40px 16px; border-bottom: 1px solid #999; }
    .rb-preview.tpl-executive .rb-h-photo { width: 95px; height: 115px; border-radius: 4px; object-fit: cover; border: 1px solid #666; }
    .rb-preview.tpl-executive .rb-h-info h1 { margin: 0 0 4px; font-size: 26px; font-weight: 400; letter-spacing: 1px; color: #111; }
    .rb-preview.tpl-executive .rb-h-info .rb-title { font-size: 14px; color: #555; font-style: italic; margin-bottom: 8px; }
    .rb-preview.tpl-executive .rb-h-info .rb-contacts { font-size: 11.5px; color: #555; line-height: 1.6; word-break: break-word; }
    .rb-preview.tpl-executive .rb-body { padding: 20px 40px; }
    .rb-preview.tpl-executive .rb-sec-title { color: #222; border-bottom: 1px solid #555; letter-spacing: 2px; }

    /* ===== SIDEBAR PROFESSIONAL ===== */
    .rb-preview.tpl-sidebar { display: grid; grid-template-columns: 260px 1fr; }
    .rb-preview.tpl-sidebar .rb-h { grid-column: 1; background: #2c3e50; color: #fff; padding: 30px 22px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; }
    .rb-preview.tpl-sidebar .rb-h-photo { width: 130px; height: 150px; border-radius: 6px; object-fit: cover; border: 3px solid rgba(255,255,255,.3); }
    .rb-preview.tpl-sidebar .rb-h-info h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; color: #fff; }
    .rb-preview.tpl-sidebar .rb-h-info .rb-title { font-size: 13px; color: #bdc3c7; margin-bottom: 14px; }
    .rb-preview.tpl-sidebar .rb-h-info .rb-contacts { font-size: 11.5px; color: #ecf0f1; line-height: 1.8; word-break: break-word; text-align: left; }
    .rb-preview.tpl-sidebar .rb-body { grid-column: 2; padding: 30px 32px; }
    .rb-preview.tpl-sidebar .rb-sec-title { color: #2c3e50; border-bottom: 1.5px solid #2c3e50; }

    /* ===== MODERN SIMPLE ===== */
    .rb-preview.tpl-simple .rb-h { text-align: center; padding: 28px 40px 18px; border-bottom: 1px solid #ddd; display: block; }
    .rb-preview.tpl-simple .rb-h-photo { width: 110px; height: 130px; border-radius: 6px; object-fit: cover; margin: 0 auto 12px; display: block; border: 2px solid #eee; }
    .rb-preview.tpl-simple .rb-h-info h1 { margin: 0 0 4px; font-size: 28px; font-weight: 600; color: #222; }
    .rb-preview.tpl-simple .rb-h-info .rb-title { font-size: 14px; color: #666; margin-bottom: 8px; letter-spacing: 1px; }
    .rb-preview.tpl-simple .rb-h-info .rb-contacts { font-size: 11.5px; color: #666; line-height: 1.7; word-break: break-word; }
    .rb-preview.tpl-simple .rb-body { padding: 20px 40px; }
    .rb-preview.tpl-simple .rb-sec-title { color: #333; border-bottom: 2px solid #333; letter-spacing: 1.5px; }

    /* ===== SECTIONS ===== */
    .rb-sec { margin-bottom: 18px; }
    .rb-sec-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--rc,#00d4ff); border-bottom: 1.5px solid var(--rc,#00d4ff); padding-bottom: 4px; margin-bottom: 10px; }
    .rb-sec p { margin: 0 0 6px; font-size: 12.5px; line-height: 1.55; color: #333; }
    .rb-entry { margin-bottom: 12px; }
    .rb-entry-top { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
    .rb-entry-top strong { font-size: 13.5px; color: #111; }
    .rb-entry-top em { font-size: 11.5px; color: #666; font-style: normal; }
    .rb-entry-sub { font-size: 12px; color: #555; margin: 2px 0 4px; }
    .rb-entry ul { margin: 4px 0 0; padding-left: 18px; }
    .rb-entry li { font-size: 12px; line-height: 1.5; color: #333; margin-bottom: 2px; }

    /* ===== PRINT ===== */
    @media print {
      @page { size: A4; margin: 0; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        width: 210mm !important;
        height: auto !important;
        overflow: visible !important;
      }
      body * { visibility: hidden !important; }
      .rb-preview, .rb-preview * { visibility: visible !important; }
      .rb-preview {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 210mm !important;
        max-width: 210mm !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        transform: none !important;
        background: #fff !important;
        display: block !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .rb-preview * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .rb-preview img {
        image-rendering: -webkit-optimize-contrast !important;
        image-rendering: crisp-edges !important;
        max-width: 100% !important;
      }
    }

    @media (max-width: 768px) {
      .rb-grid { grid-template-columns: 1fr; }
      .rb-preview-wrap { padding: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .rb-preview { width: 794px; transform: none; }
      .rb-actions { position: static; }
      .rb-tab { font-size: 12px; padding: 8px 12px; }
    }
  `;
  document.head.appendChild(style);
})();

// ====== STATE ======
window.rbData = {
  personal: { name:'', title:'', photo:'', phone:'', email:'', address:'', city:'', state:'', country:'', linkedin:'', portfolio:'', github:'', other:'' },
  summary: '',
  education: [],
  experience: [],
  skills: { technical: [], soft: [], languages: [] },
  projects: [],
  certifications: [],
  languages: [],
  template: 'modern',
  themeColor: '#00d4ff',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  fontSize: 12,
  sectionOrder: ['summary','experience','education','skills','projects','certifications','languages']
};

// ====== FORM RENDER ======
window.EXTRA_TOOL_RENDERERS['resume-builder'] = () => `
<div class="rb-wrap">
  <div class="rb-actions">
    <button class="rb-btn primary" onclick="rbSave()">💾 Save</button>
    <button class="rb-btn success" onclick="rbGoToPreview()">👁️ Preview</button>
    <button class="rb-btn ghost" onclick="rbDownloadPDF()">📥 PDF Ultra HD</button>
    <button class="rb-btn ghost" onclick="rbPrint()">🖨️ Print</button>
    <button class="rb-btn ghost" onclick="rbDuplicate()">📋 Copy</button>
    <button class="rb-btn danger" onclick="rbReset()">🔄 Reset</button>
  </div>
  <div class="rb-actions-hint">
    💾 <strong>Save</strong> = data browser me save (auto-save bhi hota hai) &nbsp;•&nbsp; 
    👁️ <strong>Preview</strong> = resume dekho &nbsp;•&nbsp; 
    📥 <strong>PDF</strong> = ultra HD download
  </div>

  <div class="rb-progress"><div class="rb-progress-fill" id="rbProgress" style="width:0%"></div></div>

  <div class="rb-tabs">
    <button class="rb-tab active" data-tab="personal">👤 Personal</button>
    <button class="rb-tab" data-tab="summary">📝 Summary</button>
    <button class="rb-tab" data-tab="experience">💼 Experience</button>
    <button class="rb-tab" data-tab="education">🎓 Education</button>
    <button class="rb-tab" data-tab="skills">⚡ Skills</button>
    <button class="rb-tab" data-tab="projects">🚀 Projects</button>
    <button class="rb-tab" data-tab="certifications">📜 Certifications</button>
    <button class="rb-tab" data-tab="languages">🌐 Languages</button>
    <button class="rb-tab" data-tab="design">🎨 Design</button>
    <button class="rb-tab" data-tab="preview">👁️ Preview</button>
  </div>

  <div class="rb-panel active" data-panel="personal">
    <div class="rb-section">
      <h3>👤 Personal Information</h3>
      <div class="rb-grid">
        <div class="rb-field"><label>Full Name *</label><input id="rbName" placeholder="Rahul Sharma" oninput="rbSet('personal.name',this.value)"></div>
        <div class="rb-field"><label>Professional Title</label><input id="rbTitle" placeholder="Software Engineer" oninput="rbSet('personal.title',this.value)"></div>
        <div class="rb-field"><label>Mobile Number *</label><input id="rbPhone" placeholder="+91 98765 43210" oninput="rbSet('personal.phone',this.value)"></div>
        <div class="rb-field"><label>Email *</label><input id="rbEmail" placeholder="rahul@email.com" oninput="rbSet('personal.email',this.value)"></div>
        <div class="rb-field"><label>City</label><input id="rbCity" placeholder="Mumbai" oninput="rbSet('personal.city',this.value)"></div>
        <div class="rb-field"><label>State</label><input id="rbState" placeholder="Maharashtra" oninput="rbSet('personal.state',this.value)"></div>
        <div class="rb-field"><label>Country</label><input id="rbCountry" placeholder="India" oninput="rbSet('personal.country',this.value)"></div>
        <div class="rb-field"><label>Address</label><input id="rbAddress" placeholder="Andheri West" oninput="rbSet('personal.address',this.value)"></div>
        <div class="rb-field"><label>LinkedIn URL</label><input id="rbLinkedin" placeholder="linkedin.com/in/rahul" oninput="rbSet('personal.linkedin',this.value)"></div>
        <div class="rb-field"><label>Portfolio Website</label><input id="rbPortfolio" placeholder="rahul.dev" oninput="rbSet('personal.portfolio',this.value)"></div>
        <div class="rb-field"><label>GitHub URL</label><input id="rbGithub" placeholder="github.com/rahul" oninput="rbSet('personal.github',this.value)"></div>
        <div class="rb-field"><label>Other Link</label><input id="rbOther" placeholder="twitter.com/rahul" oninput="rbSet('personal.other',this.value)"></div>
      </div>
      <div class="rb-field" style="margin-top:10px">
        <label>Profile Photo (optional) — Max 20 MB</label>
        <input type="file" accept="image/*" id="rbPhoto">
        <div id="rbPhotoPreviewWrap"></div>
      </div>
    </div>
  </div>

  <div class="rb-panel" data-panel="summary">
    <div class="rb-section">
      <h3>📝 Professional Summary</h3>
      <div class="rb-field">
        <label>Career Objective / Summary</label>
        <textarea id="rbSummary" rows="6" maxlength="800" placeholder="Experienced software engineer with 5+ years..." oninput="rbSet('summary',this.value);document.getElementById('rbSumCount').textContent=this.value.length+'/800'"></textarea>
        <div class="rb-counter" id="rbSumCount">0/800</div>
      </div>
    </div>
  </div>

  <div class="rb-panel" data-panel="experience">
    <div class="rb-section">
      <h3>💼 Work Experience</h3>
      <div id="rbExpList"></div>
      <button class="rb-add" onclick="rbAddExp()">+ Add Experience</button>
    </div>
  </div>

  <div class="rb-panel" data-panel="education">
    <div class="rb-section">
      <h3>🎓 Education</h3>
      <div id="rbEduList"></div>
      <button class="rb-add" onclick="rbAddEdu()">+ Add Education</button>
    </div>
  </div>

  <div class="rb-panel" data-panel="skills">
    <div class="rb-section">
      <h3>⚡ Skills</h3>
      <div class="rb-field" style="margin-bottom:12px">
        <label>Technical Skills (comma separated)</label>
        <input id="rbTech" placeholder="JavaScript, React, Node.js" oninput="rbSkillInput('technical',this.value)">
        <div id="rbTechChips"></div>
      </div>
      <div class="rb-field" style="margin-bottom:12px">
        <label>Soft Skills (comma separated)</label>
        <input id="rbSoft" placeholder="Communication, Leadership" oninput="rbSkillInput('soft',this.value)">
        <div id="rbSoftChips"></div>
      </div>
      <div class="rb-field">
        <label>Languages (comma separated)</label>
        <input id="rbLangSkill" placeholder="English, Hindi, Marathi" oninput="rbSkillInput('languages',this.value)">
        <div id="rbLangChips"></div>
      </div>
    </div>
  </div>

  <div class="rb-panel" data-panel="projects">
    <div class="rb-section">
      <h3>🚀 Projects</h3>
      <div id="rbProjList"></div>
      <button class="rb-add" onclick="rbAddProj()">+ Add Project</button>
    </div>
  </div>

  <div class="rb-panel" data-panel="certifications">
    <div class="rb-section">
      <h3>📜 Certifications</h3>
      <div id="rbCertList"></div>
      <button class="rb-add" onclick="rbAddCert()">+ Add Certification</button>
    </div>
  </div>

  <div class="rb-panel" data-panel="languages">
    <div class="rb-section">
      <h3>🌐 Languages</h3>
      <div id="rbLangList"></div>
      <button class="rb-add" onclick="rbAddLang()">+ Add Language</button>
    </div>
  </div>

  <div class="rb-panel" data-panel="design">
    <div class="rb-section">
      <h3>🎨 Design Customization</h3>
      <div class="rb-grid">
        <div class="rb-field"><label>Template</label>
          <select id="rbTemplate" onchange="rbSet('template',this.value)">
            <option value="modern">Modern</option>
            <option value="professional">Professional</option>
            <option value="minimal">Minimal</option>
            <option value="ats">ATS Classic</option>
            <option value="executive">Executive Serif</option>
            <option value="sidebar">Sidebar Professional</option>
            <option value="simple">Modern Simple</option>
          </select>
        </div>
        <div class="rb-field"><label>Theme Color</label>
          <input type="color" id="rbTheme" value="#00d4ff" onchange="rbSet('themeColor',this.value)">
        </div>
        <div class="rb-field"><label>Font Family</label>
          <select id="rbFont" onchange="rbSet('fontFamily',this.value)">
            <option value="'Segoe UI', Arial, sans-serif">Segoe UI</option>
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>
        </div>
        <div class="rb-field"><label>Font Size (px)</label>
          <input type="number" id="rbFontSize" min="9" max="16" value="12" oninput="rbSet('fontSize',+this.value)">
        </div>
      </div>
      <div style="margin-top:12px">
        <label style="font-size:11px;opacity:.75;text-transform:uppercase;color:#e0e0e0">Section Order (click ↑↓)</label>
        <div id="rbOrderList" style="margin-top:6px"></div>
      </div>
    </div>
  </div>

  <div class="rb-panel" data-panel="preview">
    <div class="rb-preview-wrap">
      <div id="rbPreview" class="rb-preview tpl-modern"></div>
    </div>
  </div>
</div>

<div class="rb-crop-modal" id="rbCropModal">
  <div class="rb-crop-header">
    <h3>✂️ Crop Photo</h3>
    <button class="rb-btn ghost small" onclick="rbCropCancel()" style="padding:8px 14px">✕</button>
  </div>
  <div class="rb-crop-body">
    <img id="rbCropImage" src="" alt="Crop">
  </div>
  <div class="rb-crop-footer">
    <button class="cancel" onclick="rbCropCancel()">Cancel</button>
    <button class="apply" onclick="rbCropApply()">✓ Apply Crop</button>
  </div>
</div>
`;

// ====== INIT ======
window.EXTRA_TOOL_INITS['resume-builder'] = () => {
  document.querySelectorAll('.rb-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.rb-tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.rb-panel').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const panel = document.querySelector(`.rb-panel[data-panel="${t.dataset.tab}"]`);
      if (panel) panel.classList.add('active');
      if (t.dataset.tab === 'preview') rbPreviewRefresh();
    });
  });

  const photoInput = document.getElementById('rbPhoto');
  if (photoInput) {
    photoInput.addEventListener('change', window.rbHandlePhoto);
  }

  rbLoad();
  rbUpdateProgress();
  rbRenderOrder();
  rbRenderPhotoPreview();
};

// ====== HELPERS ======
window.rbSet = (path, val) => {
  const parts = path.split('.');
  let o = rbData;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = val;
  rbAutoSave();
  rbUpdateProgress();
  if (path === 'template' || path === 'themeColor' || path === 'fontFamily' || path === 'fontSize') {
    rbPreviewRefresh();
  } else if (document.querySelector('.rb-tab.active')?.dataset.tab === 'preview') {
    rbPreviewRefresh();
  }
};

window.rbGoToPreview = () => {
  document.querySelectorAll('.rb-tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.rb-panel').forEach(x => x.classList.remove('active'));
  const previewTab = document.querySelector('.rb-tab[data-tab="preview"]');
  const previewPanel = document.querySelector('.rb-panel[data-panel="preview"]');
  if (previewTab) previewTab.classList.add('active');
  if (previewPanel) previewPanel.classList.add('active');
  rbPreviewRefresh();
  setTimeout(() => {
    const wrap = document.querySelector('.rb-preview-wrap');
    if (wrap) wrap.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
  rbToast('👁️ Preview opened');
};

window.rbAutoSave = () => {
  clearTimeout(window.rbSaveT);
  window.rbSaveT = setTimeout(() => {
    try { localStorage.setItem('qunverio_resume_data', JSON.stringify(rbData)); } catch(e){}
  }, 400);
};

window.rbSave = () => {
  try {
    const data = JSON.stringify(rbData);
    localStorage.setItem('qunverio_resume_data', data);
    const sizeKB = (data.length / 1024).toFixed(1);
    const old = document.getElementById('rbSaveToast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'rbSaveToast';
    t.innerHTML = `✅ <strong>Resume Saved!</strong><br><span style="font-size:11px;opacity:0.9">Data browser me safe hai — refresh pe bhi rahega</span><br><span style="font-size:10px;opacity:0.75">${sizeKB} KB • ${new Date().toLocaleTimeString('en-IN')}</span>`;
    t.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:16px 24px;border-radius:12px;font-size:14px;z-index:9999999;box-shadow:0 10px 30px rgba(16,185,129,.5);text-align:center;font-weight:600;min-width:240px;max-width:90vw';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  } catch(e) {
    console.error('Save error:', e);
    rbToast('❌ ' + (e.name === 'QuotaExceededError' ? 'Storage full!' : 'Save fail: ' + e.message));
  }
};

window.rbLoad = () => {
  try {
    const saved = localStorage.getItem('qunverio_resume_data');
    if (saved) { Object.assign(rbData, JSON.parse(saved)); }
  } catch(e){}
  rbFillForm();
};

window.rbFillForm = () => {
  const p = rbData.personal;
  const map = { rbName:'name', rbTitle:'title', rbPhone:'phone', rbEmail:'email', rbCity:'city', rbState:'state', rbCountry:'country', rbAddress:'address', rbLinkedin:'linkedin', rbPortfolio:'portfolio', rbGithub:'github', rbOther:'other' };
  for (const id in map) { const el = document.getElementById(id); if (el) el.value = p[map[id]] || ''; }
  const s = document.getElementById('rbSummary');
  if (s) { s.value = rbData.summary || ''; document.getElementById('rbSumCount').textContent = (rbData.summary||'').length + '/800'; }
  const tpl = document.getElementById('rbTemplate'); if (tpl) tpl.value = rbData.template || 'modern';
  const th = document.getElementById('rbTheme'); if (th) th.value = rbData.themeColor || '#00d4ff';
  const fn = document.getElementById('rbFont'); if (fn) fn.value = rbData.fontFamily || "'Segoe UI', Arial, sans-serif";
  const fs = document.getElementById('rbFontSize'); if (fs) fs.value = rbData.fontSize || 12;
  rbRenderEdu(); rbRenderExp(); rbRenderProj(); rbRenderCert(); rbRenderLang();
  const t = document.getElementById('rbTech'); if (t) t.value = rbData.skills.technical.join(', ');
  const sf = document.getElementById('rbSoft'); if (sf) sf.value = rbData.skills.soft.join(', ');
  const ls = document.getElementById('rbLangSkill'); if (ls) ls.value = rbData.skills.languages.join(', ');
  rbRenderChips();
  rbRenderOrder();
  rbRenderPhotoPreview();
};

window.rbToast = (msg) => {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:12px 22px;border-radius:10px;font-size:13px;z-index:999999;border:1px solid #00d4ff;box-shadow:0 4px 20px rgba(0,0,0,.4);max-width:90vw;text-align:center';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
};

// ====== PHOTO (ULTRA HD) ======
let rbCropper = null;

window.rbHandlePhoto = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 20 * 1024 * 1024) {
    rbToast('❌ Photo 20MB se choti honi chahiye');
    e.target.value = '';
    return;
  }
  const r = new FileReader();
  r.onload = ev => rbOpenCropModal(ev.target.result);
  r.onerror = () => rbToast('❌ Photo read nahi hui');
  r.readAsDataURL(f);
  e.target.value = '';
};

window.rbOpenCropModal = (src) => {
  const modal = document.getElementById('rbCropModal');
  const img = document.getElementById('rbCropImage');
  if (!modal || !img) return;
  img.src = src;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  img.onload = () => {
    if (rbCropper) { rbCropper.destroy(); rbCropper = null; }
    if (typeof Cropper === 'undefined') {
      rbData.personal.photo = src;
      rbAutoSave(); rbCloseCropModal(); rbRenderPhotoPreview(); rbPreviewRefresh();
      rbToast('⚠️ Crop library load nahi hui — original photo use ki');
      return;
    }
    rbCropper = new Cropper(img, {
      aspectRatio: 110 / 130,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.9,
      background: false,
      responsive: true,
      checkOrientation: false,
      modal: true,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      minContainerHeight: 300
    });
  };
};

window.rbCloseCropModal = () => {
  const modal = document.getElementById('rbCropModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  if (rbCropper) { rbCropper.destroy(); rbCropper = null; }
};

window.rbCropCancel = () => { rbCloseCropModal(); rbToast('Photo cancel kiya'); };

window.rbCropApply = () => {
  if (!rbCropper) return;
  try {
    // ULTRA HD: 1100×1300 (10x of display 110×130)
    const canvas = rbCropper.getCroppedCanvas({ width: 1100, height: 1300, imageSmoothingQuality: 'high' });
    rbData.personal.photo = canvas.toDataURL('image/jpeg', 1.0);
    rbAutoSave();
    rbCloseCropModal();
    rbRenderPhotoPreview();
    rbPreviewRefresh();
    rbToast('✅ Ultra HD Photo added!');
  } catch(e) {
    console.error(e);
    rbToast('❌ Crop apply nahi hua');
  }
};

window.rbRenderPhotoPreview = () => {
  const wrap = document.getElementById('rbPhotoPreviewWrap');
  if (!wrap) return;
  const photo = rbData.personal.photo;
  if (!photo) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `
    <div class="rb-photo-preview">
      <img src="${photo}" alt="Photo">
      <div class="rpp-info">
        <strong>✅ Ultra HD Photo ready</strong>
        <div>1100×1300 • 10x quality</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="rb-btn ghost small" onclick="rbEditPhoto()">✏️ Edit</button>
        <button class="rb-btn danger small" onclick="rbRemovePhoto()">🗑️ Remove</button>
      </div>
    </div>
  `;
};

window.rbEditPhoto = () => { if (rbData.personal.photo) rbOpenCropModal(rbData.personal.photo); };

window.rbRemovePhoto = () => {
  if (!confirm('Photo remove kar dein?')) return;
  rbData.personal.photo = '';
  rbAutoSave(); rbRenderPhotoPreview(); rbPreviewRefresh();
  rbToast('Photo removed');
};

// ====== SKILLS ======
window.rbSkillInput = (cat, val) => {
  rbData.skills[cat] = val.split(',').map(s => s.trim()).filter(Boolean);
  rbAutoSave(); rbRenderChips(); rbUpdateProgress();
};

window.rbRenderChips = () => {
  const map = { technical:'rbTechChips', soft:'rbSoftChips', languages:'rbLangChips' };
  for (const cat in map) {
    const el = document.getElementById(map[cat]); if (!el) continue;
    el.innerHTML = rbData.skills[cat].map((s,i) => `<span class="rb-chip">${s}<button onclick="rbRemoveSkill('${cat}',${i})">×</button></span>`).join('');
  }
};

window.rbRemoveSkill = (cat, i) => {
  rbData.skills[cat].splice(i,1);
  const map = { technical:'rbTech', soft:'rbSoft', languages:'rbLangSkill' };
  document.getElementById(map[cat]).value = rbData.skills[cat].join(', ');
  rbAutoSave(); rbRenderChips();
};

// ====== EDUCATION ======
window.rbAddEdu = () => {
  rbData.education.push({ degree:'', college:'', board:'', start:'', end:'', score:'', field:'' });
  rbRenderEdu(); rbAutoSave(); rbUpdateProgress();
};

window.rbRenderEdu = () => {
  const c = document.getElementById('rbEduList'); if (!c) return;
  c.innerHTML = rbData.education.map((e,i) => `
    <div class="rb-item">
      <div class="rb-item-head"><strong>Education #${i+1}</strong>
        <div class="rb-btns">
          ${i>0?`<button class="rb-btn ghost small" onclick="rbMoveEdu(${i},-1)">↑</button>`:''}
          ${i<rbData.education.length-1?`<button class="rb-btn ghost small" onclick="rbMoveEdu(${i},1)">↓</button>`:''}
          <button class="rb-btn danger small" onclick="rbDelEdu(${i})">✕</button>
        </div>
      </div>
      <div class="rb-grid">
        <div class="rb-field"><label>Degree</label><input value="${e.degree||''}" oninput="rbEduSet(${i},'degree',this.value)"></div>
        <div class="rb-field"><label>College/University</label><input value="${e.college||''}" oninput="rbEduSet(${i},'college',this.value)"></div>
        <div class="rb-field"><label>Board/Institute</label><input value="${e.board||''}" oninput="rbEduSet(${i},'board',this.value)"></div>
        <div class="rb-field"><label>Field of Study</label><input value="${e.field||''}" oninput="rbEduSet(${i},'field',this.value)"></div>
        <div class="rb-field"><label>Start Date</label><input value="${e.start||''}" placeholder="2020" oninput="rbEduSet(${i},'start',this.value)"></div>
        <div class="rb-field"><label>End Date</label><input value="${e.end||''}" placeholder="2024" oninput="rbEduSet(${i},'end',this.value)"></div>
        <div class="rb-field"><label>Score (CGPA/%)</label><input value="${e.score||''}" oninput="rbEduSet(${i},'score',this.value)"></div>
      </div>
    </div>
  `).join('');
};

window.rbEduSet = (i,k,v) => { rbData.education[i][k]=v; rbAutoSave(); };
window.rbDelEdu = (i) => { rbData.education.splice(i,1); rbRenderEdu(); rbAutoSave(); rbUpdateProgress(); };
window.rbMoveEdu = (i,d) => { const a=rbData.education; [a[i],a[i+d]]=[a[i+d],a[i]]; rbRenderEdu(); rbAutoSave(); };

// ====== EXPERIENCE ======
window.rbAddExp = () => {
  rbData.experience.push({ company:'', title:'', type:'Full-time', start:'', end:'', current:false, resp:'', ach:'', location:'' });
  rbRenderExp(); rbAutoSave(); rbUpdateProgress();
};

window.rbRenderExp = () => {
  const c = document.getElementById('rbExpList'); if (!c) return;
  c.innerHTML = rbData.experience.map((e,i) => `
    <div class="rb-item">
      <div class="rb-item-head"><strong>Experience #${i+1}</strong>
        <div class="rb-btns">
          ${i>0?`<button class="rb-btn ghost small" onclick="rbMoveExp(${i},-1)">↑</button>`:''}
          ${i<rbData.experience.length-1?`<button class="rb-btn ghost small" onclick="rbMoveExp(${i},1)">↓</button>`:''}
          <button class="rb-btn danger small" onclick="rbDelExp(${i})">✕</button>
        </div>
      </div>
      <div class="rb-grid">
        <div class="rb-field"><label>Company</label><input value="${e.company||''}" oninput="rbExpSet(${i},'company',this.value)"></div>
        <div class="rb-field"><label>Job Title</label><input value="${e.title||''}" oninput="rbExpSet(${i},'title',this.value)"></div>
        <div class="rb-field"><label>Employment Type</label>
          <select onchange="rbExpSet(${i},'type',this.value)">
            ${['Full-time','Part-time','Contract','Freelance','Internship'].map(t=>`<option ${e.type===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="rb-field"><label>Location</label><input value="${e.location||''}" oninput="rbExpSet(${i},'location',this.value)"></div>
        <div class="rb-field"><label>Start Date</label><input value="${e.start||''}" placeholder="Jan 2022" oninput="rbExpSet(${i},'start',this.value)"></div>
        <div class="rb-field"><label>End Date</label><input value="${e.end||''}" placeholder="Present" oninput="rbExpSet(${i},'end',this.value)" ${e.current?'disabled':''}></div>
      </div>
      <div class="rb-field" style="margin-top:8px">
        <label style="text-transform:none;display:flex;align-items:center;gap:6px"><input type="checkbox" ${e.current?'checked':''} onchange="rbExpSet(${i},'current',this.checked);rbRenderExp()" style="width:auto"> Currently Working Here</label>
      </div>
      <div class="rb-field" style="margin-top:8px"><label>Responsibilities (one per line)</label><textarea oninput="rbExpSet(${i},'resp',this.value)">${e.resp||''}</textarea></div>
      <div class="rb-field" style="margin-top:8px"><label>Achievements (one per line)</label><textarea oninput="rbExpSet(${i},'ach',this.value)">${e.ach||''}</textarea></div>
    </div>
  `).join('');
};

window.rbExpSet = (i,k,v) => { rbData.experience[i][k]=v; rbAutoSave(); };
window.rbDelExp = (i) => { rbData.experience.splice(i,1); rbRenderExp(); rbAutoSave(); rbUpdateProgress(); };
window.rbMoveExp = (i,d) => { const a=rbData.experience; [a[i],a[i+d]]=[a[i+d],a[i]]; rbRenderExp(); rbAutoSave(); };

// ====== PROJECTS ======
window.rbAddProj = () => {
  rbData.projects.push({ name:'', desc:'', tech:'', duration:'', link:'', github:'' });
  rbRenderProj(); rbAutoSave(); rbUpdateProgress();
};

window.rbRenderProj = () => {
  const c = document.getElementById('rbProjList'); if (!c) return;
  c.innerHTML = rbData.projects.map((p,i) => `
    <div class="rb-item">
      <div class="rb-item-head"><strong>Project #${i+1}</strong>
        <button class="rb-btn danger small" onclick="rbDelProj(${i})">✕</button>
      </div>
      <div class="rb-grid">
        <div class="rb-field"><label>Project Name</label><input value="${p.name||''}" oninput="rbProjSet(${i},'name',this.value)"></div>
        <div class="rb-field"><label>Duration</label><input value="${p.duration||''}" placeholder="Jan-Mar 2024" oninput="rbProjSet(${i},'duration',this.value)"></div>
        <div class="rb-field"><label>Technologies Used</label><input value="${p.tech||''}" placeholder="React, Node.js" oninput="rbProjSet(${i},'tech',this.value)"></div>
        <div class="rb-field"><label>Project Link</label><input value="${p.link||''}" oninput="rbProjSet(${i},'link',this.value)"></div>
        <div class="rb-field"><label>GitHub Link</label><input value="${p.github||''}" oninput="rbProjSet(${i},'github',this.value)"></div>
      </div>
      <div class="rb-field" style="margin-top:8px"><label>Description</label><textarea oninput="rbProjSet(${i},'desc',this.value)">${p.desc||''}</textarea></div>
    </div>
  `).join('');
};

window.rbProjSet = (i,k,v) => { rbData.projects[i][k]=v; rbAutoSave(); };
window.rbDelProj = (i) => { rbData.projects.splice(i,1); rbRenderProj(); rbAutoSave(); rbUpdateProgress(); };

// ====== CERTIFICATIONS ======
window.rbAddCert = () => {
  rbData.certifications.push({ name:'', org:'', date:'', expiry:'', id:'', url:'' });
  rbRenderCert(); rbAutoSave(); rbUpdateProgress();
};

window.rbRenderCert = () => {
  const c = document.getElementById('rbCertList'); if (!c) return;
  c.innerHTML = rbData.certifications.map((x,i) => `
    <div class="rb-item">
      <div class="rb-item-head"><strong>Certification #${i+1}</strong>
        <button class="rb-btn danger small" onclick="rbDelCert(${i})">✕</button>
      </div>
      <div class="rb-grid">
        <div class="rb-field"><label>Certificate Name</label><input value="${x.name||''}" oninput="rbCertSet(${i},'name',this.value)"></div>
        <div class="rb-field"><label>Issuing Org</label><input value="${x.org||''}" oninput="rbCertSet(${i},'org',this.value)"></div>
        <div class="rb-field"><label>Issue Date</label><input value="${x.date||''}" oninput="rbCertSet(${i},'date',this.value)"></div>
        <div class="rb-field"><label>Expiry Date</label><input value="${x.expiry||''}" oninput="rbCertSet(${i},'expiry',this.value)"></div>
        <div class="rb-field"><label>Certificate ID</label><input value="${x.id||''}" oninput="rbCertSet(${i},'id',this.value)"></div>
        <div class="rb-field"><label>Verification URL</label><input value="${x.url||''}" oninput="rbCertSet(${i},'url',this.value)"></div>
      </div>
    </div>
  `).join('');
};

window.rbCertSet = (i,k,v) => { rbData.certifications[i][k]=v; rbAutoSave(); };
window.rbDelCert = (i) => { rbData.certifications.splice(i,1); rbRenderCert(); rbAutoSave(); rbUpdateProgress(); };

// ====== LANGUAGES ======
window.rbAddLang = () => {
  rbData.languages.push({ name:'', level:'Fluent' });
  rbRenderLang(); rbAutoSave(); rbUpdateProgress();
};

window.rbRenderLang = () => {
  const c = document.getElementById('rbLangList'); if (!c) return;
  c.innerHTML = rbData.languages.map((l,i) => `
    <div class="rb-item">
      <div class="rb-item-head"><strong>Language #${i+1}</strong>
        <button class="rb-btn danger small" onclick="rbDelLang(${i})">✕</button>
      </div>
      <div class="rb-grid">
        <div class="rb-field"><label>Language</label><input value="${l.name||''}" oninput="rbLangSet(${i},'name',this.value)"></div>
        <div class="rb-field"><label>Proficiency</label>
          <select onchange="rbLangSet(${i},'level',this.value)">
            ${['Basic','Conversational','Fluent','Native'].map(x=>`<option ${l.level===x?'selected':''}>${x}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `).join('');
};

window.rbLangSet = (i,k,v) => { rbData.languages[i][k]=v; rbAutoSave(); };
window.rbDelLang = (i) => { rbData.languages.splice(i,1); rbRenderLang(); rbAutoSave(); rbUpdateProgress(); };

// ====== SECTION ORDER ======
window.rbRenderOrder = () => {
  const c = document.getElementById('rbOrderList'); if (!c) return;
  c.innerHTML = rbData.sectionOrder.map((s,i) => `
    <div class="rb-chip" style="cursor:default;text-transform:capitalize">${s}
      ${i>0?`<button onclick="rbMoveSec(${i},-1)" style="color:#00d4ff">↑</button>`:''}
      ${i<rbData.sectionOrder.length-1?`<button onclick="rbMoveSec(${i},1)" style="color:#00d4ff">↓</button>`:''}
    </div>
  `).join('');
};

window.rbMoveSec = (i,d) => { const a=rbData.sectionOrder; [a[i],a[i+d]]=[a[i+d],a[i]]; rbRenderOrder(); rbAutoSave(); rbPreviewRefresh(); };

// ====== PROGRESS ======
window.rbUpdateProgress = () => {
  let filled = 0, total = 10;
  const p = rbData.personal;
  if (p.name) filled++;
  if (p.phone) filled++;
  if (p.email) filled++;
  if (rbData.summary && rbData.summary.length > 30) filled++;
  if (rbData.education.length) filled++;
  if (rbData.experience.length) filled++;
  if (rbData.skills.technical.length) filled++;
  if (rbData.projects.length) filled++;
  if (rbData.certifications.length) filled++;
  if (rbData.languages.length) filled++;
  const bar = document.getElementById('rbProgress');
  if (bar) bar.style.width = Math.round((filled/total)*100) + '%';
};

// ====== PREVIEW ======
window.rbPreviewRefresh = () => {
  const el = document.getElementById('rbPreview'); if (!el) return;
  const p = rbData.personal;
  const tpl = rbData.template || 'modern';
  el.className = 'rb-preview tpl-' + tpl;
  el.style.setProperty('--rc', rbData.themeColor || '#00d4ff');
  el.style.fontFamily = rbData.fontFamily || "'Segoe UI', Arial, sans-serif";
  el.style.fontSize = (rbData.fontSize || 12) + 'px';

  const contacts = [
    p.phone && `📞 ${p.phone}`,
    p.email && `✉️ ${p.email}`,
    (p.city||p.state||p.country) && `📍 ${[p.city,p.state,p.country].filter(Boolean).join(', ')}`,
    p.linkedin && `💼 ${p.linkedin}`,
    p.portfolio && `🌐 ${p.portfolio}`,
    p.github && `💻 ${p.github}`,
    p.other && `🔗 ${p.other}`
  ].filter(Boolean).join(' • ');

  const photoHtml = p.photo ? `<img src="${p.photo}" class="rb-h-photo" alt="Profile">` : '';

  const infoHtml = `
    <div class="rb-h-info">
      <h1>${p.name || 'Your Name'}</h1>
      <div class="rb-title">${p.title || 'Professional Title'}</div>
      <div class="rb-contacts">${contacts || 'Contact info'}</div>
    </div>`;

  let header;
  if (tpl === 'sidebar' || tpl === 'simple') {
    header = `<div class="rb-h">${photoHtml}${infoHtml}</div>`;
  } else {
    header = `<div class="rb-h">${infoHtml}${photoHtml}</div>`;
  }

  let body = '<div class="rb-body">';
  for (const sec of rbData.sectionOrder) {
    body += rbRenderSection(sec, tpl);
  }
  body += '</div>';

  el.innerHTML = header + body;
};

function rbRenderSection(sec, tpl) {
  if (sec === 'summary' && rbData.summary) {
    return `<div class="rb-sec"><div class="rb-sec-title">Professional Summary</div><p>${rbData.summary.replace(/\n/g,'<br>')}</p></div>`;
  }
  if (sec === 'experience' && rbData.experience.length) {
    return `<div class="rb-sec"><div class="rb-sec-title">Work Experience</div>${rbData.experience.map(e => `
      <div class="rb-entry">
        <div class="rb-entry-top"><strong>${e.title||'Job Title'}</strong><em>${e.start||''} - ${e.current?'Present':(e.end||'')}</em></div>
        <div class="rb-entry-sub">${e.company||'Company'}${e.location?` • ${e.location}`:''}${e.type?` • ${e.type}`:''}</div>
        ${e.resp?`<ul>${e.resp.split('\n').filter(Boolean).map(r=>`<li>${r}</li>`).join('')}</ul>`:''}
        ${e.ach?`<ul>${e.ach.split('\n').filter(Boolean).map(a=>`<li>${a}</li>`).join('')}</ul>`:''}
      </div>`).join('')}</div>`;
  }
  if (sec === 'education' && rbData.education.length) {
    if (tpl === 'ats') {
      return `<div class="rb-sec"><div class="rb-sec-title">Education</div>
        <table class="rb-edu-table">
          <thead><tr><th>Course / Degree</th><th>School / University</th><th>Grade / Score</th><th>Year</th></tr></thead>
          <tbody>${rbData.education.map(e => `<tr><td>${e.degree||''}</td><td>${e.college||''}</td><td>${e.score||''}</td><td>${e.end||''}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
    }
    return `<div class="rb-sec"><div class="rb-sec-title">Education</div>${rbData.education.map(e => `
      <div class="rb-entry">
        <div class="rb-entry-top"><strong>${e.degree||'Degree'}</strong><em>${e.start||''} - ${e.end||''}</em></div>
        <div class="rb-entry-sub">${e.college||'College'}${e.board?` • ${e.board}`:''}${e.field?` • ${e.field}`:''}${e.score?` • ${e.score}`:''}</div>
      </div>`).join('')}</div>`;
  }
  if (sec === 'skills') {
    const s = rbData.skills;
    if (!s.technical.length && !s.soft.length && !s.languages.length) return '';
    return `<div class="rb-sec"><div class="rb-sec-title">Skills</div>
      ${s.technical.length?`<p><strong>Technical:</strong> ${s.technical.join(', ')}</p>`:''}
      ${s.soft.length?`<p><strong>Soft Skills:</strong> ${s.soft.join(', ')}</p>`:''}
      ${s.languages.length?`<p><strong>Languages:</strong> ${s.languages.join(', ')}</p>`:''}
    </div>`;
  }
  if (sec === 'projects' && rbData.projects.length) {
    return `<div class="rb-sec"><div class="rb-sec-title">Projects</div>${rbData.projects.map(pr => `
      <div class="rb-entry">
        <div class="rb-entry-top"><strong>${pr.name||'Project'}</strong><em>${pr.duration||''}</em></div>
        ${pr.tech?`<div class="rb-entry-sub">${pr.tech}</div>`:''}
        ${pr.desc?`<p>${pr.desc}</p>`:''}
        ${pr.link?`<p style="font-size:11px;color:#666">🔗 ${pr.link}</p>`:''}
      </div>`).join('')}</div>`;
  }
  if (sec === 'certifications' && rbData.certifications.length) {
    return `<div class="rb-sec"><div class="rb-sec-title">Certifications</div>${rbData.certifications.map(c => `
      <div class="rb-entry">
        <div class="rb-entry-top"><strong>${c.name||'Certificate'}</strong><em>${c.date||''}</em></div>
        <div class="rb-entry-sub">${c.org||''}${c.id?` • ID: ${c.id}`:''}</div>
      </div>`).join('')}</div>`;
  }
  if (sec === 'languages' && rbData.languages.length) {
    return `<div class="rb-sec"><div class="rb-sec-title">Languages</div><p>${rbData.languages.map(l=>`${l.name} (${l.level})`).join(', ')}</p></div>`;
  }
  return '';
}

// ====== PDF ULTRA HD (8x) ======
window.rbDownloadPDF = async () => {
  rbPreviewRefresh();
  const el = document.getElementById('rbPreview');
  if (!el) return;
  rbToast('⏳ Ultra HD PDF ban raha hai (8x quality)...');
  try {
    if (typeof htmlToImage === 'undefined' || typeof jspdf === 'undefined') {
      rbToast('❌ Libraries load nahi hui'); return;
    }

    const oldTransform = el.style.transform;
    const oldWidth = el.style.width;
    const oldHeight = el.style.height;
    const oldMarginBottom = el.style.marginBottom;

    el.style.transform = 'none';
    el.style.width = '794px';
    el.style.height = 'auto';
    el.style.marginBottom = '0';

    await new Promise(r => setTimeout(r, 200));

    // 8x ULTRA HD
    const canvas = await htmlToImage.toCanvas(el, {
      pixelRatio: 8,
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: 794,
      height: el.scrollHeight
    });

    el.style.transform = oldTransform;
    el.style.width = oldWidth;
    el.style.height = oldHeight;
    el.style.marginBottom = oldMarginBottom;

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: false
    });

    pdf.setProperties({
      title: (rbData.personal.name || 'Resume') + ' - Resume',
      subject: 'Resume',
      author: rbData.personal.name || 'Qunverio User',
      creator: 'Qunverio Resume Builder'
    });

    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const imgW = pw;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (imgH <= ph + 5) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
    } else {
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
      heightLeft -= ph;
      while (heightLeft > 5) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
        heightLeft -= ph;
      }
    }

    const fileName = (rbData.personal.name || 'resume').replace(/\s+/g,'_') + '_Resume.pdf';
    pdf.save(fileName);
    rbToast('✅ Ultra HD PDF downloaded (8x)!');
  } catch(e) {
    console.error(e);
    rbToast('❌ PDF error: ' + e.message);
  }
};

// ====== PRINT ULTRA HD ======
window.rbPrint = () => {
  rbPreviewRefresh();
  setTimeout(() => {
    window.print();
  }, 500);
};

// ====== DUPLICATE / RESET ======
window.rbDuplicate = () => {
  const copy = JSON.parse(JSON.stringify(rbData));
  copy.personal.name = (copy.personal.name || 'Resume') + ' (Copy)';
  localStorage.setItem('qunverio_resume_data', JSON.stringify(copy));
  rbData = copy;
  rbFillForm(); rbPreviewRefresh();
  rbToast('📋 Duplicated!');
};

window.rbReset = () => {
  if (!confirm('Sab data delete ho jayega. Sure?')) return;
  localStorage.removeItem('qunverio_resume_data');
  location.reload();
};

console.log('✅ Resume Builder loaded (v11 - Ultra HD 8x, photo 1100×1300)');