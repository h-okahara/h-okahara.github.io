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

  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`${window.BASE_PATH || ''}/assets/translations/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Translation load failed:", e);
      // コンソールにエラーが出ている場合、ここが原因です
      return null;
    }
  };

  const updateContent = (data) => {
    if (!data) return;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : null, data);
      
      if (value) {
        // data-i18n-target 属性がある場合は、その属性（title等）を書き換える
        const targetAttr = el.getAttribute("data-i18n-target");
        if (targetAttr) {
          el.setAttribute(targetAttr, value);
        } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = value;
        } else {
          el.textContent = value;
        }
      }
    });

    htmlElement.setAttribute("lang", currentLang);
    updateToggleButton();
  };

  const updateToggleButton = () => {
    if (currentLang === "en") {
      langText.textContent = "EN";
      langToggle.setAttribute("aria-label", "Switch to Japanese");
    } else {
      langText.textContent = "JA";
      langToggle.setAttribute("aria-label", "英語に切り替え");
    }
  };

  const switchLanguage = async (newLang) => {
    const data = await loadTranslations(newLang);
    if (data) {
      currentLang = newLang;
      localStorage.setItem("lang", currentLang);
      updateContent(data);
    } else {
      alert("翻訳データの読み込みに失敗しました。\nassets/translations/" + newLang + ".json の記述を確認してください。");
    }
  };

  // 初期化
  (async () => {
    await switchLanguage(currentLang);
  })();

  langToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const newLang = currentLang === "en" ? "ja" : "en";
    switchLanguage(newLang);
  });
});
