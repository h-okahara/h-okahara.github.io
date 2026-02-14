document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  const langText = document.getElementById("lang-text");
  const htmlElement = document.documentElement;

  // デフォルト言語の設定
  const getPreferredLang = () => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) return savedLang;
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  let currentLang = getPreferredLang();

  // 翻訳データを取得する関数 (日本語のみ取得)
  const loadTranslations = async (lang) => {
    if (lang === 'en') return null; // 英語なら読み込まない
    try {
      const response = await fetch(`${window.BASE_PATH || ''}/assets/translations/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Translation load failed:", e);
      return null;
    }
  };

  // テキスト更新関数
  const updateContent = (lang, data) => {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach(el => {
      // 1. ターゲットとなるプロパティを特定 (textContent, title, placeholderなど)
      const targetAttr = el.getAttribute("data-i18n-target");
      const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
      
      // 現在の値を取得（これが元の英語テキスト）
      let currentValue;
      if (targetAttr) {
        currentValue = el.getAttribute(targetAttr);
      } else if (isInput) {
        currentValue = el.placeholder;
      } else {
        currentValue = el.textContent;
      }

      // 2. 初回実行時、元の英語テキストを 'data-original-value' にバックアップする
      if (!el.hasAttribute('data-original-value') && currentValue) {
        el.setAttribute('data-original-value', currentValue);
      }

      // 3. 言語に応じて書き換え
      if (lang === 'en') {
        // 英語の場合: バックアップから復元する
        const original = el.getAttribute('data-original-value');
        if (original) {
          if (targetAttr) el.setAttribute(targetAttr, original);
          else if (isInput) el.placeholder = original;
          else el.textContent = original;
        }
      } else if (data) {
        // 日本語の場合: JSONデータから翻訳する
        const key = el.getAttribute("data-i18n");
        // キーをたどって値を取得 (例: career.phd)
        const translatedValue = key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : null, data);

        if (translatedValue) {
          if (targetAttr) el.setAttribute(targetAttr, translatedValue);
          else if (isInput) el.placeholder = translatedValue;
          else el.textContent = translatedValue;
        }
      }
    });

    // <html>タグの言語設定とボタン表示更新
    htmlElement.setAttribute("lang", lang);
    updateToggleButton(lang);
  };

  const updateToggleButton = (lang) => {
    if (lang === "en") {
      langText.textContent = "EN";
      langToggle.setAttribute("aria-label", "Switch to Japanese");
    } else {
      langText.textContent = "JA";
      langToggle.setAttribute("aria-label", "英語に切り替え");
    }
  };

  const switchLanguage = async (newLang) => {
    let data = null;
    
    // 日本語への切り替え時のみJSONをロード
    if (newLang !== 'en') {
      data = await loadTranslations(newLang);
      if (!data) {
        alert("翻訳データの読み込みに失敗しました。");
        return;
      }
    }

    currentLang = newLang;
    localStorage.setItem("lang", currentLang);
    updateContent(currentLang, data);
  };

  // 初期化実行
  (async () => {
    // ページロード時、もし英語設定なら何もしない（HTMLのままでOK）
    // もし日本語設定なら、JSONを読み込んで適用する
    if (currentLang !== 'en') {
      await switchLanguage(currentLang);
    } else {
      // 英語の場合でも、将来の切り替えのためにバックアップ処理だけ走らせておく
      updateContent('en', null);
    }
  })();

  // ボタンクリックイベント
  langToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const newLang = currentLang === "en" ? "ja" : "en";
    switchLanguage(newLang);
  });
});
