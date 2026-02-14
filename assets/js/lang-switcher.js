document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  const langIcon = document.getElementById("lang-icon");
  const langText = document.getElementById("lang-text");
  const htmlElement = document.documentElement;

  // デフォルト言語の設定 (localStorage > ブラウザ言語 > 'en')
  const getPreferredLang = () => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) return savedLang;
    
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  let currentLang = getPreferredLang();

  // 翻訳データのキャッシュ
  const translations = {};

  // JSONをロードする関数
  const loadTranslations = async (lang) => {
    if (translations[lang]) return translations[lang];
    try {
      // BASE_PATHは _includes/scripts.html で定義します
      const response = await fetch(`${window.BASE_PATH || ''}/assets/translations/${lang}.json`);
      const data = await response.json();
      translations[lang] = data;
      return data;
    } catch (e) {
      console.error("Translation file not found:", e);
      return null;
    }
  };

  // ページ内のテキストを更新する関数
  const updateContent = (data) => {
    if (!data) return;

    // data-i18n 属性を持つ要素をすべて更新
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
      const key = el.getAttribute("data-i18n");
      // ドット記法 (nav.home) を解決して値を取得
      const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : null, data);
      
      if (value) {
        // コンテンツタイプに応じて更新
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = value;
        } else {
          el.textContent = value;
        }
      }
    });

    // <html>タグの属性更新 (SEO/アクセシビリティ)
    htmlElement.setAttribute("lang", currentLang);
    
    // UI更新
    updateToggleButton();
  };

  // ボタンの見た目を更新
  const updateToggleButton = () => {
    if (currentLang === "en") {
      langText.textContent = "EN";
      langToggle.setAttribute("aria-label", "Switch to Japanese");
    } else {
      langText.textContent = "JA";
      langToggle.setAttribute("aria-label", "英語に切り替え");
    }
  };

  // 言語切替処理
  const switchLanguage = async (newLang) => {
    const data = await loadTranslations(newLang);
    if (data) {
      currentLang = newLang;
      localStorage.setItem("lang", currentLang);
      updateContent(data);
    }
  };

  // 初期化実行
  (async () => {
    // 現在の言語データをロードして適用
    await switchLanguage(currentLang);
  })();

  // クリックイベント
  langToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const newLang = currentLang === "en" ? "ja" : "en";
    switchLanguage(newLang);
  });
});
