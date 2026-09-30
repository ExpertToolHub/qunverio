/* ============================================================
   QUNVERIO — AI TOOL (tools/ai-tool.js)
   Full-screen AI workspace: text + image + PDF + tool execution
   ============================================================ */

console.log('%cQunverio AI Tool Loading...', 'color:#8b5cf6;font-weight:bold');

(function () {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const CONFIG = {
    API_ENDPOINT: '/api/ai',
    MAX_IMAGE_DIM: 1600,
    HISTORY_LIMIT: 50,
    DEBUG: false
  };

  const state = {
    messages: [],
    currentFile: null,       // { kind:'image'|'pdf', ... }
    history: [],
    isOpen: false,
    isBusy: false,
    debug: false
  };

  // ============================================================
  // IMAGE TOOL REGISTRY
  // ============================================================
  const IMAGE_TOOL_REGISTRY = {
    image_resize: {
      name: 'Resize Image',
      description: 'Resize image to specific width x height in pixels.',
      required: ['width', 'height'],
      requiresFile: 'image',
      execute: async (p, ctx) => await imageResize(p, ctx)
    },
    image_compress: {
      name: 'Compress Image',
      description: 'Compress image to a target maximum size in KB.',
      required: ['maxSizeKB'],
      requiresFile: 'image',
      execute: async (p, ctx) => await imageCompress(p, ctx)
    },
    image_convert: {
      name: 'Convert Image Format',
      description: 'Convert image to jpg, png, or webp.',
      required: ['format'],
      requiresFile: 'image',
      execute: async (p, ctx) => await imageConvert(p, ctx)
    },
    image_crop: {
      name: 'Crop Image',
      description: 'Crop image to a square or rectangle (center crop).',
      required: ['width', 'height'],
      requiresFile: 'image',
      execute: async (p, ctx) => await imageCrop(p, ctx)
    },
    image_rotate: {
      name: 'Rotate Image',
      description: 'Rotate image by 90, 180, or 270 degrees.',
      required: ['degrees'],
      requiresFile: 'image',
      execute: async (p, ctx) => await imageRotate(p, ctx)
    },
    image_flip: {
      name: 'Flip Image',
      description: 'Flip image horizontally or vertically.',
      required: ['direction'],
      requiresFile: 'image',
      execute: async (p, ctx) => await imageFlip(p, ctx)
    }
  };

  // ============================================================
  // DOM
  // ============================================================
  let dom = null;

  function injectStyles() {
    if (document.getElementById('qai-styles')) return;
    const css = `
      #qai-workspace { position: fixed; inset: 0; z-index: 99999; background: #0a0e1a; color: #e6ecf5; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
      #qai-workspace.qai-hidden { display: none; }
      .qai-shell { display: flex; flex-direction: column; height: 100vh; }
      .qai-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #1e2738; background: #121826; flex-shrink: 0; }
      .qai-brand { display: flex; align-items: center; gap: 10px; }
      .qai-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#6366f1,#ec4899); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: #fff; }
      .qai-title { font-weight: 700; font-size: 1rem; }
      .qai-subtitle { font-size: .72rem; color: #6b7a91; }
      .qai-header-actions { display: flex; gap: 6px; }
      .qai-icon-btn { background: #1a2233; border: 1px solid #2c3a55; color: #c7d3e6; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; font-size: 1rem; }
      .qai-icon-btn:hover { border-color: #6366f1; color: #fff; }
      .qai-main { flex: 1; display: grid; grid-template-columns: 240px 1fr 260px; overflow: hidden; }
      @media (max-width: 900px) { .qai-main { grid-template-columns: 1fr; } .qai-sidebar, .qai-props { display: none; } }
      .qai-sidebar, .qai-props { background: #0f1622; border-right: 1px solid #1e2738; padding: 14px; overflow-y: auto; }
      .qai-props { border-right: none; border-left: 1px solid #1e2738; }
      .qai-section-title { font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: #6b7a91; margin-bottom: 10px; }
      .qai-empty { color: #4a5669; font-size: .82rem; font-style: italic; }
      .qai-chat-area { display: flex; flex-direction: column; overflow: hidden; background: #0a0e1a; }
      .qai-chat { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
      .qai-msg { max-width: 88%; padding: 10px 14px; border-radius: 14px; font-size: .9rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
      .qai-msg.qai-user { align-self: flex-end; background: #6366f1; color: #fff; }
      .qai-msg.qai-ai { align-self: flex-start; background: #1a2233; border: 1px solid #263149; }
      .qai-msg.qai-system { align-self: center; background: #1e2738; color: #8b9bb4; font-size: .78rem; padding: 6px 12px; border-radius: 20px; }
      .qai-preview { padding: 0 16px; }
      .qai-preview-box { background: #0f1622; border: 1px solid #263149; border-radius: 14px; padding: 12px; text-align: center; margin-bottom: 12px; }
      .qai-preview-box img { max-width: 100%; max-height: 260px; border-radius: 8px; background: #fff; padding: 4px; }
      .qai-preview-actions { margin-top: 10px; }
      .qai-download { display: inline-block; padding: 8px 16px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 20px; font-size: .82rem; font-weight: 600; }
      .qai-preview-info { font-size: .72rem; color: #6b7a91; margin-top: 8px; }
      .qai-composer { padding: 12px 16px 16px; border-top: 1px solid #1e2738; background: #121826; flex-shrink: 0; }
      .qai-attach-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
      .qai-thumb { width: 44px; height: 44px; border-radius: 10px; background: #1a2233; border: 1px dashed #2c3a55; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
      .qai-thumb img { width: 100%; height: 100%; object-fit: cover; }
      .qai-file-btn { background: #1a2233; border: 1px solid #2c3a55; color: #c7d3e6; padding: 8px 14px; border-radius: 20px; font-size: .8rem; cursor: pointer; }
      .qai-file-btn:hover { border-color: #6366f1; }
      .qai-file-btn input { display: none; }
      .qai-file-info { font-size: .75rem; color: #8b9bb4; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .qai-input-row { display: flex; gap: 8px; align-items: flex-end; }
      #qai-input { flex: 1; background: #1a2233; border: 1px solid #2c3a55; color: #e6ecf5; border-radius: 18px; padding: 12px 14px; font-size: .92rem; font-family: inherit; resize: none; min-height: 46px; max-height: 120px; outline: none; }
      #qai-input:focus { border-color: #6366f1; }
      .qai-send { background: #6366f1; color: #fff; border: none; border-radius: 50%; width: 46px; height: 46px; font-size: 1.1rem; cursor: pointer; flex-shrink: 0; }
      .qai-send:disabled { opacity: .5; cursor: not-allowed; }
      .qai-status { font-size: .76rem; color: #8b9bb4; margin-top: 6px; min-height: 16px; }
      .qai-status.qai-busy { color: #6366f1; }
      .qai-debug { margin: 0 16px 12px; background: #0f1622; border: 1px solid #263149; border-radius: 10px; padding: 6px 12px; font-size: .75rem; display: none; }
      .qai-debug summary { cursor: pointer; color: #6b7a91; }
      .qai-debug pre { white-space: pre-wrap; word-break: break-word; background: #000; padding: 10px; border-radius: 8px; color: #8fdc8f; font-size: .7rem; max-height: 200px; overflow-y: auto; margin-top: 6px; }
      .qai-hist-item { display: flex; gap: 8px; padding: 8px; background: #121826; border-radius: 10px; margin-bottom: 6px; }
      .qai-hist-item img { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; background: #fff; }
      .qai-hist-meta { display: flex; flex-direction: column; font-size: .72rem; color: #8b9bb4; overflow: hidden; }
      .qai-hist-meta b { color: #c7d3e6; font-size: .78rem; }
      .qai-prop { display: flex; justify-content: space-between; padding: 6px 0; font-size: .8rem; border-bottom: 1px solid #1e2738; }
      .qai-prop span { color: #6b7a91; }
    `;
    const style = document.createElement('style');
    style.id = 'qai-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function injectWorkspace() {
    if (document.getElementById('qai-workspace')) return;
    const wrap = document.createElement('div');
    wrap.id = 'qai-workspace';
    wrap.className = 'qai-hidden';
    wrap.innerHTML = `
      <div class="qai-shell">
        <header class="qai-header">
          <div class="qai-brand">
            <span class="qai-logo">Q</span>
            <div>
              <div class="qai-title">Qunverio AI</div>
              <div class="qai-subtitle">Text · Image · PDF</div>
            </div>
          </div>
          <div class="qai-header-actions">
            <button class="qai-icon-btn" id="qai-new-chat" title="New chat">＋</button>
            <button class="qai-icon-btn" id="qai-toggle-debug" title="Debug">🐞</button>
            <button class="qai-icon-btn" id="qai-close" title="Close">✕</button>
          </div>
        </header>
        <main class="qai-main">
          <aside class="qai-sidebar">
            <div class="qai-section-title">History</div>
            <div id="qai-history-list"><div class="qai-empty">No activity yet</div></div>
          </aside>
          <section class="qai-chat-area">
            <div class="qai-chat" id="qai-chat"></div>
            <div class="qai-preview" id="qai-preview"></div>
            <div class="qai-composer">
              <div class="qai-attach-row">
                <div class="qai-thumb" id="qai-thumb"><span>🖼️</span></div>
                <label class="qai-file-btn">
                  📎 Upload Image / PDF
                  <input type="file" id="qai-file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf">
                </label>
                <span class="qai-file-info" id="qai-file-info"></span>
              </div>
              <div class="qai-input-row">
                <textarea id="qai-input" placeholder="Ask anything or say 'resize this to 500x500'…" rows="1"></textarea>
                <button class="qai-send" id="qai-send">➤</button>
              </div>
              <div class="qai-status" id="qai-status"></div>
            </div>
          </section>
          <aside class="qai-props">
            <div class="qai-section-title">Result Info</div>
            <div id="qai-props-body"><div class="qai-empty">No result yet</div></div>
          </aside>
        </main>
        <details class="qai-debug" id="qai-debug">
          <summary>Debug</summary>
          <pre id="qai-debug-pre">—</pre>
        </details>
      </div>
    `;
    document.body.appendChild(wrap);

    dom = {
      wrap,
      chat: document.getElementById('qai-chat'),
      input: document.getElementById('qai-input'),
      send: document.getElementById('qai-send'),
      file: document.getElementById('qai-file'),
      thumb: document.getElementById('qai-thumb'),
      fileInfo: document.getElementById('qai-file-info'),
      status: document.getElementById('qai-status'),
      historyList: document.getElementById('qai-history-list'),
      preview: document.getElementById('qai-preview'),
      propsBody: document.getElementById('qai-props-body'),
      debugPre: document.getElementById('qai-debug-pre')
    };
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.QunverioAI = {
    open: function () {
      injectStyles();
      injectWorkspace();
      dom.wrap.classList.remove('qai-hidden');
      state.isOpen = true;
      if (!dom._bound) { bindListeners(); dom._bound = true; }
      if (state.messages.length === 0) {
        addAIMessage(
`Namaste! Main Qunverio AI hoon 🤖

📷 IMAGE
• "What is in this image?" / "Summarize this image"
• "Read the text in this image"
• "Resize to 500x500" / "Compress under 200 KB"
• "Convert to webp" / "Rotate 90" / "Flip horizontal"

📄 PDF (sirf text-based PDFs)
• "Summarize this PDF"
• "What is on page 2?"
• "Key points nikaalo"

💬 TEXT
• General chat, writing, translate, coding help

⚡ MULTI-STEP
• "Resize to 800x800 and convert to webp"

Kuch bhi try karo! 😊`);
      }
    },
    close: function () {
      if (dom) dom.wrap.classList.add('qai-hidden');
      state.isOpen = false;
    }
  };

  // ============================================================
  // LISTENERS
  // ============================================================
  function bindListeners() {
    document.getElementById('qai-close').onclick = () => window.QunverioAI.close();
    document.getElementById('qai-new-chat').onclick = () => {
      state.messages = [];
      state.currentFile = null;
      dom.chat.innerHTML = '';
      dom.thumb.innerHTML = '<span>🖼️</span>';
      dom.fileInfo.textContent = '';
      dom.file.value = '';
      dom.preview.innerHTML = '';
      dom.propsBody.innerHTML = '<div class="qai-empty">No result yet</div>';
      addAIMessage('New chat started. Kya karna hai?');
    };
    document.getElementById('qai-toggle-debug').onclick = () => {
      state.debug = !state.debug;
      document.getElementById('qai-debug').style.display = state.debug ? 'block' : 'none';
    };
    dom.file.addEventListener('change', onFileSelected);
    dom.send.addEventListener('click', onSend);
    dom.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
    });
  }

  // ============================================================
  // CHAT HELPERS
  // ============================================================
  function addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'qai-msg qai-user';
    el.textContent = text;
    dom.chat.appendChild(el);
    dom.chat.scrollTop = dom.chat.scrollHeight;
    state.messages.push({ role: 'user', content: text, ts: Date.now() });
  }
  function addAIMessage(text) {
    const el = document.createElement('div');
    el.className = 'qai-msg qai-ai';
    el.textContent = text;
    dom.chat.appendChild(el);
    dom.chat.scrollTop = dom.chat.scrollHeight;
    state.messages.push({ role: 'model', content: text, ts: Date.now() });
  }
  function addSystemMessage(text) {
    const el = document.createElement('div');
    el.className = 'qai-msg qai-system';
    el.textContent = text;
    dom.chat.appendChild(el);
    dom.chat.scrollTop = dom.chat.scrollHeight;
  }
  function setStatus(text, busy) {
    dom.status.textContent = text || '';
    dom.status.className = 'qai-status' + (busy ? ' qai-busy' : '');
  }

  // ============================================================
  // FILE HANDLING
  // ============================================================
  async function onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    const isImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    const isPDF = file.type === 'application/pdf';
    if (!isImage && !isPDF) {
      addSystemMessage('❌ Only JPG, PNG, WEBP, or PDF supported.');
      dom.file.value = '';
      return;
    }
    try {
      if (isImage) {
        setStatus('Processing image…', true);
        const img = await processImageFile(file);
        state.currentFile = { kind: 'image', ...img, name: file.name, size: file.size };
        dom.thumb.innerHTML = `<img src="${img.dataUrl}" alt="preview">`;
        dom.fileInfo.textContent = `${file.name} · ${img.width}×${img.height} · ${Math.round(file.size / 1024)} KB`;
        addSystemMessage(`🖼️ ${file.name} uploaded`);
      } else {
        setStatus('Extracting PDF text…', true);
        const pdf = await processPDFFile(file);
        state.currentFile = { kind: 'pdf', ...pdf, name: file.name, size: file.size };
        dom.thumb.innerHTML = `<span>📄</span>`;
        dom.fileInfo.textContent = `${file.name} · ${pdf.pageCount} pages · ${pdf.pagesWithText || 0} with text · ${Math.round(file.size / 1024)} KB`;
        addSystemMessage(`📄 ${file.name} uploaded — ${pdf.pagesWithText || 0}/${pdf.pageCount} pages readable`);
      }
      setStatus('Ready');
    } catch (err) {
      addSystemMessage('❌ ' + err.message);
      setStatus('');
      dom.file.value = '';
      state.currentFile = null;
    }
  }

  function processImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read image'));
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Invalid image'));
        img.onload = () => {
          let { width, height } = img;
          const maxDim = CONFIG.MAX_IMAGE_DIM;
          if (width > maxDim || height > maxDim) {
            const scale = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, 0.9);
          resolve({ dataUrl, base64: dataUrl.split(',')[1], mime, width, height });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function ensurePDFJS() {
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('PDF.js failed to load'));
        document.head.appendChild(s);
      });
    }
    // ✅ ALWAYS set worker (whether already loaded or not)
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  async function processPDFFile(file) {
    await ensurePDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const maxPages = Math.min(pageCount, 50);

    let fullText = '';
    let pagesWithText = 0;
    let pagesWithoutText = 0;

    for (let i = 1; i <= maxPages; i++) {
      setStatus(`Extracting PDF page ${i}/${maxPages}…`, true);
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str || '')
          .filter(str => str.trim().length > 0)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText.length > 5) {
          pagesWithText++;
          fullText += `\n--- Page ${i} ---\n${pageText}\n`;
        } else {
          pagesWithoutText++;
          fullText += `\n--- Page ${i} (no extractable text) ---\n`;
        }
      } catch (err) {
        console.error(`Page ${i} error:`, err);
        fullText += `\n--- Page ${i} (error) ---\n`;
      }
    }

    if (pageCount > maxPages) {
      fullText += `\n[... ${pageCount - maxPages} more pages not extracted ...]`;
    }

    console.log(`PDF extraction: ${pagesWithText} with text, ${pagesWithoutText} without, total ${pageCount}`);

    if (pagesWithText === 0) {
      throw new Error(`Ye scanned/image-based PDF hai — ${pageCount} pages mein kisi bhi page pe text nahi mila. Iska text extract nahi ho sakta. Aap PDF page ka screenshot lekar image upload kar sakte ho, ya manually text copy-paste kar sakte ho.`);
    }

    return { text: fullText.trim(), pageCount, pagesWithText, pagesWithoutText, truncated: pageCount > maxPages };
  }

  // ============================================================
  // SYSTEM PROMPT
  // ============================================================
  function buildSystemPrompt() {
    const toolList = Object.entries(IMAGE_TOOL_REGISTRY).map(([k, v]) => {
      const req = v.required.length ? v.required.join(', ') : 'none';
      return `- ${k}: ${v.description}\n    required: ${req}\n    needs: ${v.requiresFile}`;
    }).join('\n');

    return `You are Qunverio AI — the intelligent assistant of Qunverio, a multi-tool website.

YOUR ABILITIES:

1. GENERAL CONVERSATION
   - Answer any question, explain concepts, write content, translate, summarize, brainstorm, solve problems
   - Reply in user's language (English / Hindi / Hinglish)

2. IMAGE ANALYSIS (when user uploaded an image)
   - Describe what is in the image
   - Summarize the image in 2-3 lines
   - Read text (OCR)
   - Identify objects, people, scenes, diagrams

3. IMAGE EDITING (real tools — execute locally)
   - Resize, compress, convert (jpg/png/webp), rotate, flip, crop

4. PDF READING (when user uploaded a PDF with extractable text)
   - Summarize content, answer questions, extract key points
   - If PDF has no text (scanned), say honestly: "Ye scanned PDF hai, iska text extract nahi ho sakta"

5. MULTI-STEP TASKS
   - Chain multiple image actions: "resize to 800x800 and convert to webp"

WHAT YOU CANNOT DO (be honest, don't fake):
- Generate QR codes (suggest: use Qunverio QR Generator tool)
- Edit PDF content / delete PDF pages
- Remove image backgrounds (suggest: Background Remover tool)
- Create passport photos (suggest: Passport Photo tool)
- Process videos, generate images from text, access the internet

Available image tools:
${toolList}

RESPONSE SHAPES (return ONLY valid JSON, no markdown, no backticks):

1. {"type":"answer","message":"<answer>"}

2. {"type":"action","actions":[{"tool":"<name>","parameters":{...}}]}

3. {"type":"clarification","message":"<question>"}

4. {"type":"unsupported","message":"<honest explanation + suggest Qunverio tool if applicable>"}

RULES:
- Use ONLY tools listed above. Never invent.
- General questions → "answer" (in user's language).
- Image processing → "action". If no image uploaded → "clarification".
- Extract params: "resize to 800x600" → {"width":800,"height":600}; "convert to webp" → {"format":"webp"}; "compress under 300 KB" → {"maxSizeKB":300}; "rotate 90" → {"degrees":90}.
- Multi-step → array of actions.
- NEVER claim you did something. The app executes and shows the real result.
- If user uploaded a PDF, use its extracted text to answer. If PDF had no text, be honest.
- Do NOT trigger image edit actions unless the user explicitly asked for an image edit (resize/compress/convert/crop/rotate/flip). If user is only asking about the image (describe/summarize/read text), use "answer" type, not "action".`;
  }

  // ============================================================
  // AI CALL
  // ============================================================
  async function callAI(userParts) {
    const contents = [];
    const recent = state.messages.slice(-6);
    for (const m of recent) {
      contents.push({ role: m.role, parts: [{ text: m.content }] });
    }
    contents.push({ role: 'user', parts: userParts });

    const res = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: buildSystemPrompt(),
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    return { text, model: data.model, tried: data.tried, raw: data };
  }

  // ============================================================
  // PARSE AI JSON
  // ============================================================
  function parseAIJSON(raw) {
    if (!raw) return null;
    let s = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a !== -1 && b > a) s = s.substring(a, b + 1);
    try { return JSON.parse(s); } catch { return null; }
  }

  // ============================================================
  // SEND HANDLER
  // ============================================================
  async function onSend() {
    if (state.isBusy) return;
    const userText = dom.input.value.trim();
    if (!userText && !state.currentFile) return;

    addUserMessage(userText || '(file only)');
    dom.input.value = '';
    state.isBusy = true;
    dom.send.disabled = true;

    try {
      const parts = [];
      if (userText) parts.push({ text: userText });
      if (state.currentFile) {
        if (state.currentFile.kind === 'image') {
          parts.push({ text: `[User uploaded image: ${state.currentFile.name}, ${state.currentFile.width}x${state.currentFile.height}]` });
          parts.push({ inline_data: { mime_type: state.currentFile.mime, data: state.currentFile.base64 } });
        } else if (state.currentFile.kind === 'pdf') {
          if (!state.currentFile.text || state.currentFile.text.trim().length < 10) {
            addAIMessage('❌ Is PDF mein koi extractable text nahi mila. Ye scanned/image-based PDF hai. Kripya PDF page ka screenshot lekar image upload karo, ya manually text copy-paste karke pucho.');
            setStatus('');
            return;
          }
          parts.push({ text: `[User uploaded PDF: ${state.currentFile.name}, ${state.currentFile.pageCount} pages, ${state.currentFile.pagesWithText || 0} with text. Extracted text below.]\n\n${state.currentFile.text}` });
        }
      }

      setStatus('Thinking…', true);
      const { text, model, tried, raw } = await callAI(parts);

      if (state.debug) {
        dom.debugPre.textContent = JSON.stringify({ model, tried, rawText: text, raw }, null, 2);
      }

      const parsed = parseAIJSON(text);
      if (!parsed) {
        addAIMessage('⚠️ Could not parse AI response. Raw: ' + text);
        setStatus('');
        return;
      }

      if (parsed.type === 'answer') {
        addAIMessage(parsed.message || '(empty)');
      } else if (parsed.type === 'clarification') {
        addAIMessage('❓ ' + parsed.message);
      } else if (parsed.type === 'unsupported') {
        addAIMessage('🚫 ' + parsed.message);
      } else if (parsed.type === 'action') {
        await executeActions(parsed.actions || []);
      } else {
        addAIMessage('⚠️ Unknown response type.');
      }
    } catch (err) {
      addAIMessage('❌ ' + err.message);
    } finally {
      state.isBusy = false;
      dom.send.disabled = false;
      setStatus('');
    }
  }

  // ============================================================
  // ACTION EXECUTION
  // ============================================================
  async function executeActions(actions) {
    if (!actions.length) return;

    // 🔒 PDF ke saath image editing actions nahi chalayenge
    if (!state.currentFile || state.currentFile.kind !== 'image') {
      addAIMessage('📎 Ye image editing ka kaam hai. Pehle image upload karo (PDF nahi).');
      return;
    }

    // 🔒 SAFETY: User ne explicitly image edit nahi maanga to mat chalao
    const lastUserMsg = [...state.messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() || '';
    const isEditRequest = /(resize|compress|convert|crop|rotate|flip|edit|chhota|bada|convert|kar do|bana do)/i.test(lastUserMsg);

    if (!isEditRequest) {
      addAIMessage('📷 Main image edit kar sakta hoon — resize, compress, convert, rotate, flip, crop. Aap exact command do, jaise "Resize to 500x500" ya "Convert to webp".');
      return;
    }

    let currentImage = state.currentFile;

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const tool = IMAGE_TOOL_REGISTRY[action.tool];
      if (!tool) { addAIMessage(`❌ Unknown tool: ${action.tool}`); return; }
      for (const req of tool.required) {
        if (action.parameters?.[req] === undefined) {
          addAIMessage(`❌ Missing parameter: ${req}`); return;
        }
      }
      addSystemMessage(`⚙️ Step ${i + 1}/${actions.length}: ${tool.name}…`);
      setStatus(`${tool.name}…`, true);
      try {
        const result = await tool.execute(action.parameters, { file: currentImage });
        currentImage = {
          kind: 'image', name: result.fileName, size: result.blob.size,
          mime: result.mime, dataUrl: result.dataUrl, base64: result.dataUrl.split(',')[1],
          width: result.width, height: result.height, blob: result.blob
        };
        state.currentFile = currentImage;
        dom.thumb.innerHTML = `<img src="${result.dataUrl}" alt="result">`;
        dom.fileInfo.textContent = `${result.fileName} · ${result.width}×${result.height} · ${Math.round(result.blob.size / 1024)} KB`;
        showPreview(result);
        addHistory(action.tool, action.parameters, result);
      } catch (err) {
        addAIMessage('❌ ' + err.message);
        return;
      }
    }
    setStatus('✓ Complete');
    addAIMessage(`✅ ${actions.length} action(s) completed.`);
  }

  // ============================================================
  // IMAGE TOOLS
  // ============================================================
  function loadImg(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('Image load failed'));
      img.src = src;
    });
  }

  async function blobFromDataUrl(dataUrl) {
    const [meta, b64] = dataUrl.split(',');
    const mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/png';
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  async function imageResize(p, ctx) {
    const w = parseInt(p.width), h = parseInt(p.height);
    if (!w || !h || w < 1 || h < 1 || w > 8000 || h > 8000) throw new Error('Invalid dimensions');
    const img = await loadImg(ctx.file.dataUrl);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
    cx.drawImage(img, 0, 0, w, h);
    const mime = ctx.file.mime === 'image/png' ? 'image/png' : 'image/jpeg';
    const dataUrl = c.toDataURL(mime, 0.92);
    return { dataUrl, mime, width: w, height: h, blob: await blobFromDataUrl(dataUrl), fileName: 'resized.' + (mime === 'image/png' ? 'png' : 'jpg') };
  }

  async function imageCompress(p, ctx) {
    const targetKB = parseInt(p.maxSizeKB);
    if (!targetKB || targetKB < 1) throw new Error('Invalid target size');
    const img = await loadImg(ctx.file.dataUrl);
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const cx = c.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
    cx.drawImage(img, 0, 0);
    let q = 0.92, dataUrl, blob, kb;
    for (let i = 0; i < 10; i++) {
      dataUrl = c.toDataURL('image/jpeg', q);
      blob = await blobFromDataUrl(dataUrl);
      kb = Math.round(blob.size / 1024);
      if (kb <= targetKB) break;
      q -= 0.1;
      if (q < 0.15) break;
    }
    return { dataUrl, mime: 'image/jpeg', width: img.width, height: img.height, blob, fileName: 'compressed.jpg' };
  }

  async function imageConvert(p, ctx) {
    const fmt = String(p.format || '').toLowerCase().replace('jpeg', 'jpg');
    if (!['jpg', 'png', 'webp'].includes(fmt)) throw new Error('Format must be jpg/png/webp');
    const img = await loadImg(ctx.file.dataUrl);
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const cx = c.getContext('2d');
    if (fmt === 'jpg') { cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height); }
    cx.drawImage(img, 0, 0);
    const mime = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[fmt];
    const dataUrl = c.toDataURL(mime, 0.92);
    return { dataUrl, mime, width: img.width, height: img.height, blob: await blobFromDataUrl(dataUrl), fileName: 'converted.' + fmt };
  }

  async function imageCrop(p, ctx) {
    const w = parseInt(p.width), h = parseInt(p.height);
    if (!w || !h) throw new Error('Invalid crop dimensions');
    const img = await loadImg(ctx.file.dataUrl);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d');
    const sx = Math.max(0, (img.width - w) / 2);
    const sy = Math.max(0, (img.height - h) / 2);
    const sw = Math.min(w, img.width);
    const sh = Math.min(h, img.height);
    cx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const mime = ctx.file.mime === 'image/png' ? 'image/png' : 'image/jpeg';
    const dataUrl = c.toDataURL(mime, 0.92);
    return { dataUrl, mime, width: w, height: h, blob: await blobFromDataUrl(dataUrl), fileName: 'cropped.' + (mime === 'image/png' ? 'png' : 'jpg') };
  }

  async function imageRotate(p, ctx) {
    const deg = parseInt(p.degrees);
    if (![90, 180, 270].includes(deg)) throw new Error('Degrees must be 90/180/270');
    const img = await loadImg(ctx.file.dataUrl);
    const rad = (deg * Math.PI) / 180;
    const swap = deg === 90 || deg === 270;
    const c = document.createElement('canvas');
    c.width = swap ? img.height : img.width;
    c.height = swap ? img.width : img.height;
    const cx = c.getContext('2d');
    cx.translate(c.width / 2, c.height / 2);
    cx.rotate(rad);
    cx.drawImage(img, -img.width / 2, -img.height / 2);
    const mime = ctx.file.mime === 'image/png' ? 'image/png' : 'image/jpeg';
    const dataUrl = c.toDataURL(mime, 0.92);
    return { dataUrl, mime, width: c.width, height: c.height, blob: await blobFromDataUrl(dataUrl), fileName: 'rotated.' + (mime === 'image/png' ? 'png' : 'jpg') };
  }

  async function imageFlip(p, ctx) {
    const dir = String(p.direction || '').toLowerCase();
    if (!['horizontal', 'vertical'].includes(dir)) throw new Error('Direction must be horizontal/vertical');
    const img = await loadImg(ctx.file.dataUrl);
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const cx = c.getContext('2d');
    if (dir === 'horizontal') {
      cx.translate(c.width, 0); cx.scale(-1, 1);
    } else {
      cx.translate(0, c.height); cx.scale(1, -1);
    }
    cx.drawImage(img, 0, 0);
    const mime = ctx.file.mime === 'image/png' ? 'image/png' : 'image/jpeg';
    const dataUrl = c.toDataURL(mime, 0.92);
    return { dataUrl, mime, width: img.width, height: img.height, blob: await blobFromDataUrl(dataUrl), fileName: 'flipped.' + (mime === 'image/png' ? 'png' : 'jpg') };
  }

  // ============================================================
  // PREVIEW
  // ============================================================
  function showPreview(result) {
    const url = URL.createObjectURL(result.blob);
    dom.preview.innerHTML = `
      <div class="qai-preview-box">
        <img src="${result.dataUrl}" alt="result">
        <div class="qai-preview-actions">
          <a class="qai-download" href="${url}" download="${result.fileName}">⬇ Download ${result.fileName}</a>
        </div>
        <div class="qai-preview-info">${result.width}×${result.height} · ${Math.round(result.blob.size / 1024)} KB · ${result.mime}</div>
      </div>
    `;
    dom.propsBody.innerHTML = `
      <div class="qai-prop"><span>File</span><b>${result.fileName}</b></div>
      <div class="qai-prop"><span>Dimensions</span><b>${result.width}×${result.height}</b></div>
      <div class="qai-prop"><span>Size</span><b>${Math.round(result.blob.size / 1024)} KB</b></div>
      <div class="qai-prop"><span>Format</span><b>${result.mime}</b></div>
    `;
  }

  // ============================================================
  // HISTORY
  // ============================================================
  function addHistory(tool, params, result) {
    const item = {
      tool, params,
      fileName: result.fileName,
      size: result.blob.size,
      ts: Date.now(),
      thumbDataUrl: result.dataUrl
    };
    state.history.unshift(item);
    if (state.history.length > CONFIG.HISTORY_LIMIT) state.history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (!dom.historyList) return;
    if (!state.history.length) {
      dom.historyList.innerHTML = '<div class="qai-empty">No activity yet</div>';
      return;
    }
    dom.historyList.innerHTML = state.history.map(h => `
      <div class="qai-hist-item">
        <img src="${h.thumbDataUrl}" alt="">
        <div class="qai-hist-meta">
          <b>${h.tool}</b>
          <span>${Math.round(h.size / 1024)} KB · ${new Date(h.ts).toLocaleTimeString()}</span>
        </div>
      </div>
    `).join('');
  }

})();