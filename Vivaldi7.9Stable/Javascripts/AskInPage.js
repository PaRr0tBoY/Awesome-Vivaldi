// ==UserScript==
// @name         Ask in Page Panel
// @description  Registers a WebPanel and renders the ask-in-page UI directly inside the host panel DOM.
// @version      2026.4.18
// @author       PaRr0tBoY
// ==/UserScript==

(() => {
  'use strict';

  // ==================== AI Configuration ====================
  // 1. Fill in apiKey.
  // 2. Set apiEndpoint to the full chat completions URL.
  // 3. Adjust model / timeout / maxTokens if needed.
  // 4. If apiKey is empty, chat requests will stop with a config warning.
  //
  // Common examples:
  // GLM: https://open.bigmodel.cn/api/paas/v4/chat/completions
  // Groq: https://api.groq.com/openai/v1/chat/completions
  // OpenRouter: https://openrouter.ai/api/v1/chat/completions
  // DeepSeek: https://api.deepseek.com/chat/completions
  const AI_CONFIG = {
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: '',
    model: 'groq/compound',
    timeout: 90000,
    temperature: 0.5,
    maxTokens: 4096,
  };

  const name = 'Ask in Page';
  const nameAttribute = 'ask-in-page';
  const webPanelId = 'WEBPANEL_ask-in-page-a1b2c3d4e5f6';
  const uiVersion = 'v74';
  const code = 'data:text/html,' + encodeURIComponent('<title>' + name + '</title>');
  const ASK_IN_PAGE_CONTEXT_MENU = {
    selectionId: 'ask-in-page-selection',
    pageId: 'ask-in-page-page',
    selectionTitle: 'Ask About Selection',
    pageTitle: 'Ask About Page',
  };
  const ASK_IN_PAGE_RUNTIME_MESSAGE = {
    openPanel: 'ask-in-page-open-panel',
  };
  const ASK_IN_PAGE_SELECTION_BUTTON_LABEL = 'Ask';
  const panelIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M13.5 2.5 7.5 12h4l-1 9.5 6-9.5h-4l1-9.5Z" stroke="#8B949E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const panelIcon = 'data:image/svg+xml,' + encodeURIComponent(panelIconSvg);
  const panelIconMask = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path d="M13.5 2.5 7.5 12h4l-1 9.5 6-9.5h-4l1-9.5Z" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'
  );
  const commandDefinitions = [
    {
      id: 'analyze',
      name: 'Analyze',
      trigger: 'analyze',
      aliases: ['ana', 'an', 'research'],
      prompt: "Analyze this content, looking for bias, patterns, trends, connections. Consider the author, the source. Research to fact check, if it seems beneficial. Research the broader setting. If no content has been provided, ask about the relevant subject matter.",
      iconText: '◔',
      subtitle: 'Bias, patterns, trends, connections',
    },
    {
      id: 'summarize',
      name: 'Summarize',
      trigger: 'summarize',
      aliases: ['sum', 'summary', 'tl;dr'],
      prompt: "Please provide a clear, concise summary of the attached content. Begin with a simple answer distilling the main point. Then cover 3-4 main ideas. Be concise. One sentence for each, max two. If there is no attached content, ask the user what might be helpful to summarize.",
      iconText: '≡',
      subtitle: 'Clear, concise summary',
    },
    {
      id: 'explain',
      name: 'Explain',
      trigger: 'explain',
      aliases: ['exp', 'ex'],
      prompt: "Please explain the concept, topic, or content in clear, accessible language. Break down complex ideas into understandable parts, provide relevant examples, and structure your explanation logically from basic to more advanced concepts. Be relatively concise. If nothing has been provided, ask what they'd like you to explain.",
      iconText: '◔',
      subtitle: 'Clear explanation with examples',
    },
    {
      id: 'rewrite',
      name: 'Rewrite',
      trigger: 'rewrite',
      aliases: ['reword', 'polish', 'revise'],
      prompt: "Rewrite the content to improve clarity, flow, and natural phrasing while preserving the original meaning. Keep the tone aligned with the source unless I ask for a different tone.",
      iconText: '↺',
      subtitle: 'Rewrite for clarity and flow',
    },
    {
      id: 'shorter',
      name: 'Shorter',
      trigger: 'shorter',
      aliases: ['short', 'trim', 'compress'],
      prompt: "Make the content shorter and tighter without losing the key meaning. Prefer concise sentences and remove repetition.",
      iconText: '⇣',
      subtitle: 'Compress without losing meaning',
    },
    {
      id: 'translate',
      name: 'Translate',
      trigger: 'translate',
      aliases: ['translation', 'tl'],
      prompt: "Translate the content into the user's preferred language unless they specify a target language. Preserve meaning, tone, names, and formatting.",
      iconText: '文',
      subtitle: 'Translate while preserving meaning',
    },
    {
      id: 'make-table',
      name: 'Make table',
      trigger: 'maketable',
      aliases: ['table', 'tabulate', 'grid'],
      prompt: "Convert the response into a concise markdown table when the content fits naturally. Keep columns useful, short, and easy to scan.",
      iconText: '▦',
      subtitle: 'Restructure as a compact table',
    },
    {
      id: 'extract-action-items',
      name: 'Extract action items',
      trigger: 'extractactionitems',
      aliases: ['actions', 'todo', 'nextsteps'],
      prompt: "Extract the concrete action items, next steps, owners if inferable, and dependencies. Present them as a concise actionable list.",
      iconText: '✓',
      subtitle: 'Pull out concrete next steps',
    },
  ];
  const formatCapabilityDefinitions = [
    {
      id: 'textProposal',
      title: 'Text block',
      subtitle: 'Format the response as a text proposal',
      iconText: 'T',
      content: 'The user is requesting that you format your response using a text proposal.',
      aliases: ['text', 'proposal', 'textproposal', 'block'],
    },
    {
      id: 'table',
      title: 'Table',
      subtitle: 'Format the response as a table',
      iconText: '▦',
      content: 'The user is requesting that you format your response as a table.',
      aliases: ['table', 'grid'],
    },
    {
      id: 'codeBlock',
      title: 'Code block',
      subtitle: 'Format the response as a code block',
      iconText: '</>',
      content: 'The user is requesting that you format your response using a code block.',
      aliases: ['code', 'codeblock', 'block', 'md'],
    },
    {
      id: 'list',
      title: 'List',
      subtitle: 'Format the response as a list',
      iconText: '≡',
      content: 'The user is requesting that you format your response as a list.',
      aliases: ['list', 'bullet'],
    },
  ];
  const CONTEXT_LIMITS = {
    pageContentChars: 18000,
    filePreviewChars: 18000,
  };
  const ASK_IN_PAGE_DEBUG = false;
  const ASK_IN_PAGE_CONSOLE_DEBUG = true;
  const PERFORMANCE_CONFIG = {
    selectionPollIntervalMs: 4000,
    tabSnapshotCacheTtlMs: 15000,
  };
  const TAB_SUGGESTION_LIMITS = {
    collapsed: 5,
    expanded: 15,
  };
  const CONVERSATION_MEMORY_CONFIG = {
    recentTurns: 6,
    summaryChunkTurns: 3,
    maxRetrievedAttachments: 2,
  };
  const LIGHTWEIGHT_SNAPSHOT_CONFIG = {
    maxContentChars: 1600,
    maxHeadingCount: 8,
    maxImageAltCount: 6,
    maxImportantLinkCount: 6,
    maxJsonLdCount: 4,
    candidateNodeLimit: 80,
  };
  const STREAM_UI_CONFIG = {
    startDelayMs: 180,
    charsPerSecond: 90,
    punctuationPause: 0,
    newlinePause: 0,
    ghostTailChars: 14,
    minCharsPerFrame: 1,
    stableTailCommitChars: 180,
  };
  const LANGUAGE_MAP = {
    zh: 'Chinese',
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    en: 'English',
    'en-US': 'English',
    'en-GB': 'English',
    ja: 'Japanese',
    'ja-JP': 'Japanese',
    ko: 'Korean',
    'ko-KR': 'Korean',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ru: 'Russian',
    pt: 'Portuguese',
    it: 'Italian',
    ar: 'Arabic',
    hi: 'Hindi',
  };
  const UI_STRINGS = {
    en: {
      newChat: 'New chat',
      commandShortcuts: 'Quick commands',
      emptyHint: 'Use @ to add tabs or files',
      emptySubhint: 'Use / to run commands like Analyze, Summarize, and Explain',
      editing: 'Editing',
      editedOverwrite: 'Responses after edited messages will be overwritten',
      cancelEdit: 'Cancel edit',
      currentPage: 'Current page',
      close: 'Close',
      selectedText: 'Selected text',
      inputPlaceholder: 'Ask about this page...',
      inputMessage: 'Type a message',
      attachments: 'Attachments',
      addAttachments: 'Add attachments',
      send: 'Send',
      sendMessage: 'Send message',
      stopOutput: 'Stop generating',
      stopOutputMessage: 'Stop generating',
      commandsSection: 'Commands',
      tabsSection: 'Tabs',
      filesSection: 'Files',
      formatsSection: 'Formats',
      showMoreTabs: 'Show more',
      showMoreTabsSubtitle: 'Show {count} more tabs',
      allOpenTabsTitle: 'All open tabs ({count})',
      allOpenTabsSubtitle: 'Add all open tabs in this window',
      domainTabsTitle: 'All open {host} tabs ({count})',
      domainTabsSubtitle: 'Add all tabs from this domain',
      chooseFileTitle: 'Choose a File...',
      chooseFileSubtitle: 'Choose a file from your system',
      untitledTab: 'Untitled tab',
      untitledFile: 'Untitled file',
      preparingSuggestions: 'Preparing suggestions...',
      preparingCommands: 'Preparing commands...',
      loadingTabsFilesTitle: 'Loading tabs and downloaded files...',
      loadingTabsFilesSubtitle: 'If you can see this row, the dropdown UI is rendering correctly',
      noMatchingSuggestions: 'No matching suggestions.',
      noTabsOrFiles: 'No tabs or files available.',
      tabsFilesReadFailed: 'Failed to read tabs / files. Please try again.',
      noMatchingCommands: 'No matching commands.',
      sendValidationEmpty: 'Add something to process, or type a message.',
      sendValidationNeedsInfo: 'Add the information to process, or type a message.',
      sendValidationNeedsInstruction: 'Add a command, format, or instruction for what to do.',
      apiKeyMissing: 'AI API key is not configured. Fill in apiKey in AI_CONFIG inside AskInPage.js.',
      noDisplayBody: 'The model finished, but returned no displayable answer.',
      aiRequestFailed: 'AI request failed: {message}',
      unknownError: 'Unknown error',
      copyMessage: 'Copy message',
      editMessage: 'Edit message',
      copyReply: 'Copy reply',
      retryReply: 'Retry reply',
    },
    'zh-CN': {
      newChat: '新建对话',
      commandShortcuts: '快捷命令',
      emptyHint: '使用 @ 添加标签页或文件',
      emptySubhint: '使用 / 运行 Analyze、Summarize、Explain 等命令',
      editing: '正在编辑',
      editedOverwrite: '编辑后的消息后续回复会被覆盖',
      cancelEdit: '取消编辑',
      currentPage: '当前页面',
      close: '关闭',
      selectedText: '已选文字',
      inputPlaceholder: '向此页面提问...',
      inputMessage: '输入消息',
      attachments: '附件',
      addAttachments: '添加附件',
      send: '发送',
      sendMessage: '发送消息',
      stopOutput: '终止输出',
      stopOutputMessage: '终止输出',
      commandsSection: '命令',
      tabsSection: '标签页',
      filesSection: '文件',
      formatsSection: '格式',
      showMoreTabs: '显示更多',
      showMoreTabsSubtitle: '再展开 {count} 个标签页',
      allOpenTabsTitle: '全部打开的标签页 ({count})',
      allOpenTabsSubtitle: '一次性加入当前窗口中的全部标签页',
      domainTabsTitle: '全部打开的 {host} 标签页 ({count})',
      domainTabsSubtitle: '加入该域名下的全部标签页',
      chooseFileTitle: '选择文件...',
      chooseFileSubtitle: '从系统选择文件',
      sendValidationEmpty: '请先添加要处理的信息，或直接输入一条消息。',
      sendValidationNeedsInfo: '请先添加要处理的信息，或直接输入一条消息。',
      sendValidationNeedsInstruction: '请添加命令、格式或说明要如何处理这些信息。',
    },
    'zh-TW': {
      newChat: '新增對話',
      commandShortcuts: '快捷指令',
      emptyHint: '使用 @ 加入分頁或檔案',
      emptySubhint: '使用 / 執行 Analyze、Summarize、Explain 等指令',
      editing: '正在編輯',
      editedOverwrite: '編輯後的訊息後續回覆將被覆寫',
      cancelEdit: '取消編輯',
      currentPage: '目前頁面',
      close: '關閉',
      selectedText: '已選文字',
      inputPlaceholder: '針對此頁面提問...',
      inputMessage: '輸入訊息',
      attachments: '附件',
      addAttachments: '加入附件',
      send: '傳送',
      sendMessage: '傳送訊息',
      stopOutput: '停止輸出',
      stopOutputMessage: '停止輸出',
      commandsSection: '命令',
      tabsSection: '分頁',
      filesSection: '檔案',
      formatsSection: '格式',
      showMoreTabs: '顯示更多',
      showMoreTabsSubtitle: '再展開 {count} 個分頁',
      allOpenTabsTitle: '全部已開啟的分頁 ({count})',
      allOpenTabsSubtitle: '一次加入目前視窗中的全部分頁',
      domainTabsTitle: '全部已開啟的 {host} 分頁 ({count})',
      domainTabsSubtitle: '加入這個網域下的全部分頁',
      chooseFileTitle: '選擇檔案...',
      chooseFileSubtitle: '從系統選擇檔案',
      sendValidationEmpty: '請先加入要處理的資訊，或直接輸入一則訊息。',
      sendValidationNeedsInfo: '請先加入要處理的資訊，或直接輸入一則訊息。',
      sendValidationNeedsInstruction: '請加入命令、格式，或說明要如何處理這些資訊。',
    },
    ja: {
      newChat: '新しいチャット',
      commandShortcuts: 'クイックコマンド',
      emptyHint: 'タブやファイルを追加するには @ を使います',
      emptySubhint: 'Analyze、Summarize、Explain などのコマンドには / を使います',
      editing: '編集中',
      editedOverwrite: '編集後のメッセージ以降の応答は上書きされます',
      cancelEdit: '編集をキャンセル',
      currentPage: '現在のページ',
      close: '閉じる',
      selectedText: '選択したテキスト',
      inputPlaceholder: 'このページについて質問...',
      inputMessage: 'メッセージを入力',
      attachments: '添付',
      addAttachments: '添付を追加',
      send: '送信',
      sendMessage: 'メッセージを送信',
      stopOutput: '生成を停止',
      stopOutputMessage: '生成を停止',
      commandsSection: 'コマンド',
      tabsSection: 'タブ',
      filesSection: 'ファイル',
      formatsSection: '形式',
      showMoreTabs: 'さらに表示',
      showMoreTabsSubtitle: 'さらに {count} 個のタブを表示',
      allOpenTabsTitle: '開いているすべてのタブ ({count})',
      allOpenTabsSubtitle: 'このウィンドウの全タブをまとめて追加',
      domainTabsTitle: '{host} の開いているタブをすべて追加 ({count})',
      domainTabsSubtitle: 'このドメインのタブをまとめて追加',
      chooseFileTitle: 'ファイルを選択...',
      chooseFileSubtitle: 'システムからファイルを選択',
    },
    ko: {
      newChat: '새 채팅',
      commandShortcuts: '빠른 명령',
      emptyHint: '@로 탭이나 파일을 추가하세요',
      emptySubhint: '/로 Analyze, Summarize, Explain 같은 명령을 실행하세요',
      editing: '편집 중',
      editedOverwrite: '편집한 메시지 이후의 응답은 덮어써집니다',
      cancelEdit: '편집 취소',
      currentPage: '현재 페이지',
      close: '닫기',
      selectedText: '선택한 텍스트',
      inputPlaceholder: '이 페이지에 관해 질문하세요...',
      inputMessage: '메시지 입력',
      attachments: '첨부',
      addAttachments: '첨부 추가',
      send: '보내기',
      sendMessage: '메시지 보내기',
      stopOutput: '생성 중지',
      stopOutputMessage: '생성 중지',
      commandsSection: '명령',
      tabsSection: '탭',
      filesSection: '파일',
      formatsSection: '형식',
      showMoreTabs: '더 보기',
      showMoreTabsSubtitle: '탭 {count}개 더 펼치기',
      allOpenTabsTitle: '열린 모든 탭 ({count})',
      allOpenTabsSubtitle: '이 창의 모든 탭을 한 번에 추가',
      domainTabsTitle: '열린 {host} 탭 전체 ({count})',
      domainTabsSubtitle: '이 도메인의 탭을 한 번에 추가',
      chooseFileTitle: '파일 선택...',
      chooseFileSubtitle: '시스템에서 파일 선택',
    },
    es: {
      newChat: 'Nuevo chat',
      commandShortcuts: 'Comandos rápidos',
      emptyHint: 'Usa @ para añadir pestañas o archivos',
      emptySubhint: 'Usa / para ejecutar comandos como Analyze, Summarize y Explain',
      editing: 'Editando',
      editedOverwrite: 'Las respuestas después del mensaje editado se sobrescribirán',
      cancelEdit: 'Cancelar edición',
      currentPage: 'Página actual',
      close: 'Cerrar',
      selectedText: 'Texto seleccionado',
      inputPlaceholder: 'Pregunta sobre esta página...',
      inputMessage: 'Escribe un mensaje',
      attachments: 'Adjuntos',
      addAttachments: 'Añadir adjuntos',
      send: 'Enviar',
      sendMessage: 'Enviar mensaje',
      stopOutput: 'Detener generación',
      stopOutputMessage: 'Detener generación',
      commandsSection: 'Comandos',
      tabsSection: 'Pestañas',
      filesSection: 'Archivos',
      formatsSection: 'Formatos',
      showMoreTabs: 'Mostrar más',
      showMoreTabsSubtitle: 'Mostrar {count} pestañas más',
      allOpenTabsTitle: 'Todas las pestañas abiertas ({count})',
      allOpenTabsSubtitle: 'Añadir todas las pestañas abiertas de esta ventana',
      domainTabsTitle: 'Todas las pestañas abiertas de {host} ({count})',
      domainTabsSubtitle: 'Añadir todas las pestañas de este dominio',
      chooseFileTitle: 'Elegir archivo...',
      chooseFileSubtitle: 'Elegir un archivo del sistema',
    },
    fr: {
      newChat: 'Nouvelle discussion',
      commandShortcuts: 'Commandes rapides',
      emptyHint: 'Utilisez @ pour ajouter des onglets ou des fichiers',
      emptySubhint: 'Utilisez / pour lancer des commandes comme Analyze, Summarize et Explain',
      editing: 'Modification',
      editedOverwrite: 'Les réponses après le message modifié seront écrasées',
      cancelEdit: 'Annuler la modification',
      currentPage: 'Page actuelle',
      close: 'Fermer',
      selectedText: 'Texte sélectionné',
      inputPlaceholder: 'Poser une question sur cette page...',
      inputMessage: 'Saisir un message',
      attachments: 'Pièces jointes',
      addAttachments: 'Ajouter des pièces jointes',
      send: 'Envoyer',
      sendMessage: 'Envoyer le message',
      stopOutput: 'Arrêter la génération',
      stopOutputMessage: 'Arrêter la génération',
      commandsSection: 'Commandes',
      tabsSection: 'Onglets',
      filesSection: 'Fichiers',
      formatsSection: 'Formats',
      showMoreTabs: 'Afficher plus',
      showMoreTabsSubtitle: 'Afficher {count} onglets de plus',
      allOpenTabsTitle: 'Tous les onglets ouverts ({count})',
      allOpenTabsSubtitle: 'Ajouter tous les onglets ouverts de cette fenêtre',
      domainTabsTitle: 'Tous les onglets ouverts de {host} ({count})',
      domainTabsSubtitle: 'Ajouter tous les onglets de ce domaine',
      chooseFileTitle: 'Choisir un fichier...',
      chooseFileSubtitle: 'Choisir un fichier depuis le système',
    },
    de: {
      newChat: 'Neuer Chat',
      commandShortcuts: 'Schnellbefehle',
      emptyHint: 'Verwende @, um Tabs oder Dateien hinzuzufügen',
      emptySubhint: 'Verwende / für Befehle wie Analyze, Summarize und Explain',
      editing: 'Bearbeiten',
      editedOverwrite: 'Antworten nach der bearbeiteten Nachricht werden überschrieben',
      cancelEdit: 'Bearbeiten abbrechen',
      currentPage: 'Aktuelle Seite',
      close: 'Schließen',
      selectedText: 'Ausgewählter Text',
      inputPlaceholder: 'Frage zu dieser Seite...',
      inputMessage: 'Nachricht eingeben',
      attachments: 'Anhänge',
      addAttachments: 'Anhänge hinzufügen',
      send: 'Senden',
      sendMessage: 'Nachricht senden',
      stopOutput: 'Generierung stoppen',
      stopOutputMessage: 'Generierung stoppen',
      commandsSection: 'Befehle',
      tabsSection: 'Tabs',
      filesSection: 'Dateien',
      formatsSection: 'Formate',
      showMoreTabs: 'Mehr anzeigen',
      showMoreTabsSubtitle: '{count} weitere Tabs anzeigen',
      allOpenTabsTitle: 'Alle offenen Tabs ({count})',
      allOpenTabsSubtitle: 'Alle offenen Tabs dieses Fensters hinzufügen',
      domainTabsTitle: 'Alle offenen {host}-Tabs ({count})',
      domainTabsSubtitle: 'Alle Tabs dieser Domain hinzufügen',
      chooseFileTitle: 'Datei auswählen...',
      chooseFileSubtitle: 'Eine Datei aus dem System auswählen',
    },
    pt: {
      newChat: 'Novo chat',
      commandShortcuts: 'Comandos rápidos',
      emptyHint: 'Use @ para adicionar abas ou arquivos',
      emptySubhint: 'Use / para executar comandos como Analyze, Summarize e Explain',
      editing: 'Editando',
      editedOverwrite: 'As respostas após a mensagem editada serão sobrescritas',
      cancelEdit: 'Cancelar edição',
      currentPage: 'Página atual',
      close: 'Fechar',
      selectedText: 'Texto selecionado',
      inputPlaceholder: 'Pergunte sobre esta página...',
      inputMessage: 'Digite uma mensagem',
      attachments: 'Anexos',
      addAttachments: 'Adicionar anexos',
      send: 'Enviar',
      sendMessage: 'Enviar mensagem',
      stopOutput: 'Parar geração',
      stopOutputMessage: 'Parar geração',
      commandsSection: 'Comandos',
      tabsSection: 'Abas',
      filesSection: 'Arquivos',
      formatsSection: 'Formatos',
      showMoreTabs: 'Mostrar mais',
      showMoreTabsSubtitle: 'Mostrar mais {count} abas',
      allOpenTabsTitle: 'Todas as abas abertas ({count})',
      allOpenTabsSubtitle: 'Adicionar todas as abas abertas desta janela',
      domainTabsTitle: 'Todas as abas abertas de {host} ({count})',
      domainTabsSubtitle: 'Adicionar todas as abas deste domínio',
      chooseFileTitle: 'Escolher arquivo...',
      chooseFileSubtitle: 'Escolher um arquivo do sistema',
    },
    ru: {
      newChat: 'Новый чат',
      commandShortcuts: 'Быстрые команды',
      emptyHint: 'Используйте @, чтобы добавить вкладки или файлы',
      emptySubhint: 'Используйте / для команд вроде Analyze, Summarize и Explain',
      editing: 'Редактирование',
      editedOverwrite: 'Ответы после измененного сообщения будут перезаписаны',
      cancelEdit: 'Отменить редактирование',
      currentPage: 'Текущая страница',
      close: 'Закрыть',
      selectedText: 'Выделенный текст',
      inputPlaceholder: 'Спросите об этой странице...',
      inputMessage: 'Введите сообщение',
      attachments: 'Вложения',
      addAttachments: 'Добавить вложения',
      send: 'Отправить',
      sendMessage: 'Отправить сообщение',
      stopOutput: 'Остановить генерацию',
      stopOutputMessage: 'Остановить генерацию',
      commandsSection: 'Команды',
      tabsSection: 'Вкладки',
      filesSection: 'Файлы',
      formatsSection: 'Форматы',
      showMoreTabs: 'Показать еще',
      showMoreTabsSubtitle: 'Показать еще {count} вкладок',
      allOpenTabsTitle: 'Все открытые вкладки ({count})',
      allOpenTabsSubtitle: 'Добавить все открытые вкладки этого окна',
      domainTabsTitle: 'Все открытые вкладки {host} ({count})',
      domainTabsSubtitle: 'Добавить все вкладки этого домена',
      chooseFileTitle: 'Выбрать файл...',
      chooseFileSubtitle: 'Выбрать файл из системы',
    },
  };

  let reactPropsKey = null;
  let panelRoot = null;
  let panelState = null;
  let panelResizeObserver = null;
  const tabSnapshotCache = new Map();
  const pendingLightSnapshots = new Map();
  const INTERNAL_CLIPBOARD_MIME = 'application/x-vivaldi-ask-in-page';

  function getReactProps(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element || element.ownerDocument !== document) {
      return;
    }
    if (!reactPropsKey) {
      reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
    }
    return element[reactPropsKey];
  }

  function createElement(tagName, attribute, parent, inner, options) {
    if (typeof tagName === 'undefined') {
      return;
    }
    options = options || {};
    const el = document.createElement(tagName);
    if (attribute && typeof attribute === 'object') {
      Object.keys(attribute).forEach((key) => {
        if (key === 'text') {
          el.textContent = attribute[key];
        } else if (key === 'html') {
          el.innerHTML = attribute[key];
        } else if (key === 'style' && typeof attribute[key] === 'object') {
          Object.keys(attribute[key]).forEach((css) => {
            el.style.setProperty(css, attribute[key][css]);
          });
        } else if (key === 'events' && typeof attribute[key] === 'object') {
          Object.keys(attribute[key]).forEach((eventName) => {
            if (typeof attribute[key][eventName] === 'function') {
              el.addEventListener(eventName, attribute[key][eventName]);
            }
          });
        } else if (typeof el[key] !== 'undefined') {
          el[key] = attribute[key];
        } else {
          el.setAttribute(key, attribute[key]);
        }
      });
    }
    if (inner) {
      const nodes = Array.isArray(inner) ? inner : [inner];
      nodes.forEach((node) => {
        if (node?.nodeType) {
          el.append(node);
        } else {
          const template = document.createElement('template');
          template.innerHTML = node;
          el.append(template.content.firstChild);
        }
      });
    }
    if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    if (parent) {
      if (options.isPrepend) {
        parent.prepend(el);
      } else {
        parent.append(el);
      }
    }
    return el;
  }

  function addStyle(css, id) {
    const html = Array.isArray(css) ? css.join('\n') : (css || '');
    const existing = document.getElementById(id);
    if (existing) {
      existing.innerHTML = html;
      return existing;
    }
    return createElement('style', {
      id,
      html,
    }, document.head);
  }

  function getBrowserLanguage() {
    return chrome.i18n?.getUILanguage?.() || navigator.language || 'zh-CN';
  }

  function getLanguageName(langCode) {
    return LANGUAGE_MAP[langCode] || LANGUAGE_MAP[String(langCode || '').split('-')[0]] || 'English';
  }

  function getUiStrings() {
    const language = getBrowserLanguage();
    return UI_STRINGS[language] || UI_STRINGS[String(language || '').split('-')[0]] || UI_STRINGS.en;
  }

  function t(key) {
    const localized = getUiStrings();
    return localized[key] || UI_STRINGS.en[key] || key;
  }

  function tf(key, replacements) {
    return Object.entries(replacements || {}).reduce((message, [token, value]) => {
      return message.replace(new RegExp('\\{' + token + '\\}', 'g'), String(value));
    }, t(key));
  }

  function simulateClick(element) {
    if (!element) {
      return;
    }
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, detail: 1 }));
    element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, detail: 1 }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  }

  function isAskInPageTabUrl(url) {
    const normalized = String(url || '');
    return Boolean(normalized && (normalized === code || normalized.startsWith('chrome://ask-in-page')));
  }

  function isScriptableTabUrl(url) {
    const normalized = String(url || '');
    if (!normalized || isAskInPageTabUrl(normalized)) {
      return false;
    }
    return !normalized.startsWith('chrome://') && !normalized.startsWith('vivaldi://');
  }

  function getAskInPageToolbarButton() {
    return document.querySelector(
      '.toolbar > .button-toolbar > .ToolbarButton-Button[data-name*="' + webPanelId + '"], #panels button[data-name="' + webPanelId + '"], #panels button[name="' + webPanelId + '"]'
    );
  }

  function isAskInPagePanelOpen() {
    const button = getAskInPageToolbarButton();
    return Boolean(button?.closest('.active'));
  }

  function waitForCondition(getValue, options) {
    const timeoutMs = Number(options?.timeoutMs) || 2000;
    const intervalMs = Number(options?.intervalMs) || 50;
    const startedAt = Date.now();
    return new Promise((resolve) => {
      const poll = () => {
        let value = null;
        try {
          value = getValue();
        } catch (error) {}
        if (value) {
          resolve(value);
          return;
        }
        if (Date.now() - startedAt >= timeoutMs) {
          resolve(null);
          return;
        }
        window.setTimeout(poll, intervalMs);
      };
      poll();
    });
  }

  async function openAskInPagePanel(options) {
    const settings = {
      focus: options?.focus !== false,
      selectionText: typeof options?.selectionText === 'string' ? options.selectionText : null,
    };
    createWebPanel();
    scheduleUpdatePanel();

    let button = getAskInPageToolbarButton();
    if (!button) {
      button = await waitForCondition(() => {
        scheduleUpdatePanel();
        return getAskInPageToolbarButton();
      }, { timeoutMs: 2500, intervalMs: 60 });
    }
    if (!button) {
      return false;
    }

    if (!isAskInPagePanelOpen()) {
      simulateClick(button);
    }

    scheduleUpdatePanel();
    const state = await waitForCondition(() => {
      scheduleUpdatePanel();
      return panelState?.inputField ? panelState : null;
    }, { timeoutMs: 2500, intervalMs: 60 });
    if (!state) {
      return false;
    }

    state.syncContext?.({ addCurrentPageReference: true });
    if (settings.selectionText !== null) {
      state.setSelectedTextContext?.(settings.selectionText);
    } else {
      state.syncSelectedText?.();
    }
    if (settings.focus) {
      requestAnimationFrame(() => {
        state.focusComposer?.();
      });
    }
    return true;
  }

  function handleAskInPageContextMenuClick(itemInfo) {
    if (!itemInfo) {
      return;
    }
    if (itemInfo.menuItemId === ASK_IN_PAGE_CONTEXT_MENU.selectionId) {
      openAskInPagePanel({
        focus: true,
        selectionText: String(itemInfo.selectionText || ''),
      }).catch(() => {});
      return;
    }
    if (itemInfo.menuItemId === ASK_IN_PAGE_CONTEXT_MENU.pageId) {
      openAskInPagePanel({ focus: true }).catch(() => {});
    }
  }

  function registerAskInPageContextMenus() {
    if (!chrome.contextMenus?.create) {
      return;
    }
    const menuItems = [
      {
        id: ASK_IN_PAGE_CONTEXT_MENU.selectionId,
        title: ASK_IN_PAGE_CONTEXT_MENU.selectionTitle,
        contexts: ['selection'],
      },
      {
        id: ASK_IN_PAGE_CONTEXT_MENU.pageId,
        title: ASK_IN_PAGE_CONTEXT_MENU.pageTitle,
        contexts: ['page'],
      },
    ];
    menuItems.forEach((item) => {
      try {
        chrome.contextMenus.remove(item.id, () => {
          void chrome.runtime?.lastError;
          chrome.contextMenus.create(item, () => {
            void chrome.runtime?.lastError;
          });
        });
      } catch (error) {
        chrome.contextMenus.create(item, () => {
          void chrome.runtime?.lastError;
        });
      }
    });
    if (
      chrome.contextMenus.onClicked &&
      typeof chrome.contextMenus.onClicked.hasListener === 'function' &&
      !chrome.contextMenus.onClicked.hasListener(handleAskInPageContextMenuClick)
    ) {
      chrome.contextMenus.onClicked.addListener(handleAskInPageContextMenuClick);
    }
  }

  function handleAskInPageRuntimeMessage(message) {
    if (message?.type !== ASK_IN_PAGE_RUNTIME_MESSAGE.openPanel) {
      return;
    }
    openAskInPagePanel({
      focus: true,
      selectionText: typeof message.selectionText === 'string' ? message.selectionText : null,
    }).catch(() => {});
  }

  function registerAskInPageRuntimeBridge() {
    if (
      chrome.runtime?.onMessage &&
      typeof chrome.runtime.onMessage.hasListener === 'function' &&
      !chrome.runtime.onMessage.hasListener(handleAskInPageRuntimeMessage)
    ) {
      chrome.runtime.onMessage.addListener(handleAskInPageRuntimeMessage);
    }
  }

  function getCommandDefinition(name) {
    return commandDefinitions.find((item) => item.name === name) || null;
  }

  function getCommandIconSvg(commandName) {
    switch (String(commandName || '')) {
      case 'Analyze':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      case 'Summarize':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
      case 'Explain':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.75c.62.46 1 1.17 1 1.93V17h6v-.32c0-.76.38-1.47 1-1.93A7 7 0 0 0 12 2z"/></svg>';
      case 'Rewrite':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M7 7a7 7 0 0 1 11.2 1.5L20 12"/><path d="M17 17A7 7 0 0 1 5.8 15.5L4 12"/></svg>';
      case 'Shorter':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12"/><path d="M9 12h6"/><path d="M11 17h2"/></svg>';
      case 'Translate':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h9"/><path d="M9.5 4v3c0 4-1.8 7.5-5.5 10"/><path d="M7 11c1.3 2.1 3 3.8 5 5"/><path d="M14 10h6"/><path d="M17 7v3.5c0 2.8-1.1 5.5-3.2 7.5"/><path d="M15 15h4"/></svg>';
      case 'Make table':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M9 5v14"/><path d="M15 5v14"/></svg>';
      case 'Extract action items':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';
      default:
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/></svg>';
    }
  }

  function getFormatCapabilityDefinition(id) {
    return formatCapabilityDefinitions.find((item) => item.id === id) || null;
  }

  function escapeXmlText(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeXmlAttribute(text) {
    return escapeXmlText(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function buildTokenPayload(item) {
    return {
      key: item.key || '',
      kind: item.kind || '',
      title: item.title || '',
      iconText: item.iconText || '',
      refId: item.refId || '',
      tokenRole: item.tokenRole || '',
      capabilityId: item.capabilityId || '',
      capabilityType: item.capabilityType || '',
      capabilityCategory: item.capabilityCategory || '',
      capabilityContent: item.capabilityContent || '',
    };
  }

  function serializeTokenPayload(item) {
    return encodeURIComponent(JSON.stringify(buildTokenPayload(item)));
  }

  function parseSerializedTokenPayload(value) {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (error) {
      return null;
    }
  }

  function getTokenVisibleText(item) {
    if (item?.tokenRole === 'capability') {
      return '';
    }
    return String(item?.title || '');
  }

  function buildVisibleTextFromSequence(parts, activeCmd) {
    const prefix = activeCmd ? (activeCmd + ' ') : '';
    return prefix + parts.map((part) => {
      if (part.type === 'text') {
        return part.text || '';
      }
      return getTokenVisibleText(part);
    }).join('');
  }

  function cleanModelText(text) {
    return String(text || '')
      .replace(/<\s*(?:thought|reasoning|think|thinking)\s*>[\s\S]*?<\s*\/\s*(?:thought|reasoning|think|thinking)\s*>/gi, '')
      .replace(/\r/g, '');
  }

  function appendReasoningText(existingText, nextChunk) {
    const next = String(nextChunk || '');
    if (!next) {
      return existingText || '';
    }
    return String(existingText || '') + next;
  }

  function extractThinkingSegments(text) {
    const raw = String(text || '').replace(/\r/g, '');
    let reasoning = '';
    const visible = raw.replace(/<\s*(?:think|thinking|thought|reasoning)\b[^>]*>([\s\S]*?)<\s*\/\s*(?:think|thinking|thought|reasoning)\s*>/gi, (_, captured) => {
      const normalized = String(captured || '').trim();
      if (normalized) {
        reasoning += (reasoning ? '\n' : '') + normalized;
      }
      return '';
    });
    return {
      reasoning: reasoning.trim(),
      content: visible.trim(),
    };
  }

  function createResponseNormalizationState() {
    return {
      rawTranscript: '',
      visibleChunks: [],
      reasoningChunks: [],
      unknownChunks: [],
      diagnostics: [],
      providerSignals: {
        visibleChunkCount: 0,
        reasoningChunkCount: 0,
        unknownChunkCount: 0,
      },
    };
  }

  function appendNormalizedChunk(state, channel, text) {
    const normalizedChannel = channel === 'visible' || channel === 'reasoning' ? channel : 'unknown';
    const chunk = String(text || '');
    if (!chunk) {
      return;
    }
    if (normalizedChannel === 'visible') {
      state.visibleChunks.push(chunk);
      state.providerSignals.visibleChunkCount += 1;
      return;
    }
    if (normalizedChannel === 'reasoning') {
      state.reasoningChunks.push(chunk);
      state.providerSignals.reasoningChunkCount += 1;
      return;
    }
    state.unknownChunks.push(chunk);
    state.providerSignals.unknownChunkCount += 1;
  }

  function addNormalizationDiagnostic(state, code, detail) {
    state.diagnostics.push({
      code,
      detail: detail || '',
    });
  }

  function looksLikeStructuredVisibleContent(text) {
    const value = String(text || '').trim();
    if (!value) {
      return false;
    }
    if (/<\s*table\b[\s\S]*?>/i.test(value)) {
      return true;
    }
    if (/^```[\s\S]*```$/m.test(value)) {
      return true;
    }
    if (/^\s*\|.+\|\s*$/m.test(value) && /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*(?:\s*:?-{3,}:?\s*)?\|?\s*$/m.test(value)) {
      return true;
    }
    if (/^(?:#{1,4}\s+.+|\d+\.\s+.+|[-*]\s+.+)$/m.test(value) && value.length > 40) {
      return true;
    }
    return false;
  }

  function findVisibleStructureStart(text) {
    const value = String(text || '');
    const patterns = [
      /<\s*table\b/i,
      /```/,
      /^\s*\|.+\|\s*$/m,
      /(?:^|\n)\s*#{1,4}\s+\S/m,
    ];
    const indexes = patterns
      .map((pattern) => {
        const match = value.match(pattern);
        return match?.index ?? -1;
      })
      .filter((index) => index >= 0);
    if (!indexes.length) {
      return -1;
    }
    return Math.min(...indexes);
  }

  function splitTaggedThinkingContent(text) {
    const raw = String(text || '').replace(/\r/g, '');
    if (!raw) {
      return {
        thinking: '',
        visible: '',
      };
    }
    let thinking = '';
    const visible = raw.replace(/<\s*(?:think|thinking|thought|reasoning)\b[^>]*>([\s\S]*?)<\s*\/\s*(?:think|thinking|thought|reasoning)\s*>/gi, (_, captured) => {
      const normalized = String(captured || '').trim();
      if (normalized) {
        thinking += (thinking ? '\n' : '') + normalized;
      }
      return '';
    });
    return {
      thinking: thinking.trim(),
      visible: visible.trim(),
    };
  }

  function finalizeNormalizedResponse(state) {
    const visibleRaw = state.visibleChunks.join('');
    const reasoningRaw = state.reasoningChunks.join('');
    const unknownRaw = state.unknownChunks.join('');

    const visibleSplit = splitTaggedThinkingContent(visibleRaw);
    let finalVisible = cleanModelText([visibleSplit.visible, unknownRaw].filter(Boolean).join('')).trim();
    let finalThinking = [visibleSplit.thinking, reasoningRaw].filter(Boolean).join('\n').trim();
    let confidence = 'high';
    let fallbackMode = 'none';

    const reasoningSplit = splitTaggedThinkingContent(finalThinking);
    finalThinking = reasoningSplit.thinking || finalThinking;

    if (reasoningSplit.visible) {
      finalVisible = [finalVisible, reasoningSplit.visible].filter(Boolean).join('\n').trim();
      fallbackMode = 'promoted_reasoning_trailing_visible';
      confidence = 'medium';
      addNormalizationDiagnostic(state, 'promoted_reasoning_trailing_visible', 'Detected visible content outside tagged think blocks inside reasoning channel.');
    }

    if (!finalVisible && finalThinking) {
      const structureStart = findVisibleStructureStart(finalThinking);
      if (structureStart >= 0) {
        const before = finalThinking.slice(0, structureStart).trim();
        const after = finalThinking.slice(structureStart).trim();
        if (after) {
          finalVisible = after;
          finalThinking = before;
          fallbackMode = 'promoted_reasoning_structured_suffix';
          confidence = 'medium';
          addNormalizationDiagnostic(state, 'promoted_reasoning_structured_suffix', 'Detected structured visible content inside reasoning channel.');
        }
      }
    }

    if (!finalVisible && finalThinking && looksLikeStructuredVisibleContent(finalThinking)) {
      finalVisible = finalThinking;
      finalThinking = '';
      fallbackMode = 'reasoning_only_structured_visible';
      confidence = 'low';
      addNormalizationDiagnostic(state, 'reasoning_only_structured_visible', 'Reasoning channel looked like final answer, promoted whole content.');
    }

    if (!finalVisible && !finalThinking && unknownRaw.trim()) {
      finalVisible = cleanModelText(unknownRaw).trim();
      fallbackMode = 'unknown_channel_visible';
      confidence = 'low';
      addNormalizationDiagnostic(state, 'unknown_channel_visible', 'Used unknown channel content as visible fallback.');
    }

    return {
      visibleText: finalVisible,
      thinkingText: finalThinking.trim(),
      rawVisibleText: visibleRaw,
      rawReasoningText: reasoningRaw,
      rawUnknownText: unknownRaw,
      fallbackMode,
      confidence,
      diagnostics: state.diagnostics.slice(),
      providerSignals: Object.assign({}, state.providerSignals),
    };
  }

  function truncateText(text, maxLength) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized || normalized.length <= maxLength) {
      return normalized;
    }
    return normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…';
  }

  function maskApiEndpoint(endpoint) {
    return String(endpoint || '').trim();
  }

  function logAiCompose(groupTitle, payload) {
    if (!ASK_IN_PAGE_DEBUG) {
      return;
    }
    try {
      console.groupCollapsed('[AskInPage] ' + groupTitle);
      Object.entries(payload || {}).forEach(([key, value]) => {
        console.log(key + ':', value);
      });
      console.groupEnd();
    } catch (error) {
      console.log('[AskInPage] ' + groupTitle, payload);
    }
  }

  function logAiDebug(groupTitle, payload) {
    if (!ASK_IN_PAGE_CONSOLE_DEBUG) {
      return;
    }
    try {
      console.groupCollapsed('[AskInPage] ' + groupTitle);
      Object.entries(payload || {}).forEach(([key, value]) => {
        console.log(key + ':', value);
      });
      console.groupEnd();
    } catch (error) {
      console.log('[AskInPage] ' + groupTitle, payload);
    }
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const LATEX_SYMBOLS = {
    alpha: 'α',
    beta: 'β',
    gamma: 'γ',
    delta: 'δ',
    epsilon: 'ε',
    varepsilon: 'ε',
    zeta: 'ζ',
    eta: 'η',
    theta: 'θ',
    vartheta: 'ϑ',
    iota: 'ι',
    kappa: 'κ',
    lambda: 'λ',
    mu: 'μ',
    nu: 'ν',
    xi: 'ξ',
    pi: 'π',
    varpi: 'ϖ',
    rho: 'ρ',
    varrho: 'ϱ',
    sigma: 'σ',
    varsigma: 'ς',
    tau: 'τ',
    upsilon: 'υ',
    phi: 'φ',
    varphi: 'ϕ',
    chi: 'χ',
    psi: 'ψ',
    omega: 'ω',
    Gamma: 'Γ',
    Delta: 'Δ',
    Theta: 'Θ',
    Lambda: 'Λ',
    Xi: 'Ξ',
    Pi: 'Π',
    Sigma: 'Σ',
    Upsilon: 'Υ',
    Phi: 'Φ',
    Psi: 'Ψ',
    Omega: 'Ω',
    pm: '±',
    mp: '∓',
    times: '×',
    div: '÷',
    cdot: '·',
    ast: '*',
    le: '≤',
    leq: '≤',
    ge: '≥',
    geq: '≥',
    ne: '≠',
    neq: '≠',
    approx: '≈',
    sim: '∼',
    equiv: '≡',
    infty: '∞',
    partial: '∂',
    nabla: '∇',
    forall: '∀',
    exists: '∃',
    in: '∈',
    notin: '∉',
    subset: '⊂',
    subseteq: '⊆',
    superset: '⊃',
    supset: '⊃',
    supseteq: '⊇',
    cup: '∪',
    cap: '∩',
    emptyset: '∅',
    varnothing: '∅',
    angle: '∠',
    degree: '°',
    prime: '′',
    to: '→',
    rightarrow: '→',
    leftarrow: '←',
    leftrightarrow: '↔',
    Rightarrow: '⇒',
    Leftarrow: '⇐',
    Leftrightarrow: '⇔',
    mapsto: '↦',
    cdots: '⋯',
    ldots: '…',
    dots: '…',
    land: '∧',
    lor: '∨',
    neg: '¬',
    top: '⊤',
    bot: '⊥',
    perp: '⊥',
    propto: '∝',
    therefore: '∴',
    because: '∵',
  };
  const LATEX_OPERATORS = {
    sin: 'sin',
    cos: 'cos',
    tan: 'tan',
    cot: 'cot',
    sec: 'sec',
    csc: 'csc',
    log: 'log',
    ln: 'ln',
    exp: 'exp',
    lim: 'lim',
    max: 'max',
    min: 'min',
    sup: 'sup',
    inf: 'inf',
    arg: 'arg',
    det: 'det',
    dim: 'dim',
    gcd: 'gcd',
  };

  function splitLatexTopLevel(source, separator) {
    const parts = [];
    let depth = 0;
    let current = '';
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (char === '\\') {
        if (separator === '\\\\' && source[index + 1] === '\\' && depth === 0) {
          parts.push(current);
          current = '';
          index += 1;
          continue;
        }
        current += char + (source[index + 1] || '');
        index += 1;
        continue;
      }
      if (char === '{') depth += 1;
      if (char === '}') depth = Math.max(0, depth - 1);
      if (separator === char && depth === 0) {
        parts.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    parts.push(current);
    return parts;
  }

  function renderLatexMatrix(source, displayMode) {
    const matrixMatch = String(source || '').match(/\\begin\{(p|b|v|V)?matrix\}([\s\S]*?)\\end\{(?:p|b|v|V)?matrix\}/);
    if (!matrixMatch) {
      return '';
    }
    const kind = matrixMatch[1] || '';
    const body = matrixMatch[2] || '';
    const rows = splitLatexTopLevel(body, '\\\\')
      .map((row) => splitLatexTopLevel(row, '&').map((cell) => cell.trim()))
      .filter((row) => row.some(Boolean));
    const fences = {
      p: ['(', ')'],
      b: ['[', ']'],
      v: ['|', '|'],
      V: ['‖', '‖'],
    }[kind] || ['', ''];
    const columnCount = Math.max(1, ...rows.map((row) => row.length));
    return (
      '<span class="ask-latex-matrix-wrap' + (displayMode ? ' display' : '') + '">' +
      (fences[0] ? '<span class="ask-latex-matrix-fence">' + escapeHtml(fences[0]) + '</span>' : '') +
      '<span class="ask-latex-matrix" style="grid-template-columns:repeat(' + columnCount + ', max-content)">' +
      rows.map((row) => (
        '<span class="ask-latex-matrix-row">' +
        row.map((cell) => '<span class="ask-latex-matrix-cell">' + renderLatexToHtml(cell, false) + '</span>').join('') +
        '</span>'
      )).join('') +
      '</span>' +
      (fences[1] ? '<span class="ask-latex-matrix-fence">' + escapeHtml(fences[1]) + '</span>' : '') +
      '</span>'
    );
  }

  function renderLatexToHtml(source, displayMode) {
    const raw = String(source || '').trim();
    if (!raw) {
      return '';
    }
    const matrix = renderLatexMatrix(raw, displayMode);
    if (matrix) {
      return matrix;
    }
    let index = 0;

    const readCommand = () => {
      index += 1;
      const start = index;
      while (index < raw.length && /[A-Za-z]/.test(raw[index])) {
        index += 1;
      }
      if (index === start && index < raw.length) {
        index += 1;
      }
      return raw.slice(start, index);
    };

    const skipWhitespace = () => {
      while (index < raw.length && /\s/.test(raw[index])) {
        index += 1;
      }
    };

    const parseGroup = () => {
      skipWhitespace();
      if (raw[index] !== '{') {
        return parseAtom();
      }
      index += 1;
      const html = parseExpression('}');
      if (raw[index] === '}') {
        index += 1;
      }
      return html;
    };

    const parseOptionalGroup = () => {
      skipWhitespace();
      if (raw[index] !== '[') {
        return '';
      }
      index += 1;
      const start = index;
      let depth = 1;
      while (index < raw.length && depth > 0) {
        if (raw[index] === '\\') {
          index += 2;
          continue;
        }
        if (raw[index] === '[') depth += 1;
        if (raw[index] === ']') depth -= 1;
        if (depth > 0) index += 1;
      }
      const value = raw.slice(start, index);
      if (raw[index] === ']') {
        index += 1;
      }
      return value;
    };

    const parseCommand = (command) => {
      if (command === 'frac' || command === 'dfrac' || command === 'tfrac') {
        const numerator = parseGroup();
        const denominator = parseGroup();
        return '<span class="ask-latex-frac"><span class="ask-latex-num">' + numerator + '</span><span class="ask-latex-den">' + denominator + '</span></span>';
      }
      if (command === 'sqrt') {
        const degree = parseOptionalGroup();
        const radicand = parseGroup();
        return '<span class="ask-latex-sqrt">' + (degree ? '<span class="ask-latex-root-index">' + renderLatexToHtml(degree, false) + '</span>' : '') + '<span class="ask-latex-radicand">' + radicand + '</span></span>';
      }
      if (command === 'sum' || command === 'prod' || command === 'int' || command === 'oint') {
        const symbols = { sum: '∑', prod: '∏', int: '∫', oint: '∮' };
        return '<span class="ask-latex-largeop">' + symbols[command] + '</span>';
      }
      if (command === 'left' || command === 'right' || command === 'big' || command === 'Big' || command === 'bigl' || command === 'bigr' || command === 'Bigl' || command === 'Bigr') {
        skipWhitespace();
        if (raw[index] === '\\') {
          return escapeHtml(LATEX_SYMBOLS[readCommand()] || '');
        }
        const delimiter = raw[index] || '';
        index += delimiter ? 1 : 0;
        return delimiter === '.' ? '' : '<span class="ask-latex-delim">' + escapeHtml(delimiter) + '</span>';
      }
      if (command === 'overline' || command === 'bar') {
        return '<span class="ask-latex-overline">' + parseGroup() + '</span>';
      }
      if (command === 'underline') {
        return '<span class="ask-latex-underline">' + parseGroup() + '</span>';
      }
      if (command === 'vec') {
        return '<span class="ask-latex-vector">' + parseGroup() + '</span>';
      }
      if (command === 'text' || command === 'mathrm' || command === 'operatorname') {
        return '<span class="ask-latex-text">' + parseGroup() + '</span>';
      }
      if (command === ',' || command === ';') return '<span class="ask-latex-space"></span>';
      if (command === 'quad') return '<span class="ask-latex-quad"></span>';
      if (command === 'qquad') return '<span class="ask-latex-qquad"></span>';
      if (LATEX_OPERATORS[command]) {
        return '<span class="ask-latex-op">' + escapeHtml(LATEX_OPERATORS[command]) + '</span>';
      }
      if (LATEX_SYMBOLS[command]) {
        return escapeHtml(LATEX_SYMBOLS[command]);
      }
      return '<span class="ask-latex-cmd">' + escapeHtml(command) + '</span>';
    };

    const parseAtom = () => {
      if (index >= raw.length) {
        return '';
      }
      const char = raw[index];
      if (char === '{') {
        return parseGroup();
      }
      if (char === '\\') {
        const command = readCommand();
        return parseCommand(command);
      }
      if (char === '}') {
        return '';
      }
      index += 1;
      if (/\s/.test(char)) {
        return '<span class="ask-latex-thinspace"></span>';
      }
      return escapeHtml(char);
    };

    const applyScripts = (base) => {
      let sup = '';
      let sub = '';
      while (raw[index] === '^' || raw[index] === '_') {
        const kind = raw[index];
        index += 1;
        const value = parseGroup();
        if (kind === '^') {
          sup = value;
        } else {
          sub = value;
        }
      }
      if (!sup && !sub) {
        return base;
      }
      return '<span class="ask-latex-scripted"><span class="ask-latex-script-base">' + base + '</span><span class="ask-latex-scripts">' + (sup ? '<sup>' + sup + '</sup>' : '') + (sub ? '<sub>' + sub + '</sub>' : '') + '</span></span>';
    };

    const parseExpression = (stopChar) => {
      let html = '';
      while (index < raw.length && raw[index] !== stopChar) {
        if (raw[index] === '^' || raw[index] === '_') {
          html += applyScripts('');
          continue;
        }
        html += applyScripts(parseAtom());
      }
      return html;
    };

    return '<span class="ask-latex ask-latex-' + (displayMode ? 'display' : 'inline') + '">' + parseExpression('') + '</span>';
  }

  function renderInlineMarkdown(text) {
    const latexPlaceholders = [];
    const stashLatex = (html) => {
      const key = '%%AIP_LATEX_' + latexPlaceholders.length + '%%';
      latexPlaceholders.push(html);
      return key;
    };
    let source = String(text || '');
    source = source.replace(/\\\(([\s\S]+?)\\\)/g, (_, latex) => stashLatex('<span class="ask-latex-inline">' + renderLatexToHtml(latex, false) + '</span>'));
    source = source.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => stashLatex('<span class="ask-latex-block">' + renderLatexToHtml(latex, true) + '</span>'));
    source = source.replace(/\$([^$\n]+)\$/g, (_, latex) => stashLatex('<span class="ask-latex-inline">' + renderLatexToHtml(latex, false) + '</span>'));
    let output = escapeHtml(source);
    output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
    output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
    output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/(^|[\s(])\*([^*]+)\*(?=$|[\s).,!?:;])/g, '$1<em>$2</em>');
    output = output.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    latexPlaceholders.forEach((html, index) => {
      output = output.replaceAll('%%AIP_LATEX_' + index + '%%', html);
    });
    return output;
  }

  function countIndent(line) {
    const match = String(line || '').match(/^ */);
    return match ? match[0].length : 0;
  }

  function isHrLine(line) {
    return /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line || '');
  }

  function isTableSeparator(line) {
    return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*(?:\s*:?-{3,}:?\s*)?\|?\s*$/.test(line || '');
  }

  function parseTableRow(line) {
    return String(line || '')
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());
  }

  function stripIndent(line, indent) {
    const count = Math.min(countIndent(line), indent);
    return String(line || '').slice(count);
  }

  function highlightCode(code, language) {
    const escaped = escapeHtml(code);
    const lang = String(language || '').toLowerCase();
    if (lang === 'json') {
      return escaped
        .replace(/(&quot;.*?&quot;)(\s*:)/g, '<span class="ask-code-key">$1</span>$2')
        .replace(/:\s*(&quot;.*?&quot;)/g, ': <span class="ask-code-string">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="ask-code-keyword">$1</span>')
        .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="ask-code-number">$1</span>');
    }
    if (lang === 'js' || lang === 'javascript' || lang === 'ts' || lang === 'typescript') {
      return escaped
        .replace(/\b(const|let|var|function|return|if|else|await|async|import|from|export|class|new|throw|try|catch)\b/g, '<span class="ask-code-keyword">$1</span>')
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="ask-code-string">$1</span>')
        .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="ask-code-number">$1</span>');
    }
    if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh') {
      return escaped
        .replace(/^([$\w./-]+)/gm, '<span class="ask-code-keyword">$1</span>')
        .replace(/(\s--?[\w-]+)/g, '<span class="ask-code-number">$1</span>')
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="ask-code-string">$1</span>');
    }
    return escaped;
  }

  function enhanceRenderedAnswer(container) {
    container.querySelectorAll('pre > code').forEach((codeBlock) => {
      const language = codeBlock.getAttribute('data-lang') || '';
      const rawCode = codeBlock.textContent || '';
      codeBlock.innerHTML = highlightCode(rawCode, language);
      const pre = codeBlock.parentElement;
      if (!pre || pre.querySelector('.ask-code-copy')) {
        return;
      }
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'ask-code-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(rawCode);
          copyBtn.textContent = 'Copied';
        } catch (error) {
          const range = document.createRange();
          range.selectNodeContents(codeBlock);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          try {
            document.execCommand('copy');
            copyBtn.textContent = 'Copied';
          } catch (copyError) {
            copyBtn.textContent = 'Failed';
          }
          selection?.removeAllRanges();
        }
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 1200);
      });
      pre.appendChild(copyBtn);
    });
  }

  function renderMarkdownToHtml(markdown) {
    const source = String(markdown || '').replace(/\r/g, '');
    if (!source.trim()) {
      return '';
    }
    const lines = source.split('\n');

    function parseBlocks(blockLines, baseIndent) {
      const blocks = [];
      let i = 0;

      function parseList(startIndex) {
        const firstLine = blockLines[startIndex];
        const firstMatch = firstLine.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
        if (!firstMatch) {
          return null;
        }
        const listIndent = firstMatch[1].length;
        const ordered = /\d+\./.test(firstMatch[2]);
        const tag = ordered ? 'ol' : 'ul';
        const items = [];
        let index = startIndex;

        while (index < blockLines.length) {
          const line = blockLines[index];
          const match = line.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
          if (!match || match[1].length !== listIndent || (/\d+\./.test(match[2]) !== ordered)) {
            break;
          }
          const taskMatch = match[3].match(/^\[( |x|X)]\s+(.*)$/);
          const itemLines = [taskMatch ? taskMatch[2] : match[3]];
          index += 1;
          while (index < blockLines.length) {
            const nextLine = blockLines[index];
            if (!nextLine.trim()) {
              itemLines.push('');
              index += 1;
              continue;
            }
            const nextMatch = nextLine.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
            if (nextMatch && nextMatch[1].length === listIndent && (/\d+\./.test(nextMatch[2]) === ordered)) {
              break;
            }
            if (countIndent(nextLine) <= listIndent && !/^>\s?/.test(nextLine)) {
              break;
            }
            itemLines.push(stripIndent(nextLine, listIndent + 2));
            index += 1;
          }
          const itemHtml = parseBlocks(itemLines, 0);
          if (taskMatch) {
            const checked = /[xX]/.test(taskMatch[1]);
            items.push(
              '<li class="ask-task-item">' +
              '<span class="ask-task-box' + (checked ? ' checked' : '') + '" aria-hidden="true">' + (checked ? '✓' : '') + '</span>' +
              '<span class="ask-task-content">' + itemHtml + '</span>' +
              '</li>'
            );
          } else {
            items.push('<li>' + itemHtml + '</li>');
          }
        }

        return {
          html: '<' + tag + '>' + items.join('') + '</' + tag + '>',
          nextIndex: index,
        };
      }

      while (i < blockLines.length) {
        const originalLine = blockLines[i];
        const line = stripIndent(originalLine, baseIndent);
        if (!line.trim()) {
          i += 1;
          continue;
        }
        if (countIndent(originalLine) < baseIndent) {
          break;
        }
        if (/^```/.test(line.trim())) {
          const language = line.trim().slice(3).trim();
          const codeLines = [];
          i += 1;
          while (i < blockLines.length && !/^```/.test(stripIndent(blockLines[i], baseIndent).trim())) {
            codeLines.push(stripIndent(blockLines[i], baseIndent));
            i += 1;
          }
          if (i < blockLines.length) {
            i += 1;
          }
          blocks.push('<pre><code' + (language ? (' data-lang="' + escapeHtml(language) + '"') : '') + '>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
          continue;
        }
        if (line.trim() === '$$' || line.trim() === '\\[') {
          const closeMarker = line.trim() === '$$' ? '$$' : '\\]';
          const latexLines = [];
          i += 1;
          while (i < blockLines.length && stripIndent(blockLines[i], baseIndent).trim() !== closeMarker) {
            latexLines.push(stripIndent(blockLines[i], baseIndent));
            i += 1;
          }
          if (i < blockLines.length) {
            i += 1;
          }
          blocks.push('<div class="ask-latex-block">' + renderLatexToHtml(latexLines.join('\n'), true) + '</div>');
          continue;
        }
        const heading = line.match(/^(#{1,4})\s+(.*)$/);
        if (heading) {
          const level = heading[1].length;
          blocks.push('<h' + level + '>' + renderInlineMarkdown(heading[2]) + '</h' + level + '>');
          i += 1;
          continue;
        }
        if (isHrLine(line)) {
          blocks.push('<hr>');
          i += 1;
          continue;
        }
        if (line.includes('|') && i + 1 < blockLines.length && isTableSeparator(stripIndent(blockLines[i + 1], baseIndent))) {
          const headerCells = parseTableRow(line);
          i += 2;
          const rows = [];
          while (i < blockLines.length) {
            const rowLine = stripIndent(blockLines[i], baseIndent);
            if (!rowLine.trim() || !rowLine.includes('|')) {
              break;
            }
            rows.push(parseTableRow(rowLine));
            i += 1;
          }
          blocks.push(
            '<table><thead><tr>' + headerCells.map((cell) => '<th>' + renderInlineMarkdown(cell) + '</th>').join('') + '</tr></thead>' +
            '<tbody>' + rows.map((row) => '<tr>' + row.map((cell) => '<td>' + renderInlineMarkdown(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table>'
          );
          continue;
        }
        if (/^>\s?/.test(line)) {
          const quoteLines = [];
          while (i < blockLines.length) {
            const current = stripIndent(blockLines[i], baseIndent);
            if (!/^>\s?/.test(current) && current.trim()) {
              break;
            }
            quoteLines.push(current.replace(/^>\s?/, ''));
            i += 1;
            if (i < blockLines.length && !blockLines[i].trim()) {
              quoteLines.push('');
              i += 1;
            }
          }
          blocks.push('<blockquote>' + parseBlocks(quoteLines, 0) + '</blockquote>');
          continue;
        }
        const list = parseList(i);
        if (list) {
          blocks.push(list.html);
          i = list.nextIndex;
          continue;
        }
        const paragraph = [];
        while (i < blockLines.length) {
          const currentLine = stripIndent(blockLines[i], baseIndent);
          if (!currentLine.trim()) {
            break;
          }
          if (/^(#{1,4})\s+/.test(currentLine) || /^```/.test(currentLine.trim()) || isHrLine(currentLine) || /^>\s?/.test(currentLine) || currentLine.match(/^(\s*)([-+*]|\d+\.)\s+/) || (currentLine.includes('|') && i + 1 < blockLines.length && isTableSeparator(stripIndent(blockLines[i + 1], baseIndent)))) {
            break;
          }
          paragraph.push(currentLine);
          i += 1;
        }
        blocks.push('<p>' + renderInlineMarkdown(paragraph.join(' ')) + '</p>');
      }
      return blocks.join('');
    }

    return parseBlocks(lines, 0);
  }

  async function renderRichAnswer(container, text) {
    const raw = String(text || '');
    if (!raw) {
      container.textContent = '';
      return;
    }
    container.innerHTML = renderMarkdownToHtml(raw);
    enhanceRenderedAnswer(container);
  }

  async function settleStreamingAnswer(container, text, options) {
    const raw = cleanModelText(String(text || '')).trim();
    const isError = Boolean(options && options.isError);
    container.classList.toggle('ask-msg-ai-error', isError);
    if (!raw) {
      container.textContent = String((options && options.fallbackText) || '');
      return;
    }
    await renderRichAnswer(container, raw);
  }

  function ensureLiveAnswerNodes(answerNode) {
    let live = answerNode.querySelector('.ask-msg-ai-answer-live');
    let committed = live?.querySelector('.ask-msg-ai-answer-committed');
    let preview = live?.querySelector('.ask-msg-ai-answer-preview');
    let tailCurrent = preview?.querySelector('.ask-msg-ai-answer-tail-current');
    let tailGhost = preview?.querySelector('.ask-msg-ai-answer-tail-ghost');
    if (!live || !committed || !preview || !tailCurrent || !tailGhost) {
      answerNode.innerHTML = '';
      live = document.createElement('div');
      live.className = 'ask-msg-ai-answer-live';
      committed = document.createElement('div');
      committed.className = 'ask-msg-ai-answer-committed';
      preview = document.createElement('div');
      preview.className = 'ask-msg-ai-answer-preview';
      tailCurrent = document.createElement('span');
      tailCurrent.className = 'ask-msg-ai-answer-tail-current';
      tailGhost = document.createElement('span');
      tailGhost.className = 'ask-msg-ai-answer-tail-ghost';
      preview.append(tailCurrent, tailGhost);
      live.append(committed, preview);
      answerNode.appendChild(live);
    }
    return { live, committed, preview, tailCurrent, tailGhost };
  }

  function renderAnimatedTail(container, text, className) {
    const normalized = String(text || '');
    const previous = container.dataset.src || '';
    if (normalized === previous) {
      return;
    }
    if (!normalized) {
      container.innerHTML = '';
      container.dataset.src = '';
      return;
    }
    if (!previous || !normalized.startsWith(previous)) {
      container.innerHTML = '';
      const parts = normalized.match(/\S+\s*|\s+/g) || [normalized];
      parts.forEach((part) => {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = part;
        container.appendChild(span);
      });
      container.dataset.src = normalized;
      return;
    }
    const delta = normalized.slice(previous.length);
    const parts = delta.match(/\S+\s*|\s+/g) || [delta];
    parts.forEach((part) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = part;
      container.appendChild(span);
    });
    container.dataset.src = normalized;
  }

  function renderGhostTail(container, text) {
    const normalized = String(text || '');
    if (!normalized) {
      container.textContent = '';
      container.dataset.src = '';
      return;
    }
    if ((container.dataset.src || '') === normalized) {
      return;
    }
    container.textContent = normalized;
    container.dataset.src = normalized;
  }

  function splitStableMarkdown(markdown) {
    const source = String(markdown || '').replace(/\r/g, '');
    if (!source) {
      return { committed: '', preview: '' };
    }
    let committedEnd = 0;
    let cursor = 0;

    function findParagraphBoundary(start) {
      const doubleNewlineIndex = source.indexOf('\n\n', start);
      return doubleNewlineIndex === -1 ? -1 : doubleNewlineIndex + 2;
    }

    while (cursor < source.length) {
      while (cursor < source.length && /\s/.test(source[cursor])) {
        cursor += 1;
      }
      if (cursor >= source.length) {
        break;
      }

      if (source.slice(cursor, cursor + 3) === '```') {
        const fenceClose = source.indexOf('\n```', cursor + 3);
        if (fenceClose === -1) {
          break;
        }
        let nextCursor = fenceClose + 4;
        if (source[nextCursor] === '\n') {
          nextCursor += 1;
        }
        committedEnd = nextCursor;
        cursor = nextCursor;
        continue;
      }

      const lineEnd = source.indexOf('\n', cursor);
      const firstLine = source.slice(cursor, lineEnd === -1 ? source.length : lineEnd);
      const trimmedFirstLine = firstLine.trim();

      // Keep complex markdown blocks in preview until the final render.
      if (
        /^(#{1,4})\s+/.test(trimmedFirstLine) ||
        /^>\s?/.test(trimmedFirstLine) ||
        /^(\s*)([-+*]|\d+\.)\s+/.test(firstLine) ||
        (trimmedFirstLine.includes('|') && lineEnd !== -1)
      ) {
        break;
      }

      const paragraphBoundary = findParagraphBoundary(cursor);
      if (paragraphBoundary === -1) {
        break;
      }
      committedEnd = paragraphBoundary;
      cursor = paragraphBoundary;
    }

    let committed = source.slice(0, committedEnd);
    let preview = source.slice(committedEnd);
    const previewTrimmed = preview.trimStart();
    const hasComplexPreview = /(^|\n)(#{1,4}\s|>\s|[-*+]\s|\d+\.\s|\|)|```/.test(previewTrimmed);
    if (!hasComplexPreview && preview.length >= STREAM_UI_CONFIG.stableTailCommitChars) {
      const sentenceMatches = Array.from(preview.matchAll(/[\s\S]*?[。！？.!?](?=\s|$)/g));
      const lastSentence = sentenceMatches.length ? sentenceMatches[sentenceMatches.length - 1][0] : '';
      if (lastSentence && lastSentence.length >= 60) {
        committed += lastSentence;
        preview = preview.slice(lastSentence.length);
      } else {
        const breakIndex = Math.max(preview.lastIndexOf('\n'), preview.lastIndexOf('  '));
        if (breakIndex >= 80) {
          committed += preview.slice(0, breakIndex + 1);
          preview = preview.slice(breakIndex + 1);
        }
      }
    }
    return { committed, preview };
  }

  function renderStreamingMarkdown(answerNode, displayedText, fullText) {
    const liveNodes = ensureLiveAnswerNodes(answerNode);
    const normalizedDisplayed = cleanModelText(displayedText);
    const normalizedFull = cleanModelText(typeof fullText === 'string' ? fullText : displayedText);
    const parts = splitStableMarkdown(normalizedDisplayed);
    const ghostTail = normalizedFull.slice(
      normalizedDisplayed.length,
      normalizedDisplayed.length + STREAM_UI_CONFIG.ghostTailChars
    );
    if ((liveNodes.committed.dataset.srcHash || '') !== parts.committed) {
      liveNodes.committed.innerHTML = parts.committed ? renderMarkdownToHtml(parts.committed) : '';
      liveNodes.committed.dataset.srcHash = parts.committed;
      enhanceRenderedAnswer(liveNodes.committed);
    }
    renderAnimatedTail(liveNodes.tailCurrent, parts.preview || '', 'ask-msg-ai-tail-token');
    renderGhostTail(liveNodes.tailGhost, ghostTail || '');
    liveNodes.preview.classList.toggle('has-tail', Boolean(parts.preview || ghostTail));
  }

  function promisifyChrome(methodOwner, methodName, args) {
    return new Promise((resolve, reject) => {
      if (!methodOwner || typeof methodOwner[methodName] !== 'function') {
        resolve([]);
        return;
      }
      methodOwner[methodName](...(args || []), (result) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  async function getCurrentTab() {
    const tabs = await promisifyChrome(chrome.tabs, 'query', [{ active: true, currentWindow: true }]);
    return tabs?.[0] || null;
  }

  async function getPanelTabs() {
    const tabs = await promisifyChrome(chrome.tabs, 'query', [{ currentWindow: true }]);
    return (tabs || [])
      .filter((tab) => {
        if (!tab || !tab.id) {
          return false;
        }
        const url = String(tab.url || tab.pendingUrl || '');
        const title = String(tab.title || '');
        if (url === code || url.startsWith('chrome://ask-in-page') || title === name) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return (b.lastAccessed || 0) - (a.lastAccessed || 0);
      })
      .slice(0, TAB_SUGGESTION_LIMITS.expanded);
  }

  async function getCurrentTabSelection() {
    const tab = await getCurrentTab();
    if (!tab?.id) {
      return '';
    }
    const url = String(tab.url || tab.pendingUrl || '');
    if (!isScriptableTabUrl(url)) {
      return '';
    }
    const results = await promisifyChrome(chrome.scripting, 'executeScript', [{
      target: {
        tabId: tab.id,
        allFrames: true,
      },
      injectImmediately: true,
      func: () => {
        try {
          const active = document.activeElement;
          if (
            active &&
            (active.tagName === 'TEXTAREA' ||
            (active.tagName === 'INPUT' && /^(?:text|search|url|tel|password|email)$/i.test(active.type || 'text')))
          ) {
            const start = Number(active.selectionStart);
            const end = Number(active.selectionEnd);
            if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
              return String(active.value || '').slice(start, end).trim();
            }
          }
          return String(document.getSelection?.()?.toString?.() || '').trim();
        } catch (error) {
          return '';
        }
      },
    }]);
    return (results || [])
      .map((item) => String(item?.result || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] || '';
  }

  async function clearCurrentTabSelection() {
    const tab = await getCurrentTab();
    if (!tab?.id) {
      return;
    }
    const url = String(tab.url || tab.pendingUrl || '');
    if (!isScriptableTabUrl(url)) {
      return;
    }
    await promisifyChrome(chrome.scripting, 'executeScript', [{
      target: {
        tabId: tab.id,
        allFrames: true,
      },
      injectImmediately: true,
      func: () => {
        try {
          const active = document.activeElement;
          if (
            active &&
            (active.tagName === 'TEXTAREA' ||
            (active.tagName === 'INPUT' && /^(?:text|search|url|tel|password|email)$/i.test(active.type || 'text')))
          ) {
            active.selectionStart = active.selectionEnd;
          }
          document.getSelection?.()?.removeAllRanges?.();
        } catch (error) {}
      },
    }]);
  }

  async function ensureSelectionAskButton(tabLike) {
    const tab = tabLike?.id ? tabLike : await getCurrentTab();
    if (!tab?.id) {
      return;
    }
    const url = String(tab.url || tab.pendingUrl || '');
    if (!isScriptableTabUrl(url)) {
      return;
    }
    try {
      await promisifyChrome(chrome.scripting, 'executeScript', [{
        target: {
          tabId: tab.id,
          allFrames: true,
        },
        injectImmediately: true,
        args: [{
          buttonLabel: ASK_IN_PAGE_SELECTION_BUTTON_LABEL,
          messageType: ASK_IN_PAGE_RUNTIME_MESSAGE.openPanel,
        }],
        func: (config) => {
          try {
            const state = window.__askInPageSelectionAskState || (window.__askInPageSelectionAskState = {});
            if (state.installed) {
              state.buttonLabel = String(config?.buttonLabel || 'Ask');
              if (state.button) {
                state.button.textContent = state.buttonLabel;
              }
              state.scheduleUpdate?.();
              return;
            }

            const BUTTON_ID = 'ask-in-page-selection-button';
            const EDGE_PADDING = 12;

            const readSelectionData = () => {
              try {
                const active = document.activeElement;
                if (
                  active &&
                  (active.tagName === 'TEXTAREA' ||
                  (active.tagName === 'INPUT' && /^(?:text|search|url|tel|password|email)$/i.test(active.type || 'text')))
                ) {
                  const start = Number(active.selectionStart);
                  const end = Number(active.selectionEnd);
                  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
                    return {
                      text: String(active.value || '').slice(start, end).replace(/\s+/g, ' ').trim(),
                      rect: active.getBoundingClientRect(),
                    };
                  }
                }
                const selection = document.getSelection?.();
                if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                  return null;
                }
                const text = String(selection.toString?.() || '').replace(/\s+/g, ' ').trim();
                if (!text) {
                  return null;
                }
                const range = selection.getRangeAt(0);
                let rect = range.getBoundingClientRect();
                if ((!rect || (!rect.width && !rect.height)) && range.getClientRects().length) {
                  const rects = Array.from(range.getClientRects()).filter((item) => item.width || item.height);
                  rect = rects[0] || rect;
                }
                if (!rect || (!rect.width && !rect.height)) {
                  return null;
                }
                return { text, rect };
              } catch (error) {
                return null;
              }
            };

            const ensureButton = () => {
              let button = document.getElementById(BUTTON_ID);
              if (button) {
                return button;
              }
              button = document.createElement('button');
              button.id = BUTTON_ID;
              button.type = 'button';
              button.textContent = String(config?.buttonLabel || 'Ask');
              button.tabIndex = -1;
              Object.assign(button.style, {
                position: 'fixed',
                left: '0',
                top: '0',
                transform: 'translate3d(-9999px,-9999px,0)',
                zIndex: '2147483647',
                padding: '7px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(31, 35, 40, 0.18)',
                background: 'rgba(255, 255, 255, 0.96)',
                color: '#111827',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.18)',
                font: '600 13px/1.1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                letterSpacing: '0',
                pointerEvents: 'auto',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              });
              ['pointerdown', 'mousedown'].forEach((eventName) => {
                button.addEventListener(eventName, (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                });
              });
              button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const data = readSelectionData();
                if (!data?.text) {
                  hideButton();
                  return;
                }
                try {
                  chrome.runtime?.sendMessage?.({
                    type: config?.messageType,
                    selectionText: data.text,
                  });
                } catch (error) {}
                hideButton();
              });
              (document.documentElement || document.body || document).appendChild(button);
              return button;
            };

            const hideButton = () => {
              const button = ensureButton();
              button.hidden = true;
              button.style.transform = 'translate3d(-9999px,-9999px,0)';
            };

            const updateButton = () => {
              if (state.leftMouseSelecting) {
                hideButton();
                return;
              }
              const data = readSelectionData();
              if (!data?.text) {
                hideButton();
                return;
              }
              const button = ensureButton();
              button.hidden = false;
              button.textContent = state.buttonLabel;
              button.dataset.selectionText = data.text;
              const width = button.offsetWidth || 44;
              const height = button.offsetHeight || 32;
              const left = Math.min(
                Math.max(EDGE_PADDING, data.rect.left + (data.rect.width / 2) - (width / 2)),
                Math.max(EDGE_PADDING, window.innerWidth - width - EDGE_PADDING)
              );
              const preferredTop = data.rect.top - height - 10;
              const top = preferredTop >= EDGE_PADDING
                ? preferredTop
                : Math.min(window.innerHeight - height - EDGE_PADDING, data.rect.bottom + 10);
              button.style.transform = 'translate3d(' + Math.round(left) + 'px,' + Math.round(Math.max(EDGE_PADDING, top)) + 'px,0)';
            };

            const scheduleUpdate = () => {
              if (state.frameRequested) {
                return;
              }
              state.frameRequested = true;
              requestAnimationFrame(() => {
                state.frameRequested = false;
                updateButton();
              });
            };

            state.installed = true;
            state.leftMouseSelecting = false;
            state.buttonLabel = String(config?.buttonLabel || 'Ask');
            state.scheduleUpdate = scheduleUpdate;
            state.button = ensureButton();
            hideButton();

            window.addEventListener('mousedown', (event) => {
              if (event.button !== 0) {
                return;
              }
              state.leftMouseSelecting = true;
              hideButton();
            }, { passive: true });
            document.addEventListener('selectionchange', scheduleUpdate, { passive: true });
            document.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
            window.addEventListener('mouseup', (event) => {
              if (event.button === 0) {
                state.leftMouseSelecting = false;
              }
              scheduleUpdate();
            }, { passive: true });
            window.addEventListener('keyup', scheduleUpdate, { passive: true });
            window.addEventListener('scroll', scheduleUpdate, { passive: true });
            window.addEventListener('resize', scheduleUpdate, { passive: true });
            window.addEventListener('blur', () => {
              state.leftMouseSelecting = false;
              hideButton();
            }, { passive: true });
            window.setTimeout(scheduleUpdate, 0);
          } catch (error) {}
        },
      }]);
    } catch (error) {}
  }

  async function getTabContentSnapshot(tabLike, options) {
    const config = {
      lightweight: Boolean(options?.lightweight),
      allowCachedLightweight: Boolean(options?.allowCachedLightweight),
    };
    const tabId = Number(tabLike?.id || tabLike?.raw?.id);
    const url = String(tabLike?.url || tabLike?.raw?.url || tabLike?.raw?.pendingUrl || '');
    const title = String(tabLike?.title || tabLike?.raw?.title || '');
    const cacheKey = tabId + '::' + url;
    if (!tabId || !url || url === code || /^chrome:\/\//.test(url) || /^vivaldi:\/\//.test(url)) {
      logAiCompose('Tab Content Snapshot Skipped', {
        tabId,
        title,
        url,
        reason: 'unsupported-or-internal-url',
      });
      return {
        title,
        url,
        content: '',
      };
    }
    const cached = tabSnapshotCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < PERFORMANCE_CONFIG.tabSnapshotCacheTtlMs) {
      if (!config.lightweight && cached.mode === 'lightweight' && !config.allowCachedLightweight) {
        // fall through and upgrade to a fuller snapshot
      } else {
        return cached.value;
      }
    }
    try {
      const results = await promisifyChrome(chrome.scripting, 'executeScript', [{
        target: {
          tabId,
          allFrames: true,
        },
        injectImmediately: true,
        args: [config.lightweight ? LIGHTWEIGHT_SNAPSHOT_CONFIG : null],
        func: (lightweightConfig) => {
          try {
            const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
            const truncate = (value, maxLength) => {
              const normalized = normalizeText(value);
              if (!normalized || normalized.length <= maxLength) {
                return normalized;
              }
              return normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '...';
            };
            const ignoredSelector = [
              'script',
              'style',
              'noscript',
              'svg',
              'canvas',
              'nav',
              'header',
              'footer',
              'aside',
              'form',
              '[aria-hidden="true"]',
              '[hidden]',
              '.hidden',
              '.visually-hidden',
              '.sr-only',
              '.sidebar',
              '.nav',
              '.navigation',
              '.menu',
              '.comments',
              '.comment',
              '.related',
              '.recommend',
              '.ads',
              '.advertisement',
              '.cookie',
              '.modal',
              '.popup',
            ].join(',');
            const getMeta = (selector) => {
              const node = document.querySelector(selector);
              return normalizeText(node?.content || node?.getAttribute?.('content') || '');
            };
            const safeCssEscape = (value) => {
              try {
                return CSS?.escape ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&');
              } catch (error) {
                return value;
              }
            };
            const isProbablyNoise = (el) => {
              if (!el || el.matches?.(ignoredSelector)) {
                return true;
              }
              const idAndClass = ((el.id ? ('#' + el.id + ' ') : '') + (el.className || '')).toLowerCase();
              return /(comment|footer|header|sidebar|related|promo|advert|cookie|modal|popup|breadcrumb|share)/.test(idAndClass);
            };
            const collectText = (el) => {
              if (!el || isProbablyNoise(el)) {
                return '';
              }
              const clone = el.cloneNode(true);
              clone.querySelectorAll?.(ignoredSelector)?.forEach((node) => node.remove());
              return normalizeText(clone.innerText || clone.textContent || '');
            };
            const candidates = [];
            const addCandidate = (el, label, baseScore) => {
              if (!el || candidates.some((item) => item.el === el) || isProbablyNoise(el)) {
                return;
              }
              const text = collectText(el);
              if (text.length < 200) {
                return;
              }
              const paragraphs = el.querySelectorAll?.('p')?.length || 0;
              const headings = el.querySelectorAll?.('h1, h2, h3')?.length || 0;
              const links = Array.from(el.querySelectorAll?.('a[href]') || []);
              const linkTextLength = links.reduce((sum, link) => sum + normalizeText(link.innerText || link.textContent || '').length, 0);
              const punctuationMatches = text.match(/[.!?。！？：:；;]/g) || [];
              const score = baseScore
                + Math.min(text.length, 12000) / 80
                + paragraphs * 18
                + headings * 24
                + punctuationMatches.length * 2
                - Math.min(linkTextLength, text.length) / 35;
              candidates.push({
                el,
                label,
                text,
                score,
              });
            };

            [
              ['article', 260],
              ['main', 220],
              ['[role="main"]', 220],
              ['.article', 180],
              ['.post', 180],
              ['.entry-content', 180],
              ['.post-content', 180],
              ['.article-content', 180],
              ['.markdown-body', 180],
              ['.content', 120],
            ].forEach(([selector, baseScore]) => {
              document.querySelectorAll(selector).forEach((el) => addCandidate(el, selector, baseScore));
            });

            Array.from(document.querySelectorAll('article, main, section, div'))
              .slice(0, lightweightConfig?.candidateNodeLimit || 160)
              .forEach((el) => {
                const rect = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
                if (rect && rect.width < 280) {
                  return;
                }
                addCandidate(el, el.tagName?.toLowerCase?.() || 'node', 30);
              });

            candidates.sort((a, b) => b.score - a.score);
            const bestCandidate = candidates[0] || null;
            const bodyText = collectText(document.body);
            const mainText = bestCandidate?.text || bodyText;
            const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
              .map((node) => normalizeText(node.innerText || node.textContent || ''))
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, lightweightConfig?.maxHeadingCount || 12);
            const imageAlts = Array.from(document.querySelectorAll('img[alt]'))
              .map((node) => normalizeText(node.getAttribute('alt')))
              .filter((value) => value && value.length >= 4)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, lightweightConfig?.maxImageAltCount || 12);
            const importantLinks = Array.from((bestCandidate?.el || document.body).querySelectorAll?.('a[href]') || [])
              .map((node) => {
                const text = normalizeText(node.innerText || node.textContent || '');
                const href = normalizeText(node.href || node.getAttribute('href') || '');
                return text && href ? (truncate(text, 80) + ' -> ' + truncate(href, 140)) : '';
              })
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, lightweightConfig?.maxImportantLinkCount || 12);
            const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
              .map((node) => {
                try {
                  const parsed = JSON.parse(node.textContent || '');
                  const items = Array.isArray(parsed) ? parsed : [parsed];
                  return items.map((item) => {
                    if (!item || typeof item !== 'object') {
                      return '';
                    }
                    const authorValue = item.author;
                    const authorText = Array.isArray(authorValue)
                      ? authorValue.map((entry) => normalizeText(entry?.name || entry)).filter(Boolean).join(', ')
                      : normalizeText(authorValue?.name || authorValue || '');
                    return [
                      normalizeText(item.headline || item.name || ''),
                      normalizeText(item.description || ''),
                      authorText ? ('Author: ' + authorText) : '',
                      normalizeText(item.datePublished || item.dateCreated || ''),
                    ].filter(Boolean).join(' | ');
                  }).filter(Boolean);
                } catch (error) {
                  return [];
                }
              })
              .flat()
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .slice(0, lightweightConfig?.maxJsonLdCount || 8);

            return {
              title: document.title || '',
              url: location.href,
              frameType: window.top === window ? 'top' : 'subframe',
              metaDescription: getMeta('meta[name="description"]') || getMeta('meta[property="og:description"]') || getMeta('meta[name="twitter:description"]'),
              metaTitle: getMeta('meta[property="og:title"]') || getMeta('meta[name="twitter:title"]'),
              content: lightweightConfig?.maxContentChars ? truncate(mainText, lightweightConfig.maxContentChars) : mainText,
              fullText: lightweightConfig?.maxContentChars ? truncate(bodyText, lightweightConfig.maxContentChars) : bodyText,
              headings,
              imageAlts,
              importantLinks,
              jsonLd,
              extractionSource: bestCandidate?.label || 'body',
            };
          } catch (error) {
            return {
              title: document.title || '',
              url: location.href,
              frameType: 'unknown',
              metaDescription: '',
              metaTitle: '',
              content: '',
              fullText: '',
              headings: [],
              imageAlts: [],
              importantLinks: [],
              jsonLd: [],
              extractionSource: 'error',
            };
          }
        },
      }]);
      const frames = (results || [])
        .map((entry) => entry?.result || null)
        .filter(Boolean);
      const topFrame = frames.find((entry) => entry.frameType === 'top') || frames[0] || {};
      const uniqueTexts = [];
      const pushUniqueText = (value, prefix) => {
        const normalized = String(value || '').replace(/\s+/g, ' ').trim();
        if (!normalized || uniqueTexts.includes(normalized)) {
          return;
        }
        uniqueTexts.push(normalized);
      };
      pushUniqueText(topFrame.content || '', 'Main');
      frames
        .filter((entry) => entry !== topFrame)
        .map((entry) => String(entry.content || '').replace(/\s+/g, ' ').trim())
        .filter((text) => text.length >= 280)
        .sort((a, b) => b.length - a.length)
        .slice(0, 3)
        .forEach((text) => pushUniqueText(text, 'Embedded Frame'));
      if (uniqueTexts.length === 0) {
        pushUniqueText(topFrame.fullText || '', 'Page');
      }
      const headings = frames
        .flatMap((entry) => Array.isArray(entry.headings) ? entry.headings : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 16);
      const imageAlts = frames
        .flatMap((entry) => Array.isArray(entry.imageAlts) ? entry.imageAlts : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 16);
      const importantLinks = frames
        .flatMap((entry) => Array.isArray(entry.importantLinks) ? entry.importantLinks : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 16);
      const jsonLd = frames
        .flatMap((entry) => Array.isArray(entry.jsonLd) ? entry.jsonLd : [])
        .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 10);
      const combinedContent = truncateText(uniqueTexts.join('\n\n[Embedded Frame]\n\n'), CONTEXT_LIMITS.pageContentChars);

      logAiCompose('Tab Content Snapshot', {
        tabId,
        title: String(topFrame.title || title || ''),
        url: String(topFrame.url || url || ''),
        contentLength: combinedContent.length,
        contentPreview: truncateText(combinedContent || '', 500),
        headings,
        extractionSource: String(topFrame.extractionSource || ''),
        frameCount: frames.length,
      });
      const snapshot = {
        title: String(topFrame.metaTitle || topFrame.title || title || ''),
        url: String(topFrame.url || url || ''),
        subtitle: getHostFromUrl(String(topFrame.url || url || '')),
        metaDescription: String(topFrame.metaDescription || ''),
        headings,
        imageAlts,
        importantLinks,
        jsonLd,
        extractionSource: String(topFrame.extractionSource || ''),
        content: combinedContent,
      };
      if (!snapshot.content) {
        snapshot.content = [
          'Tab metadata only.',
          snapshot.title ? ('Title: ' + snapshot.title) : '',
          snapshot.url ? ('URL: ' + snapshot.url) : '',
          snapshot.metaDescription ? ('Meta Description: ' + snapshot.metaDescription) : '',
          'The page DOM is not readable yet. This often happens when the tab is still loading, discarded, or has not been opened in a live renderer.',
        ].filter(Boolean).join('\n');
        snapshot.extractionSource = snapshot.extractionSource || 'tab-metadata-fallback';
      }
      tabSnapshotCache.set(cacheKey, {
        timestamp: Date.now(),
        value: snapshot,
        mode: config.lightweight ? 'lightweight' : 'full',
      });
      return snapshot;
    } catch (error) {
      logAiCompose('Tab Content Snapshot Failed', {
        tabId,
        title,
        url,
        error: error.message || String(error),
      });
      return {
        title,
        url,
        subtitle: getHostFromUrl(url),
        metaDescription: '',
        headings: [],
        imageAlts: [],
        importantLinks: [],
        jsonLd: [],
        extractionSource: 'tab-metadata-fallback',
        content: [
          'Tab metadata only.',
          title ? ('Title: ' + title) : '',
          url ? ('URL: ' + url) : '',
          'The page DOM could not be read. This often happens when the tab is still loading, discarded, or has not been opened in a live renderer.',
        ].filter(Boolean).join('\n'),
      };
    }
  }

  async function prefetchLightTabSnapshot(tabLike) {
    const tabId = Number(tabLike?.id || tabLike?.raw?.id);
    const url = String(tabLike?.url || tabLike?.raw?.url || tabLike?.raw?.pendingUrl || '');
    if (!tabId || !url || /^chrome:\/\//.test(url) || /^vivaldi:\/\//.test(url) || url === code) {
      return null;
    }
    const cacheKey = tabId + '::' + url;
    const cached = tabSnapshotCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < PERFORMANCE_CONFIG.tabSnapshotCacheTtlMs) {
      return cached.value;
    }
    if (pendingLightSnapshots.has(cacheKey)) {
      return pendingLightSnapshots.get(cacheKey);
    }
    const task = getTabContentSnapshot(tabLike, { lightweight: true, allowCachedLightweight: true })
      .catch(() => null)
      .finally(() => {
        pendingLightSnapshots.delete(cacheKey);
      });
    pendingLightSnapshots.set(cacheKey, task);
    return task;
  }

  async function readBlobPreview(blobLike, mimeHint) {
    const blob = blobLike instanceof Blob ? blobLike : null;
    if (!blob) {
      return '';
    }
    const mime = String(mimeHint || blob.type || '').toLowerCase();
    if (!(mime.startsWith('text/') || /json|xml|javascript|typescript|markdown|csv/.test(mime))) {
      return '';
    }
    try {
      return truncateText(await blob.text(), CONTEXT_LIMITS.filePreviewChars);
    } catch (error) {
      return '';
    }
  }

  async function getDownloadedFiles(query) {
    const items = await promisifyChrome(chrome.downloads, 'search', [{
      query: query || '',
      exists: true,
      state: 'complete',
      orderBy: ['-startTime'],
      limit: 20,
    }]);
    return items || [];
  }

  async function getClipboardFiles() {
    const clipboardFiles = [];
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (!type.startsWith('image/') && !type.startsWith('text/')) {
            continue;
          }
          const blob = await item.getType(type);
          const extension = (type.split('/')[1] || 'bin').replace('plain', 'txt');
          clipboardFiles.push({
            id: 'clipboard-' + clipboardFiles.length,
            fileName: 'Clipboard.' + extension,
            filename: 'Clipboard.' + extension,
            fileSize: blob.size,
            mime: type,
            category: 'clipboard',
            blob,
          });
        }
      }
    } catch (error) {
      return [];
    }
    return clipboardFiles;
  }

  function pickLocalFile() {
    return new Promise((resolve) => {
      const input = createElement('input', {
        type: 'file',
        style: {
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          opacity: '0',
          pointerEvents: 'none',
        },
      }, document.body);
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        input.remove();
        if (!file) {
          resolve(null);
          return;
        }
        resolve({
          id: 'picked-' + Date.now(),
          fileName: file.name,
          filename: file.name,
          fileSize: file.size,
          mime: file.type || 'application/octet-stream',
          category: 'picked-file',
          rawFile: file,
        });
      }, { once: true });
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
    });
  }

  function getHostFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
      return url || '';
    }
  }

  function formatBytes(size) {
    if (!Number.isFinite(size) || size <= 0) {
      return '';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index++;
    }
    return (value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)) + ' ' + units[index];
  }

  function formatDate(dateText) {
    if (!dateText) {
      return '';
    }
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  }

  function buildMarkup() {
    return `
      <div class="ask-in-page-shell" role="main">
        <header class="ask-top-bar">
          <button class="ask-btn-new" type="button" title="${t('newChat')}" aria-label="${t('newChat')}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <span class="ask-version-badge">${uiVersion}</span>
        </header>
        <div class="ask-messages" id="askMessages">
          <div class="ask-empty" id="askEmpty">
            <span class="ask-empty-text">${t('emptyHint')}</span>
            <span class="ask-empty-subtext">${t('emptySubhint')}</span>
          </div>
        </div>
        <nav class="ask-commands-row" id="askCommandsRow" aria-label="${t('commandShortcuts')}"></nav>
        <div class="ask-input-area">
          <div class="ask-suggestion-dropdown" id="askSuggestionDropdown" aria-hidden="true">
            <div class="ask-suggestion-search">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span class="ask-suggestion-search-text" id="askSuggestionSearchText">@</span>
            </div>
            <div class="ask-suggestion-body" id="askSuggestionBody"></div>
          </div>
          <div class="ask-input-box" id="askInputBox">
            <div class="ask-edit-banner hidden" id="askEditBanner">
              <div class="ask-edit-copy">
                <div class="ask-edit-title">${t('editing')}</div>
                <div class="ask-edit-subtitle">${t('editedOverwrite')}</div>
              </div>
              <button class="ask-edit-close" id="askEditClose" type="button" title="${t('cancelEdit')}">×</button>
            </div>
            <div class="ask-input-context" id="askInputContext">
              <div class="ask-context-track">
              <div class="ask-context-card ask-ref-chip" id="askContextCard">
                <div class="ask-ref-chip-icon" id="askContextFavicon">A</div>
                <div class="ask-ref-chip-info">
                  <div class="ask-ref-chip-title" id="askContextTitle">${t('currentPage')}</div>
                  <div class="ask-ref-chip-subtitle" id="askContextUrl"></div>
                </div>
              </div>
              <div class="ask-context-card ask-context-card-selection ask-ref-chip hidden" id="askSelectionCard">
                <div class="ask-ref-chip-icon ask-context-favicon-selection" id="askSelectionFavicon">AI</div>
                <div class="ask-ref-chip-info">
                  <div class="ask-ref-chip-title" id="askSelectionTitle"></div>
                  <div class="ask-ref-chip-subtitle">${t('selectedText')}</div>
                </div>
              </div>
              <div class="ask-ref-row-inline" id="askRefRowInline"></div>
              </div>
            </div>
            <div class="ask-input-main" id="askInputMain">
              <div class="ask-inline-ref-row" id="askInlineRefRow"></div>
              <div class="ask-input-field" contenteditable="true" id="askInputField" data-placeholder="${t('inputPlaceholder')}" spellcheck="false" role="textbox" aria-label="${t('inputMessage')}"></div>
            </div>
            <div class="ask-send-validation hidden" id="askSendValidation" role="status" aria-live="polite"></div>
            <div class="ask-input-toolbar">
              <button class="ask-btn-tool" type="button" title="${t('attachments')}" aria-label="${t('addAttachments')}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button class="ask-btn-send" id="askBtnSend" type="button" title="${t('send')}" aria-label="${t('sendMessage')}">
                <span class="ask-btn-send-icon ask-btn-send-icon-send">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                </span>
                <span class="ask-btn-send-icon ask-btn-send-icon-stop">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="6" width="12" height="12" rx="2.5" fill="#000000"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
          <input class="ask-hidden-file-input" id="askHiddenFileInput" type="file" tabindex="-1" aria-hidden="true">
        </div>
      </div>
    `;
  }

  function injectStyles() {
    addStyle([
      '#panels-container #panels .webpanel-stack [data-ask-in-page] { display:flex !important; flex-direction:column !important; min-height:0 !important; height:100% !important; }',
      '#panels-container #panels .webpanel-stack [data-ask-in-page] header.webpanel-header { display:none !important; }',
      '#panels-container #panels .webpanel-stack [data-ask-in-page] .webpanel-content { display:none !important; }',
      '#panels-container #panels .webpanel-stack [data-ask-in-page] .ask-in-page-content { display:flex; flex:1 1 auto; min-height:0; width:100%; overflow:hidden; }',
      'button[data-name="' + webPanelId + '"] { position:relative; display:flex; align-items:center; justify-content:center; padding:0 !important; }',
      'button[data-name="' + webPanelId + '"] > img, button[data-name="' + webPanelId + '"] .button-badge, button[data-name="' + webPanelId + '"] .ToolbarButton-Button-SVG { opacity:0 !important; }',
      'button[data-name="' + webPanelId + '"]:before { position:absolute; left:50%; top:50%; width:18px; height:18px; margin:0; content:""; background-color:var(--colorFg); transform:translate(-50%,-50%); -webkit-mask-image:url(' + JSON.stringify(panelIconMask) + '); -webkit-mask-repeat:no-repeat; -webkit-mask-position:center; -webkit-mask-size:contain; mask-image:url(' + JSON.stringify(panelIconMask) + '); mask-repeat:no-repeat; mask-position:center; mask-size:contain; }',
      '.ask-in-page-content { --aip-bg:var(--colorBg); --aip-surface:color-mix(in srgb, var(--colorBgLight) 82%, transparent); --aip-surface-strong:color-mix(in srgb, var(--colorBgLighter) 88%, transparent); --aip-elevated:color-mix(in srgb, var(--colorBgLightIntense) 92%, var(--colorAccentBgAlpha)); --aip-border:var(--colorBorderSubtle); --aip-border-hover:var(--colorBorderIntense); --aip-accent:var(--colorHighlightBg); --aip-accent-dim:var(--colorHighlightBgAlpha); --aip-text-primary:var(--colorFg); --aip-text-secondary:var(--colorFgFaded); --aip-text-muted:var(--colorFgFadedMost); --aip-chip-bg:color-mix(in srgb, var(--colorAccentBgAlphaHeavy) 68%, var(--colorBgLight)); --aip-r-xs:var(--radiusRounded); --aip-r-sm:var(--radiusHalf); --aip-r-md:var(--radiusCap); --aip-r-lg:var(--radius); --aip-r-pill:var(--radiusRound); --aip-r-full:50%; --radius:var(--aip-r-sm); --aip-shadow-base:0 8px 18px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.02); --aip-shadow-mid:0 14px 28px rgba(0,0,0,0.17), inset 0 1px 0 rgba(255,255,255,0.03); --aip-shadow-strong:0 18px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04); width:100%; flex:1 1 auto; min-height:0; background:linear-gradient(180deg, color-mix(in srgb, var(--colorBgLight) 90%, transparent) 0%, var(--aip-bg) 18%, var(--colorBgDark) 100%); color:var(--aip-text-primary); font-family:var(--sansSerifFont), sans-serif; -webkit-font-smoothing:antialiased; }',
      '.ask-in-page-content *, .ask-in-page-content *::before, .ask-in-page-content *::after { box-sizing:border-box; }',
      '.ask-in-page-content *:not(.ask-messages) { scrollbar-width:none; }',
      '.ask-in-page-content *:not(.ask-messages)::-webkit-scrollbar { width:0 !important; height:0 !important; display:none !important; }',
      '.ask-in-page-shell { width:100%; height:100%; display:flex; flex:1; flex-direction:column; min-height:0; background:transparent; position:relative; }',
      '.ask-in-page-shell::before { content:""; position:absolute; inset:0 0 auto; height:92px; background:linear-gradient(180deg, color-mix(in srgb, var(--colorAccentBgAlpha) 42%, transparent) 0%, transparent 100%); opacity:.75; pointer-events:none; }',
      '.ask-top-bar { display:flex; align-items:center; padding:10px 12px 6px; flex-shrink:0; position:relative; z-index:1; }',
      '.ask-version-badge { margin-left:auto; padding:2px 8px; border:1px solid var(--aip-border); border-radius:999px; color:var(--aip-text-muted); background:color-mix(in srgb, var(--colorBgAlphaHeavy) 86%, transparent); font-size:10px; line-height:1; letter-spacing:.08em; text-transform:uppercase; }',
      '.ask-btn-new, .ask-btn-tool { width:30px; height:30px; border:1px solid transparent; background:transparent; color:var(--aip-text-secondary); cursor:pointer; border-radius:var(--aip-r-md); display:flex; align-items:center; justify-content:center; transition:color .15s, background .15s, border-color .15s, transform .12s; }',
      '.ask-btn-new:hover, .ask-btn-tool:hover { color:var(--aip-text-primary); background:color-mix(in srgb, var(--colorBgLight) 80%, transparent); border-color:var(--aip-border); }',
      '.ask-btn-new:active, .ask-btn-tool:active { transform:scale(.96); }',
      '.ask-btn-new svg, .ask-btn-tool svg { width:18px; height:18px; }',
      '.ask-messages { display:flex !important; flex-direction:column !important; flex:1 1 auto !important; min-height:0 !important; overflow-y:auto !important; overflow-x:hidden !important; overflow-anchor:auto; padding:10px 12px 156px; position:relative; z-index:1; }',
      '.ask-messages::-webkit-scrollbar { width:var(--scrollbarWidth); }',
      '.ask-messages::-webkit-scrollbar-thumb { background:color-mix(in srgb, var(--colorFgAlpha) 70%, transparent); border:4px solid transparent; border-radius:999px; background-clip:padding-box; }',
      '.ask-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:24px 0; text-align:center; }',
      '.ask-empty-text { max-width:220px; color:var(--aip-text-secondary); font-size:13px; font-weight:600; line-height:1.45; }',
      '.ask-empty-subtext { max-width:240px; color:var(--aip-text-muted); font-size:12px; line-height:1.45; }',
      '.ask-commands-row { display:flex; gap:6px; padding:2px 12px 10px; flex-shrink:0; overflow:hidden; max-height:40px; opacity:1; transition:max-height .24s, opacity .18s, padding-bottom .24s; position:relative; z-index:1; }',
      '.ask-commands-row.hidden { max-height:0; opacity:0; padding-bottom:0; pointer-events:none; }',
      '.ask-commands-row.commands-hidden .ask-btn-cmd[data-cmd] { display:none; }',
      '.ask-btn-cmd { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; background:var(--aip-chip-bg); color:var(--aip-text-secondary); border:1px solid var(--aip-border); border-radius:var(--aip-r-pill) !important; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; transition:color .15s, background .15s, border-color .15s, transform .1s, box-shadow .15s; }',
      '.ask-btn-cmd:hover { color:var(--aip-text-primary); background:color-mix(in srgb, var(--colorBgLighter) 82%, var(--colorAccentBgAlphaHeavy)); border-color:var(--aip-border-hover); box-shadow:inset 0 1px 0 rgba(255,255,255,0.03); }',
      '.ask-btn-cmd:active { transform:scale(.96); }',
      '.ask-btn-cmd svg { width:13px; height:13px; flex-shrink:0; }',
      '.ask-btn-current-page-icon { width:13px; height:13px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; background:linear-gradient(180deg, var(--colorAccentBgFadedMore) 0%, var(--colorAccentBg) 100%); color:var(--colorAccentFg); font-size:9px; font-weight:800; line-height:1; }',
      '.ask-input-area { display:block !important; flex:0 0 auto !important; flex-shrink:0 !important; margin-top:auto; padding:0 12px 14px; position:relative; z-index:20; overflow:visible !important; }',
      '.ask-input-box { background:linear-gradient(180deg, color-mix(in srgb, var(--colorBgLight) 94%, transparent) 0%, color-mix(in srgb, var(--colorBgLightIntense) 96%, transparent) 100%); border:1px solid var(--aip-border); border-radius:calc(var(--aip-r-lg) + 2px); display:flex; flex-direction:column; overflow:hidden; box-shadow:var(--aip-shadow-mid); backdrop-filter:var(--backgroundBlur); transition:border-color .2s, box-shadow .2s, background .2s; }',
      '.ask-input-box.focused { border-color:var(--colorHighlightBg); box-shadow:0 0 0 1px var(--colorHighlightBgAlpha), var(--aip-shadow-mid); }',
      '.ask-edit-banner { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:7px 10px; margin:8px 8px 0; border-radius:calc(var(--aip-r-md) + 2px); background:color-mix(in srgb, var(--colorBgLighter) 84%, transparent); border:1px solid color-mix(in srgb, var(--colorHighlightBgAlpha) 32%, var(--aip-border)); box-shadow:var(--aip-shadow-base); }',
      '.ask-edit-banner.hidden { display:none; }',
      '.ask-edit-copy { min-width:0; }',
      '.ask-edit-title { color:var(--aip-text-primary); font-size:12px; font-weight:700; line-height:1.15; }',
      '.ask-edit-subtitle { color:var(--aip-text-secondary); font-size:11px; line-height:1.2; margin-top:2px; }',
      '.ask-edit-close { width:22px; height:22px; border:none; background:transparent; color:var(--aip-text-secondary); border-radius:999px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; line-height:1; flex-shrink:0; }',
      '.ask-edit-close:hover { color:var(--aip-text-primary); background:rgba(255,255,255,0.08); }',
      '.ask-input-context { padding:8px 8px 0 12px; overflow:hidden; }',
      '.ask-input-context.hidden { display:none; }',
      '.ask-context-track { display:flex; align-items:center; gap:8px; width:100%; padding:4px 4px 0 0; overflow:hidden; white-space:nowrap; }',
      '.ask-context-card, .ask-ref-chip { position:relative; display:flex; align-items:center; gap:10px; min-width:180px; width:180px; max-width:180px; height:52px; padding:0 18px 0 12px; border-radius:calc(var(--aip-r-md) + 2px); background:color-mix(in srgb, var(--colorBgLighter) 84%, transparent); border:1px solid var(--aip-border); box-shadow:var(--aip-shadow-base); overflow:visible; flex:0 0 180px; }',
      '.ask-context-card.hidden { display:none; }',
      '.ask-context-card { cursor:pointer; }',
      '.ask-context-card:hover, .ask-ref-chip:hover, .ask-cmd-chip:hover, .ask-composer-token[data-token-role="capability"]:hover { border-style:dashed; border-color:var(--colorHighlightBg); opacity:.86; }',
      '.ask-context-card-selection { background:color-mix(in srgb, var(--colorAccentBgAlpha) 55%, var(--colorBgLight)); }',
      '.ask-ref-chip-icon { width:32px; height:32px; border-radius:var(--aip-r-md); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; font-weight:700; color:var(--colorAccentFg); background:linear-gradient(180deg, var(--colorAccentBgFadedMore) 0%, var(--colorAccentBg) 100%); }',
      '.ask-context-favicon-selection { background:color-mix(in srgb, var(--colorBgLighter) 88%, transparent); color:var(--aip-text-secondary); font-size:13px; letter-spacing:.02em; }',
      '.ask-ref-chip-info { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; gap:2px; }',
      '.ask-ref-chip-title { color:var(--aip-text-primary); font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.25; }',
      '.ask-ref-chip-subtitle { color:var(--aip-text-secondary); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }',
      '.ask-context-close, .ask-ref-chip .ask-chip-close { position:absolute; top:0; right:0; z-index:3; width:16px; height:16px; margin-top:0; border:none; background:rgba(91,97,106,0.95); color:#E2E6EA; cursor:pointer; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:12px; line-height:1; flex-shrink:0; opacity:0; pointer-events:none; box-shadow:0 2px 8px rgba(0,0,0,0.28); transform:translate(35%,-35%); transition:opacity .15s, color .15s, background .15s, transform .12s; }',
      '.ask-context-card:hover .ask-context-close, .ask-ref-chip:hover .ask-chip-close { opacity:1; pointer-events:auto; }',
      '.ask-context-close:hover, .ask-ref-chip .ask-chip-close:hover { color:var(--aip-text-primary); background:color-mix(in srgb, var(--colorBgLighter) 78%, transparent); transform:translate(35%,-35%) scale(1.04); }',
      '.ask-input-main { display:flex; align-items:flex-start; gap:8px; padding:12px 14px 0; min-height:24px; flex-wrap:wrap; }',
      '.ask-inline-ref-row { display:none; }',
      '.ask-composer-token { display:inline-flex; align-items:center; gap:6px; min-width:0; max-width:180px; margin:0 2px; vertical-align:baseline; color:var(--aip-text-secondary); font-size:13px; line-height:1.35; border-radius:8px; user-select:none; }',
      '.ask-composer-token[data-token-kind="context"], .ask-composer-token[data-token-kind="tab"] { max-width:none; width:auto; gap:0; margin:0 4px 0 2px; }',
      '.ask-composer-token[data-token-kind="context"] .ask-composer-token-label, .ask-composer-token[data-token-kind="tab"] .ask-composer-token-label { display:none; }',
      '.ask-composer-token.focused { background:color-mix(in srgb, var(--colorBgLighter) 84%, transparent); box-shadow:0 0 0 1px var(--colorHighlightBgAlpha); padding:2px 6px; }',
      '.ask-composer-token[data-token-role="capability"] { position:relative; display:inline-flex; align-items:center; gap:6px; max-width:none; font-size:12px; font-weight:600; user-select:none; animation:askChipPop .22s cubic-bezier(.22,1,.36,1); overflow:hidden; padding:6px 12px; background:color-mix(in srgb, var(--colorHighlightBgAlpha) 72%, transparent); border:1px solid color-mix(in srgb, var(--colorHighlightBgAlpha) 92%, transparent); border-radius:999px; color:var(--aip-text-primary); cursor:pointer; line-height:1.35; }',
      '.ask-composer-token[data-token-role="capability"].focused { box-shadow:0 0 0 1px var(--aip-accent), 0 6px 16px color-mix(in srgb, var(--colorHighlightBgAlpha) 40%, transparent); padding:6px 12px; }',
      '.ask-composer-token-icon { width:14px; height:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--aip-accent); font-size:12px; line-height:1; }',
      '.ask-composer-token-label { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-inline-ref-token { display:inline-flex; align-items:center; gap:6px; min-width:0; max-width:180px; color:var(--aip-text-secondary); font-size:13px; line-height:1.35; padding:2px 0; border-radius:8px; }',
      '.ask-inline-ref-token.focused { background:color-mix(in srgb, var(--colorBgLighter) 84%, transparent); box-shadow:0 0 0 1px var(--colorHighlightBgAlpha); padding:2px 6px; }',
      '.ask-inline-ref-token-icon { width:14px; height:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--aip-accent); font-size:12px; line-height:1; }',
      '.ask-inline-ref-token-label { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-input-field { flex:1; min-width:0; background:transparent; border:none; outline:none; color:var(--aip-text-primary); font-size:14px; line-height:1.5; caret-color:var(--aip-accent); word-break:break-word; max-height:100px; overflow-y:auto; position:relative; }',
      '.ask-input-field.disabled { opacity:.55; pointer-events:none; }',
      '.ask-input-field:empty::before { content:attr(data-placeholder); color:var(--aip-text-muted); pointer-events:none; }',
      '.ask-send-validation { margin:2px 14px 0; color:var(--colorErrorBg); font-size:12px; line-height:1.35; font-weight:600; }',
      '.ask-send-validation.hidden { display:none; }',
      '.ask-cmd-chip { position:relative; display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; user-select:none; animation:askChipPop .22s cubic-bezier(.22,1,.36,1); overflow:hidden; padding:6px 12px; background:color-mix(in srgb, var(--colorHighlightBgAlpha) 72%, transparent); border:1px solid color-mix(in srgb, var(--colorHighlightBgAlpha) 92%, transparent); border-radius:999px; color:var(--aip-text-primary); cursor:pointer; }',
      '.ask-ref-chip { position:relative; display:flex; align-items:center; font-size:13px; font-weight:500; user-select:none; overflow:visible; }',
      '.ask-ref-chip.is-entering { animation:askChipPop .22s cubic-bezier(.22,1,.36,1); }',
      '.ask-cmd-chip.is-removing, .ask-ref-chip.is-removing, .ask-composer-token.is-removing { animation:askChipRemove .16s ease forwards; pointer-events:none; }',
      '.ask-cmd-chip.focused { box-shadow:0 0 0 1px var(--aip-accent), 0 6px 16px color-mix(in srgb, var(--colorHighlightBgAlpha) 40%, transparent); }',
      '.ask-ref-row-inline { display:flex; align-items:center; gap:8px; min-width:0; padding:4px 4px 0 0; overflow:hidden; flex:0 1 auto; }',
      '.ask-cmd-chip::after, .ask-ref-chip::after { content:""; position:absolute; top:0; right:0; width:28px; height:100%; opacity:0; transition:opacity .15s; pointer-events:none; }',
      '.ask-cmd-chip::after { background:linear-gradient(to right, rgba(91,130,180,0), rgba(91,130,180,0.12) 42%, rgba(91,130,180,0.22) 100%); }',
      '.ask-ref-chip::after, .ask-context-card::after { background:linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.04) 42%, rgba(255,255,255,0.08) 100%); }',
      '.ask-chip-close { position:absolute; top:50%; right:4px; z-index:2; width:18px; height:18px; margin-top:-9px; border-radius:var(--aip-r-xs); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--aip-text-muted); font-size:15px; line-height:1; opacity:0; pointer-events:auto; transition:opacity .15s, color .12s, background .12s; }',
      '.ask-cmd-chip:hover::after, .ask-ref-chip:hover::after { opacity:1; }',
      '.ask-cmd-chip:hover::after, .ask-ref-chip:hover::after, .ask-context-card:hover::after { opacity:0; }',
      '.ask-cmd-chip:hover .ask-chip-close { opacity:1; }',
      '.ask-chip-close:hover { color:var(--aip-text-primary); background:color-mix(in srgb, var(--colorBgLighter) 78%, transparent); }',
      '.ask-input-toolbar { display:flex; align-items:center; justify-content:space-between; padding:8px 10px 10px; }',
      '.ask-btn-send { width:32px; height:32px; border-radius:var(--aip-r-pill); border:1px solid color-mix(in srgb, var(--colorHighlightBgDark) 70%, transparent); background:linear-gradient(180deg, var(--colorHighlightBg) 0%, var(--colorHighlightBgDark) 100%); cursor:pointer; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; transition:filter .15s, transform .1s, box-shadow .15s; box-shadow:inset 0 1px 0 rgba(255,255,255,0.18); }',
      '.ask-btn-send:hover { filter:brightness(1.06); box-shadow:inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 16px color-mix(in srgb, var(--colorHighlightBgAlpha) 70%, transparent); }',
      '.ask-btn-send:active { transform:scale(.9); }',
      '.ask-btn-send svg { width:14px; height:14px; }',
      '.ask-btn-send-icon { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; transition:opacity .16s ease, transform .18s cubic-bezier(.22,1,.36,1); }',
      '.ask-btn-send-icon-stop { opacity:0; transform:scale(.78) rotate(-18deg); }',
      '.ask-btn-send.is-stop .ask-btn-send-icon-send { opacity:0; transform:scale(.78) rotate(18deg); }',
      '.ask-btn-send.is-stop .ask-btn-send-icon-stop { opacity:1; transform:scale(1) rotate(0); }',
      '.ask-hidden-file-input { position:fixed; left:-9999px; top:-9999px; width:1px; height:1px; opacity:0; pointer-events:none; }',
      '.ask-suggestion-dropdown { position:absolute; left:12px; right:12px; bottom:calc(100% + 8px); display:none; flex-direction:column; background:color-mix(in srgb, var(--colorBgAlphaBlur) 90%, transparent); color:var(--aip-text-primary); border:1px solid var(--aip-border-hover); border-radius:calc(var(--aip-r-lg) + 2px); box-shadow:var(--aip-shadow-strong); backdrop-filter:var(--backgroundBlur); overflow:hidden; z-index:9999; opacity:0; transform:translateY(8px); pointer-events:none; transition:opacity .18s, transform .18s; }',
      '.ask-suggestion-dropdown.visible { opacity:1; transform:translateY(0); pointer-events:auto; }',
      '.ask-suggestion-search { display:flex; align-items:center; gap:8px; padding:12px 14px; border-bottom:1px solid var(--aip-border); color:var(--aip-text-secondary); font-size:13px; }',
      '.ask-suggestion-search svg { width:14px; height:14px; flex-shrink:0; }',
      '.ask-suggestion-search-text { color:var(--aip-text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
      '.ask-suggestion-body { max-height:320px; min-height:48px; overflow-y:auto; padding:8px 0; }',
      '.ask-suggestion-section { display:block !important; flex:none !important; position:static !important; overflow:visible !important; }',
      '.ask-suggestion-section + .ask-suggestion-section { margin-top:4px; border-top:1px solid color-mix(in srgb, var(--colorFgAlpha) 22%, transparent); padding-top:4px; }',
      '.ask-suggestion-section-title { padding:6px 14px; color:var(--aip-text-secondary); font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }',
      '.ask-suggestion-item { width:100%; border:none; background:transparent; color:inherit; display:flex; align-items:center; gap:10px; padding:10px 14px 10px 18px; cursor:pointer; text-align:left; position:relative; transition:background .12s, transform .12s; }',
      '.ask-suggestion-item::before { content:""; position:absolute; left:8px; top:8px; bottom:8px; width:3px; border-radius:999px; background:var(--aip-accent); opacity:0; transform:scaleY(.7); transition:opacity .14s ease, transform .14s ease; }',
      '.ask-suggestion-item:hover, .ask-suggestion-item.active { background:color-mix(in srgb, var(--colorBgLighter) 82%, var(--colorAccentBgAlphaHeavy)); }',
      '.ask-suggestion-item.active { box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--colorHighlightBgAlpha) 90%, transparent); }',
      '.ask-suggestion-item.active::before { opacity:1; transform:scaleY(1); }',
      '.ask-suggestion-item-action { border-top:1px solid color-mix(in srgb, var(--colorFgAlpha) 22%, transparent); }',
      '.ask-suggestion-icon { width:28px; height:28px; border-radius:var(--aip-r-md); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; white-space:nowrap; background:color-mix(in srgb, var(--colorBgLighter) 88%, transparent); color:var(--aip-text-primary); font-size:12px; font-weight:700; transition:transform .14s ease, box-shadow .14s ease; }',
      '.ask-suggestion-icon span { white-space:nowrap; }',
      '.ask-suggestion-item.active .ask-suggestion-icon { transform:translateX(1px) scale(1.04); box-shadow:0 6px 16px color-mix(in srgb, var(--colorHighlightBgAlpha) 55%, transparent); }',
      '.ask-suggestion-icon img { width:100%; height:100%; object-fit:cover; }',
      '.ask-suggestion-text { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }',
      '.ask-suggestion-title { display:block; color:var(--aip-text-primary); font-size:13px; line-height:1.35; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-suggestion-current-badge { display:inline-flex; align-items:center; margin-left:6px; padding:1px 6px; border-radius:999px; border:1px solid color-mix(in srgb, var(--colorHighlightBg) 62%, transparent); color:var(--colorHighlightBg); font-size:10px; font-weight:700; line-height:1.2; vertical-align:1px; }',
      '.ask-suggestion-subtitle { display:block; color:var(--aip-text-secondary); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-suggestion-meta { color:var(--aip-text-muted); font-size:11px; flex-shrink:0; }',
      '.ask-suggestion-divider { height:1px; margin:8px 14px; background:color-mix(in srgb, var(--colorFgAlpha) 28%, transparent); }',
      '.ask-suggestion-empty { padding:18px 14px; color:var(--aip-text-secondary); font-size:12px; }',
      '.ask-messages, .ask-messages * { -webkit-user-select:text !important; user-select:text !important; }',
      '.ask-msg { max-width:92%; font-size:13px; line-height:1.55; margin-bottom:12px; animation:askMsgIn .3s cubic-bezier(.22,1,.36,1); cursor:text; }',
      '.ask-send-flight-ghost { position:fixed; z-index:10000; pointer-events:none; margin:0; transform-origin:right center; box-shadow:0 16px 36px rgba(0,0,0,.22); overflow:hidden; will-change:transform, opacity, left, top, width, background, border-color; }',
      '.ask-send-flight-ghost .ask-msg-text, .ask-send-flight-ghost .ask-msg-inline-ref, .ask-send-flight-ghost .ask-msg-cmd-tag { transition:opacity .18s ease, transform .22s cubic-bezier(.22,1,.36,1); }',
      '.ask-msg.is-send-arriving { visibility:hidden; }',
      '.ask-turn { display:flex; flex-direction:column; align-items:flex-end; margin-bottom:16px; cursor:text; }',
      '.ask-turn-ai-slot { width:100%; display:flex; flex-direction:column; justify-content:flex-start; cursor:text; overflow-anchor:none; }',
      '.ask-turn-meta { display:flex; align-items:center; justify-content:flex-end; gap:10px; margin:4px 6px 0; min-height:18px; }',
      '.ask-turn-time { color:var(--aip-text-muted); font-size:12px; line-height:1; opacity:0; transition:opacity .14s ease; }',
      '.ask-turn-actions, .ask-turn-ai-actions { display:inline-flex; align-items:center; gap:6px; padding:4px; border-radius:999px; background:color-mix(in srgb, var(--colorBgAlphaBlur) 88%, transparent); border:1px solid color-mix(in srgb, var(--colorFgAlpha) 16%, transparent); box-shadow:var(--aip-shadow-base); opacity:0; transition:opacity .14s ease; }',
      '.ask-turn:has(.ask-msg-user:hover, .ask-turn-meta:hover) .ask-turn-actions { opacity:1; }',
      '.ask-turn:has(.ask-msg-user:hover, .ask-turn-meta:hover) .ask-turn-time { opacity:1; }',
      '.ask-turn.is-ai-complete:has(.ask-msg-ai:hover, .ask-turn-ai-meta:hover) .ask-turn-ai-actions { opacity:1; }',
      '.ask-turn:not(.is-ai-complete) .ask-turn-ai-actions { opacity:0 !important; pointer-events:none; }',
      '.ask-turn-action { width:24px; height:24px; border:none; background:transparent; color:var(--aip-text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; border-radius:999px; position:relative; transition:background .12s ease, color .12s ease, transform .12s ease; }',
      '.ask-turn-action-icon { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }',
      '.ask-turn-action:hover, .ask-turn-action:focus-visible { color:var(--aip-text-primary); background:color-mix(in srgb, var(--colorBgLighter) 88%, transparent); outline:none; }',
      '.ask-turn-action:active { transform:scale(.94); }',
      '.ask-turn-action svg { width:14px; height:14px; stroke:currentColor; transition:opacity .14s ease, transform .14s ease; }',
      '.ask-turn-action .ask-turn-action-icon-success, .ask-turn-action .ask-turn-action-icon-fail { position:absolute; opacity:0; transform:scale(.7); }',
      '.ask-turn-action.is-success { color:var(--aip-accent); }',
      '.ask-turn-action.is-success .ask-turn-action-icon-main { opacity:0; transform:scale(.7); }',
      '.ask-turn-action.is-success .ask-turn-action-icon-success { opacity:1; transform:scale(1); }',
      '.ask-turn-action.is-fail { color:var(--colorErrorBg); }',
      '.ask-turn-action.is-fail .ask-turn-action-icon-main { opacity:0; transform:scale(.7); }',
      '.ask-turn-action.is-fail .ask-turn-action-icon-fail { opacity:1; transform:scale(1); }',
      '.ask-msg-user { align-self:flex-end; background:linear-gradient(180deg, color-mix(in srgb, var(--colorAccentBgFadedMore) 72%, var(--colorBgLight)) 0%, color-mix(in srgb, var(--colorAccentBg) 88%, var(--colorBgLight)) 100%); color:var(--colorAccentFg); border:1px solid color-mix(in srgb, var(--colorAccentBorder) 80%, transparent); border-radius:18px 18px 6px 18px; padding:10px 14px 12px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05); cursor:text; }',
      '.ask-msg-user.ask-msg-user-command-only { background:transparent; border:none; box-shadow:none; padding:0; }',
      '.ask-msg-ref-group { display:flex; justify-content:flex-end; margin:0 0 8px; }',
      '.ask-msg-ref-group, .ask-msg-ref-group * { -webkit-user-select:none !important; user-select:none !important; }',
      '.ask-msg-ref-stack { position:relative; display:flex; justify-content:flex-end; align-items:flex-end; width:min(100%, 520px); cursor:pointer; user-select:none; }',
      '.ask-msg-ref-stack:focus-visible { outline:none; box-shadow:0 0 0 2px var(--colorHighlightBgAlpha); border-radius:16px; }',
      '.ask-msg-ref-stack { --aip-ref-card-gap:60px; position:relative; }',
      '.ask-msg-ref-stack[aria-expanded="false"] { min-height:92px; }',
      '.ask-msg-ref-stack[aria-expanded="true"] { min-height:calc(52px + (var(--aip-ref-card-gap) * (var(--aip-ref-expanded-count, 1) - 1))); }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card, .ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-card { position:absolute; right:0; width:180px; pointer-events:auto; transition:transform .24s cubic-bezier(.22,1,.36,1), box-shadow .18s ease, filter .18s ease, opacity .16s ease; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card { bottom:0; transform-origin:right bottom; }',
      '.ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-card { top:0; transform-origin:right top; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-10px, -34px) scale(.84) rotate(12deg); z-index:1; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card[data-stack-index="1"] { transform:translate(-5px, -17px) scale(.92) rotate(6deg); z-index:2; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card[data-stack-index="2"] { transform:translate(0, 0) scale(1) rotate(0deg); z-index:3; }',
      '.ask-msg-ref-stack[aria-expanded="false"] .ask-msg-ref-card[data-stack-index]:nth-of-type(n+4) { transform:translate(0, 0) scale(1) rotate(0deg); opacity:0; pointer-events:none; z-index:0; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="1"] { min-height:52px; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="1"] .ask-msg-ref-card[data-stack-index="0"] { transform:none; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="1"]:hover .ask-msg-ref-card[data-stack-index="0"] { transform:none; filter:none; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"] { min-height:82px; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"] .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-4px, -24px) scale(.9) rotate(5deg); z-index:1; }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"] .ask-msg-ref-card[data-stack-index="1"] { transform:translate(0, 0) scale(1) rotate(0deg); z-index:2; }',
      '.ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-card { transform:translateY(calc(var(--aip-ref-card-gap) * var(--aip-stack-order, 0))) scale(1) rotate(0deg); opacity:1; pointer-events:auto; max-width:none; }',
      '.ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-card[data-stack-index] { z-index:1; }',
      '.ask-msg-ref-stack:hover .ask-msg-ref-card { box-shadow:inset 0 1px 0 rgba(255,255,255,0.03), 0 10px 26px rgba(0,0,0,0.22); }',
      '.ask-msg-ref-stack[data-hovered-index="0"][aria-expanded="false"] .ask-msg-ref-card[data-stack-index="0"], .ask-msg-ref-stack[data-hovered-index="1"][aria-expanded="false"] .ask-msg-ref-card[data-stack-index="1"], .ask-msg-ref-stack[data-hovered-index="2"][aria-expanded="false"] .ask-msg-ref-card[data-stack-index="2"] { filter:brightness(1.05); }',
      '.ask-msg-ref-stack[data-hovered-index="0"][aria-expanded="false"] .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-4px, -38px) scale(.855) rotate(15deg); }',
      '.ask-msg-ref-stack[data-hovered-index="1"][aria-expanded="false"] .ask-msg-ref-card[data-stack-index="1"] { transform:translate(0, -20px) scale(.935) rotate(9deg); }',
      '.ask-msg-ref-stack[data-hovered-index="2"][aria-expanded="false"] .ask-msg-ref-card[data-stack-index="2"] { transform:translate(0, 0) scale(1) rotate(0deg); }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"][data-hovered-index="0"] .ask-msg-ref-card[data-stack-index="0"] { transform:translate(-2px, -27px) scale(.91) rotate(9deg); }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="2"][data-hovered-index="1"] .ask-msg-ref-card[data-stack-index="1"] { transform:translate(0, 0) scale(1) rotate(0deg); }',
      '.ask-msg-ref-stack[aria-expanded="false"][data-card-count="1"][data-hovered-index="0"] .ask-msg-ref-card[data-stack-index="0"] { transform:none; filter:none; }',
      '.ask-msg-ref-card { position:relative; display:flex; align-items:center; gap:10px; min-width:0; width:180px; max-width:180px; height:52px; padding:0 12px; border-radius:calc(var(--aip-r-md) + 2px); background:linear-gradient(180deg, color-mix(in srgb, var(--colorBgLighter) 86%, transparent) 0%, color-mix(in srgb, var(--colorBgLight) 94%, transparent) 100%); border:1px solid var(--aip-border); box-shadow:var(--aip-shadow-base); overflow:hidden; opacity:1; }',
      '.ask-msg-ref-card-icon { width:32px; height:32px; border-radius:var(--aip-r-md); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; font-weight:700; color:var(--colorAccentFg); background:linear-gradient(180deg, var(--colorAccentBgFadedMore) 0%, var(--colorAccentBg) 100%); }',
      '.ask-msg-ref-card-info { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; gap:2px; }',
      '.ask-msg-ref-card-title { color:var(--aip-text-primary); font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.25; }',
      '.ask-msg-ref-card-subtitle { color:var(--aip-text-secondary); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }',
      '.ask-msg-ref-more { position:absolute; right:-2px; bottom:-6px; z-index:4; min-width:26px; height:26px; padding:0 8px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, var(--colorBgAlphaBlur) 92%, transparent); border:1px solid var(--aip-border); color:var(--aip-text-primary); font-size:11px; font-weight:700; box-shadow:0 8px 20px rgba(0,0,0,0.28); }',
      '.ask-msg-ref-stack[aria-expanded="true"] .ask-msg-ref-more { display:none; }',
      '.ask-msg-cmd-tag { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:600; background:color-mix(in srgb, var(--colorHighlightBgAlpha) 72%, transparent); border:1px solid color-mix(in srgb, var(--colorHighlightBgAlpha) 92%, transparent); color:var(--aip-text-primary); }',
      '.ask-msg-inline-refs { display:inline-flex; align-items:center; gap:8px; min-width:0; flex-wrap:wrap; }',
      '.ask-msg-inline-ref { display:inline-flex; align-items:center; gap:6px; min-width:0; max-width:180px; color:rgba(255,255,255,0.72); font-size:13px; line-height:1.35; cursor:text; }',
      '.ask-msg-inline-ref-icon { width:14px; height:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--aip-accent); font-size:12px; line-height:1; }',
      '.ask-msg-inline-ref-label { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.ask-msg-user-body { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }',
      '.ask-msg-user-body.ask-msg-user-body-command-only { gap:0; }',
      '.ask-msg-text { color:var(--aip-text-primary); font-size:13px; cursor:text; white-space:pre-wrap; }',
      '.ask-msg-ai { align-self:stretch; width:100%; max-width:none; color:var(--aip-text-primary); cursor:text; }',
      '.ask-msg-ai-processing { display:flex; flex-direction:column; gap:10px; margin:6px 0 10px; }',
      '.ask-msg-ai-processing.hidden { display:none; }',
      '.ask-msg-ai-thinking { color:var(--aip-text-secondary); font-weight:600; background:linear-gradient(90deg, currentColor 0%, currentColor 42%, rgba(0,0,0,0.08) 46.5%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.08) 53.5%, currentColor 58%, currentColor 100%); background-size:185% 100%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:askThinkingShimmer 2s infinite linear; }',
      '.ask-msg-ai-reading { display:flex; align-items:center; gap:8px; color:var(--aip-text-secondary); font-weight:600; }',
      '.ask-msg-ai-reading-list { display:flex; flex-direction:column; gap:8px; margin:0 0 12px; }',
      '.ask-msg-ai-processing, .ask-msg-ai-processing * { -webkit-user-select:none !important; user-select:none !important; }',
      '.ask-msg-ai-reading-pill { display:flex; align-items:center; gap:8px; max-width:240px; padding:8px 12px; border-radius:999px; background:color-mix(in srgb, var(--colorBgLighter) 85%, transparent); border:1px solid var(--aip-border); color:var(--aip-text-secondary); position:relative; overflow:hidden; box-shadow:var(--aip-shadow-base); }',
      '.ask-msg-ai-reading-pill::after { content:""; position:absolute; inset:0; background:linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 35%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.03) 65%, rgba(255,255,255,0) 100%); transform:translateX(-130%); opacity:0; transition:opacity .16s ease; }',
      '.ask-msg-ai-reading-pill.is-active { border-color:color-mix(in srgb, var(--colorHighlightBgAlpha) 96%, transparent); color:var(--aip-text-primary); }',
      '.ask-msg-ai-reading-pill.is-active::after { opacity:1; animation:askReadingSweep .92s cubic-bezier(.22,1,.36,1); }',
      '.ask-msg-ai-reading-pill-icon { color:var(--aip-accent); font-size:14px; line-height:1; flex-shrink:0; }',
      '.ask-msg-ai-reading-pill-text { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:12px; }',
      '.ask-msg-ai-thought-wrap { display:none; margin:0 0 10px; }',
      '.ask-msg-ai-thought-wrap.has-content { display:block; }',
      '.ask-msg-ai-thought { display:inline-flex; align-items:center; gap:8px; padding:2px 6px; border:none; border-radius:8px; background:transparent; color:rgba(255,255,255,0.62); font-weight:600; margin:0; cursor:default; transition:background .14s ease, color .14s ease; }',
      '.ask-msg-ai-thought.has-content { cursor:pointer; }',
      '.ask-msg-ai-thought.has-content:hover { background:color-mix(in srgb, var(--colorBgLighter) 84%, transparent); color:var(--aip-text-primary); }',
      '.ask-msg-ai-thought, .ask-msg-ai-thought * { -webkit-user-select:none !important; user-select:none !important; }',
      '.ask-msg-ai-thought-panel { display:none; margin-top:8px; padding:10px 12px; border-radius:var(--aip-r-lg); background:color-mix(in srgb, var(--colorBgLight) 90%, transparent); border:1px solid var(--aip-border); box-shadow:var(--aip-shadow-base); color:var(--aip-text-secondary); white-space:pre-wrap; line-height:1.6; font-size:13px; cursor:text; }',
      '.ask-msg-ai-thought-wrap[aria-expanded="true"] .ask-msg-ai-thought-panel { display:block; }',
      '.ask-msg-ai-thought-arrow { color:var(--aip-text-secondary); display:inline-flex; align-items:center; justify-content:center; transition:transform .18s ease, color .14s ease; transform-origin:center; }',
      '.ask-msg-ai-thought-wrap[aria-expanded="true"] .ask-msg-ai-thought-arrow { transform:rotate(90deg); }',
      '.ask-msg-ai-answer { font-size:15px; line-height:1.75; color:var(--aip-text-primary); }',
      '.ask-msg-ai-answer-live { white-space:pre-wrap; word-break:break-word; overflow-anchor:auto; }',
      '.ask-msg-ai-answer-committed { color:var(--aip-text-primary); overflow-anchor:auto; }',
      '.ask-msg-ai-answer-committed > :first-child { margin-top:0; }',
      '.ask-msg-ai-answer-committed > :last-child { margin-bottom:0; }',
      '.ask-msg-ai-answer-preview { display:block; position:relative; white-space:pre-wrap; word-break:break-word; transition:opacity .08s linear; }',
      '.ask-msg-ai-tail-token { display:inline-block; opacity:0; transform:translateY(4px) scale(.985); animation:askTokenIn .16s cubic-bezier(.22,1,.36,1) forwards; will-change:opacity, transform; }',
      '.ask-msg-ai-answer-tail-ghost { opacity:.34; }',
      '.ask-msg-ai-answer-preview:not(.has-tail) { display:none; }',
      '.ask-msg-ai-answer-preview.has-tail { min-height:2.4em; }',
      '.ask-msg-ai-answer-tail-current { color:var(--aip-text-primary); }',
      '.ask-msg-ai-answer-tail-ghost { color:var(--aip-text-primary); opacity:.38; transition:opacity .08s linear; }',
      '.ask-msg-ai-answer > :first-child { margin-top:0; }',
      '.ask-msg-ai-answer > :last-child { margin-bottom:0; }',
      '.ask-msg-ai-answer p, .ask-msg-ai-answer ul, .ask-msg-ai-answer ol, .ask-msg-ai-answer blockquote, .ask-msg-ai-answer pre, .ask-msg-ai-answer table, .ask-msg-ai-answer h1, .ask-msg-ai-answer h2, .ask-msg-ai-answer h3, .ask-msg-ai-answer h4, .ask-msg-ai-answer hr { margin:0 0 12px; }',
      '.ask-msg-ai-answer h1, .ask-msg-ai-answer h2, .ask-msg-ai-answer h3, .ask-msg-ai-answer h4 { line-height:1.3; letter-spacing:-0.01em; }',
      '.ask-msg-ai-answer h1 { font-size:1.6em; font-weight:800; }',
      '.ask-msg-ai-answer h2 { font-size:1.32em; font-weight:760; }',
      '.ask-msg-ai-answer h3 { font-size:1.14em; font-weight:700; }',
      '.ask-msg-ai-answer h4 { font-size:1em; font-weight:680; color:color-mix(in srgb, var(--colorFg) 90%, transparent); }',
      '.ask-msg-ai-answer hr { border:none; border-top:1px solid var(--aip-border); }',
      '.ask-msg-ai-answer ul { padding-left:20px; list-style:disc outside !important; }',
      '.ask-msg-ai-answer ol { padding-left:20px; list-style:decimal outside !important; }',
      '.ask-msg-ai-answer ul ul { list-style:circle outside !important; }',
      '.ask-msg-ai-answer ul ul ul { list-style:square outside !important; }',
      '.ask-msg-ai-answer li { display:list-item !important; }',
      '.ask-msg-ai-answer li + li { margin-top:4px; }',
      '.ask-msg-ai-answer mark { padding:0 .24em; border-radius:4px; background:color-mix(in srgb, var(--colorWarningBgAlpha) 88%, transparent); color:var(--aip-text-primary); }',
      '.ask-msg-ai-answer code { font-family:var(--monospaceFont), ui-monospace, monospace; font-size:.92em; padding:.14em .34em; border-radius:6px; background:color-mix(in srgb, var(--colorBgLighter) 90%, transparent); }',
      '.ask-msg-ai-answer pre { position:relative; max-width:100%; overflow:auto; padding:40px 14px 12px; border-radius:var(--aip-r-lg); background:color-mix(in srgb, var(--colorBgLight) 94%, transparent); border:1px solid var(--aip-border); -webkit-overflow-scrolling:touch; }',
      '.ask-msg-ai-answer pre code { padding:0; background:transparent; }',
      '.ask-code-copy { position:absolute; top:10px; right:10px; z-index:5; border:1px solid var(--aip-border); border-radius:8px; padding:4px 8px; background:color-mix(in srgb, var(--colorBgLighter) 88%, transparent); color:var(--aip-text-secondary); cursor:pointer; font-size:12px; line-height:1; pointer-events:auto; }',
      '.ask-code-copy:hover { background:color-mix(in srgb, var(--colorBgLighter) 96%, transparent); color:var(--aip-text-primary); }',
      '.ask-code-keyword { color:#7CC7FF; }',
      '.ask-code-string { color:#E7B97A; }',
      '.ask-code-number { color:#9FE3A2; }',
      '.ask-code-key { color:#C59BFF; }',
      '.ask-msg-ai-answer blockquote { padding-left:12px; border-left:2px solid var(--colorHighlightBg); color:color-mix(in srgb, var(--colorFg) 78%, transparent); }',
      '.ask-msg-ai-answer a { color:var(--aip-accent); text-decoration:none; }',
      '.ask-msg-ai-answer a:hover { text-decoration:underline; }',
      '.ask-msg-ai-answer table { display:block; width:max-content; min-width:100%; max-width:100%; overflow-x:auto; overflow-y:hidden; border-collapse:collapse; border-spacing:0; border:1px solid var(--aip-border); border-radius:var(--aip-r-lg); -webkit-overflow-scrolling:touch; }',
      '.ask-msg-ai-answer th, .ask-msg-ai-answer td { padding:8px 10px; text-align:left; vertical-align:top; border:1px solid var(--aip-border); }',
      '.ask-msg-ai-answer thead th { background:color-mix(in srgb, var(--colorBgLighter) 88%, transparent); font-weight:700; }',
      '.ask-msg-ai-answer tbody tr:nth-child(even) td { background:color-mix(in srgb, var(--colorBgLight) 96%, transparent); }',
      '.ask-task-item { list-style:none !important; display:flex !important; align-items:flex-start; gap:8px; margin-left:-18px; }',
      '.ask-task-box { width:16px; height:16px; margin-top:2px; border-radius:5px; border:1px solid var(--aip-border-hover); display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--aip-bg); font-size:12px; line-height:1; }',
      '.ask-task-box.checked { background:var(--aip-accent); border-color:var(--aip-accent); }',
      '.ask-task-content { min-width:0; flex:1; }',
      '.ask-latex-inline { display:inline-flex; align-items:center; vertical-align:-0.22em; max-width:100%; }',
      '.ask-latex-block { display:flex; align-items:center; justify-content:center; margin:0 0 12px; padding:12px 14px; border-radius:var(--aip-r-lg); background:color-mix(in srgb, var(--colorBgLight) 90%, transparent); border:1px solid var(--aip-border); overflow:auto; }',
      '.ask-latex { display:inline-flex; align-items:center; gap:0.08em; max-width:100%; color:var(--aip-text-primary); font-family:Georgia, "Times New Roman", serif; font-style:italic; line-height:1.25; white-space:nowrap; }',
      '.ask-latex-display { font-size:1.12em; padding:2px 0; }',
      '.ask-latex-text, .ask-latex-op { font-family:var(--fontFamily, system-ui, sans-serif); font-style:normal; margin:0 0.08em; }',
      '.ask-latex-cmd { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-style:normal; color:var(--aip-text-secondary); }',
      '.ask-latex-frac { display:inline-grid; grid-template-rows:auto auto; align-items:center; justify-items:center; vertical-align:middle; margin:0 0.12em; line-height:1.05; }',
      '.ask-latex-num { display:block; min-width:100%; padding:0 0.22em 0.08em; border-bottom:1px solid currentColor; text-align:center; }',
      '.ask-latex-den { display:block; min-width:100%; padding:0.08em 0.22em 0; text-align:center; }',
      '.ask-latex-sqrt { display:inline-flex; align-items:stretch; position:relative; margin:0 0.08em; }',
      '.ask-latex-sqrt::before { content:"√"; font-size:1.32em; line-height:1; transform:translateY(.04em); }',
      '.ask-latex-radicand { display:inline-block; border-top:1px solid currentColor; padding:0.04em 0.12em 0 0.16em; }',
      '.ask-latex-root-index { position:absolute; left:-.35em; top:-.35em; font-size:.58em; }',
      '.ask-latex-largeop { font-size:1.35em; line-height:1; margin:0 0.04em; }',
      '.ask-latex-scripted { display:inline-flex; align-items:center; vertical-align:middle; }',
      '.ask-latex-scripts { display:inline-flex; flex-direction:column; justify-content:center; margin-left:.04em; line-height:.85; }',
      '.ask-latex-scripts sup, .ask-latex-scripts sub { font-size:.68em; line-height:.9; position:static; }',
      '.ask-latex-overline { text-decoration:overline; }',
      '.ask-latex-underline { text-decoration:underline; }',
      '.ask-latex-vector { position:relative; padding-top:.1em; }',
      '.ask-latex-vector::before { content:"→"; position:absolute; left:0; right:0; top:-.65em; text-align:center; font-size:.75em; font-style:normal; }',
      '.ask-latex-space { display:inline-block; width:.22em; }',
      '.ask-latex-thinspace { display:inline-block; width:.16em; }',
      '.ask-latex-quad { display:inline-block; width:1em; }',
      '.ask-latex-qquad { display:inline-block; width:2em; }',
      '.ask-latex-delim, .ask-latex-matrix-fence { font-size:1.65em; line-height:1; font-style:normal; }',
      '.ask-latex-matrix-wrap { display:inline-flex; align-items:center; gap:.18em; vertical-align:middle; }',
      '.ask-latex-matrix { display:inline-grid; gap:.18em .72em; align-items:center; }',
      '.ask-latex-matrix-row { display:contents; }',
      '.ask-latex-matrix-cell { display:inline-flex; justify-content:center; min-width:1.2em; }',
      '.ask-msg-ai-error { color:var(--colorErrorBg); font-size:14px; line-height:1.6; }',
      '.ask-turn-ai-meta { display:flex; align-items:center; justify-content:flex-start; gap:10px; margin:4px 0 0; min-height:18px; width:100%; }',
      '@keyframes askChipPop { from { opacity:0; transform:scale(.8); } to { opacity:1; transform:scale(1); } }',
      '@keyframes askChipRemove { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(.82); } }',
      '@keyframes askMsgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }',
      '@keyframes askTokenIn { from { opacity:0; transform:translateY(4px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }',
      '@keyframes askReadingSweep { from { transform:translateX(-130%); } to { transform:translateX(130%); } }',
      '@keyframes askThinkingShimmer { 0% { background-position:120% 0; } 100% { background-position:-18% 0; } }',
    ], 'ask-in-page-styles');
  }

  function getCaretOffset(element) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return element.textContent.length;
    }
    const range = selection.getRangeAt(0);
    if (!element.contains(range.endContainer)) {
      return element.textContent.length;
    }
    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(range.endContainer, range.endOffset);
    return preRange.toString().length;
  }

  function setCaret(element, offset) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(true);
    let remaining = Math.max(0, Math.min(offset, element.textContent.length));
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while (node) {
      if (remaining <= node.textContent.length) {
        range.setStart(node, remaining);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      remaining -= node.textContent.length;
      node = walker.nextNode();
    }
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function normalizeTab(tab) {
    const title = tab.title || tab.pendingUrl || tab.url || t('untitledTab');
    const url = tab.url || tab.pendingUrl || '';
    const host = getHostFromUrl(url);
    return {
      id: 'tab-' + tab.id,
      kind: 'tab',
      group: 'Tabs',
      title,
      subtitle: host,
      iconText: title.slice(0, 1).toUpperCase(),
      iconUrl: tab.favIconUrl || '',
      color: '#2D3139',
      isCurrentPage: Boolean(tab.active),
      raw: tab,
    };
  }

  function normalizeFile(file) {
    const fileName = (file.filename || '').split(/[\\/]/).pop() || t('untitledFile');
    return {
      id: 'file-' + file.id,
      kind: 'file',
      group: 'Files',
      title: fileName,
      subtitle: file.filename || '',
      meta: [formatBytes(file.fileSize || 0), formatDate(file.startTime || file.endTime)].filter(Boolean).join(' · '),
      iconText: fileName.slice(0, 1).toUpperCase(),
      color: '#3A3F47',
      raw: file,
    };
  }

  function initPanelState(root) {
    root.innerHTML = buildMarkup();
    const state = {
      root,
      messages: root.querySelector('#askMessages'),
      empty: root.querySelector('#askEmpty'),
      commandsRow: root.querySelector('#askCommandsRow'),
      inputBox: root.querySelector('#askInputBox'),
      editBanner: root.querySelector('#askEditBanner'),
      editClose: root.querySelector('#askEditClose'),
      inputContext: root.querySelector('#askInputContext'),
      contextCard: root.querySelector('#askContextCard'),
      refRowInline: root.querySelector('#askRefRowInline'),
      inlineRefRow: root.querySelector('#askInlineRefRow'),
      selectionCard: root.querySelector('#askSelectionCard'),
      selectionTitle: root.querySelector('#askSelectionTitle'),
      inputMain: root.querySelector('#askInputMain'),
      inputField: root.querySelector('#askInputField'),
      btnSend: root.querySelector('#askBtnSend'),
      btnTool: root.querySelector('.ask-btn-tool'),
      btnNew: root.querySelector('.ask-btn-new'),
      ctxFavicon: root.querySelector('#askContextFavicon'),
      ctxTitle: root.querySelector('#askContextTitle'),
      ctxUrl: root.querySelector('#askContextUrl'),
      suggestionDropdown: root.querySelector('#askSuggestionDropdown'),
      suggestionBody: root.querySelector('#askSuggestionBody'),
      suggestionSearchText: root.querySelector('#askSuggestionSearchText'),
      sendValidation: root.querySelector('#askSendValidation'),
      activeCmd: null,
      cmdChipEl: null,
      cmdChipFocused: false,
      refs: [],
      autoCurrentPageRefId: null,
      capabilities: [],
      nextRefId: 1,
      nextCapabilityId: 1,
      suggestionToken: null,
      suggestionItems: [],
      suggestionSections: [],
      suggestionSelectedIndex: 0,
      suggestionMode: null,
      atTabsExpanded: false,
      atSuggestionData: null,
      currentContext: null,
      contextCardVisible: false,
      selectedText: '',
      selectionPollId: null,
      focusedComposerTokenKey: null,
      editingTurnId: null,
      nextTurnId: 1,
      conversationMemory: {
        summary: '',
        summarizedTurnCount: 0,
      },
      pendingAiTasks: new Map(),
      currentStreamingTurnId: null,
      isBusy: false,
      commandUsage: new Map(),
      scrollAnimationFrame: null,
      autoScrollPinned: true,
      userScrollingMessages: false,
      lastSummaryDebug: null,
      readingQueueTimer: null,
      readingQueueIndex: 0,
      selectionEventHandlersBound: false,
    };

    function setSendButtonMode(mode) {
      state.btnSend.classList.toggle('is-stop', mode === 'stop');
      if (mode === 'stop') {
        state.btnSend.title = t('stopOutput');
        state.btnSend.setAttribute('aria-label', t('stopOutputMessage'));
        return;
      }
      state.btnSend.title = t('send');
      state.btnSend.setAttribute('aria-label', t('sendMessage'));
    }

    function syncBusyState() {
      state.isBusy = state.pendingAiTasks.size > 0;
      setSendButtonMode(state.isBusy ? 'stop' : 'send');
      state.inputField.contentEditable = 'true';
      state.inputField.setAttribute('aria-disabled', 'false');
      state.inputField.classList.remove('disabled');
      state.btnTool.disabled = false;
      state.commandsRow.style.pointerEvents = '';
    }

    function isNearBottom() {
      const threshold = 20;
      return (state.messages.scrollHeight - state.messages.clientHeight - state.messages.scrollTop) <= threshold;
    }

    function animateScrollToBottom(duration) {
      if (!state.autoScrollPinned) {
        return;
      }
      const startTop = state.messages.scrollTop;
      const endTop = state.messages.scrollHeight - state.messages.clientHeight;
      if (endTop <= startTop) {
        return;
      }
      if (state.scrollAnimationFrame) {
        cancelAnimationFrame(state.scrollAnimationFrame);
      }
      const startedAt = performance.now();
      const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        state.messages.scrollTop = startTop + (endTop - startTop) * easeInOut(progress);
        if (progress < 1) {
          state.scrollAnimationFrame = requestAnimationFrame(step);
        } else {
          state.scrollAnimationFrame = null;
        }
      };
      state.scrollAnimationFrame = requestAnimationFrame(step);
    }

    function scrollToBottom(options) {
      if (!state.autoScrollPinned) {
        return;
      }
      const settings = Object.assign({ smooth: false }, options || {});
      if (settings.smooth) {
        animateScrollToBottom(420);
        return;
      }
      state.messages.scrollTop = state.messages.scrollHeight;
    }

    function formatMessageTime() {
      return new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    function serializeSequenceParts(parts) {
      return parts.map((part) => {
        if (part.type === 'text') {
          return part.text;
        }
        return '[[aip:' + serializeTokenPayload(part) + ']]';
      }).join('');
    }

    function serializeMessagePayload(parts, activeCmd) {
      const cmd = activeCmd ? '[[aip-cmd:' + encodeURIComponent(activeCmd) + ']]' : '';
      return cmd + serializeSequenceParts(parts);
    }

    function getTopCommandNames() {
      const ranked = commandDefinitions
        .slice()
        .sort((a, b) => {
          const usageDiff = (state.commandUsage.get(b.name) || 0) - (state.commandUsage.get(a.name) || 0);
          if (usageDiff !== 0) {
            return usageDiff;
          }
          return commandDefinitions.findIndex((item) => item.name === a.name) - commandDefinitions.findIndex((item) => item.name === b.name);
        });
      return ranked.slice(0, 3).map((item) => item.name);
    }

    function shouldShowCurrentPageButton() {
      return Boolean(state.currentContext && !state.contextCardVisible && !hasReferenceForTab(state.currentContext));
    }

    function addCurrentPageReference() {
      setAutoCurrentPageReference(state.currentContext);
    }

    function renderCommandButtons() {
      const topCommands = getTopCommandNames();
      const commandMarkup = topCommands.map((name) => (
        '<button class="ask-btn-cmd" type="button" data-cmd="' + escapeHtml(name) + '">' +
          getCommandIconSvg(name) +
          escapeHtml(name) +
        '</button>'
      )).join('');
      const currentPageMarkup = shouldShowCurrentPageButton()
        ? (
          '<button class="ask-btn-cmd ask-btn-current-page" type="button" data-current-page="true" title="' + escapeHtml(state.currentContext.title || t('currentPage')) + '">' +
            '<span class="ask-btn-current-page-icon">' + escapeHtml(state.currentContext.iconText || 'A') + '</span>' +
            escapeHtml(t('currentPage')) +
          '</button>'
        )
        : '';
      state.commandsRow.innerHTML = commandMarkup + currentPageMarkup;
      state.commandsRow.querySelectorAll('.ask-btn-cmd').forEach((button) => {
        if (button.dataset.currentPage === 'true') {
          button.addEventListener('click', () => addCurrentPageReference());
          return;
        }
        button.addEventListener('click', () => selectCommand(button.dataset.cmd));
      });
    }

    function syncCommandsRow() {
      renderCommandButtons();
      const hasCurrentPageButton = shouldShowCurrentPageButton();
      state.commandsRow.classList.toggle('commands-hidden', Boolean(state.activeCmd));
      state.commandsRow.classList.toggle('hidden', Boolean(state.activeCmd) && !hasCurrentPageButton);
    }

    function syncEditingBanner() {
      state.editBanner.classList.toggle('hidden', !state.editingTurnId);
    }

    function getComposerReferenceItems() {
      const items = [];
      if (state.contextCardVisible && state.currentContext) {
        items.push({
          key: 'context',
          kind: 'context',
          iconText: state.currentContext.iconText || 'A',
          title: state.currentContext.title,
        });
      }
      if (state.selectedText) {
        items.push({
          key: 'selection',
          kind: 'selection',
          iconText: 'AI',
          title: state.selectedText,
        });
      }
      state.refs.forEach((ref) => {
        items.push({
          key: 'ref:' + ref.id,
          kind: ref.kind,
          iconText: ref.kind === 'file' ? 'D' : (ref.iconText || ref.title.slice(0, 1).toUpperCase()),
          title: ref.title,
          refId: ref.id,
        });
      });
      return items;
    }

    function isSuggestionAlreadySelected(item) {
      if (!item) {
        return false;
      }
      if (item.kind === 'capability') {
        return state.capabilities.some((entry) => entry.type === item.capabilityType || entry.title === item.title);
      }
      if (item.kind === 'context') {
        const currentContextId = String(state.currentContext?.id || state.currentContext?.raw?.id || '');
        const itemId = String(item.id || item.raw?.id || '');
        const currentSubtitle = String(state.currentContext?.subtitle || '');
        return state.contextCardVisible && (
          (currentContextId && itemId && currentContextId === itemId) ||
          (currentSubtitle && item.subtitle && currentSubtitle === item.subtitle)
        );
      }
      if (item.kind === 'tab') {
        const currentContextId = String(state.currentContext?.id || state.currentContext?.raw?.id || '');
        const itemId = String(item.id || item.raw?.id || '');
        const currentSubtitle = String(state.currentContext?.subtitle || '');
        if (state.contextCardVisible && (
          (currentContextId && itemId && currentContextId === itemId) ||
          (currentSubtitle && item.subtitle && currentSubtitle === item.subtitle)
        )) {
          return true;
        }
      }
      return state.refs.some((ref) => {
        const sameRefId = ref.id && item.id && ('ref:' + ref.id === item.id || ref.id === item.id);
        const sameTitle = ref.title === item.title;
        const sameSubtitle = String(ref.subtitle || '') === String(item.subtitle || '');
        return sameRefId || (sameTitle && sameSubtitle);
      });
    }

    function syncInlineReferenceTokens() {
      state.inlineRefRow.innerHTML = '';
    }

    function createReferenceCard(ref) {
      const chip = document.createElement('div');
      chip.className = 'ask-ref-chip is-entering';
      chip.dataset.refId = ref.id;
      const icon = document.createElement('span');
      icon.className = 'ask-ref-chip-icon';
      const info = document.createElement('span');
      info.className = 'ask-ref-chip-info';
      const title = document.createElement('span');
      title.className = 'ask-ref-chip-title';
      const subtitle = document.createElement('span');
      subtitle.className = 'ask-ref-chip-subtitle';
      info.append(title, subtitle);
      ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
        chip.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      });
      chip.addEventListener('click', (event) => {
        event.preventDefault();
        removeReference(chip.dataset.refId || '');
      });
      chip.append(icon, info);
      updateReferenceCard(chip, ref);
      window.setTimeout(() => {
        chip.classList.remove('is-entering');
      }, 240);
      return chip;
    }

    function updateReferenceCard(chip, ref) {
      chip.classList.toggle('ask-ref-chip-auto-current', Boolean(ref.autoCurrentPage));
      chip.dataset.refId = ref.id;
      chip.title = ref.title || '';
      const icon = chip.querySelector('.ask-ref-chip-icon');
      const title = chip.querySelector('.ask-ref-chip-title');
      const subtitle = chip.querySelector('.ask-ref-chip-subtitle');
      if (icon) {
        icon.textContent = ref.kind === 'file' ? 'D' : ref.iconText;
      }
      if (title) {
        title.textContent = ref.title;
      }
      if (subtitle) {
        subtitle.textContent = ref.kind === 'file'
          ? ((ref.title.split('.').pop() || '').toLowerCase() || 'file')
          : (ref.subtitle || '');
      }
    }

    function renderReferenceCards() {
      const existingById = new Map(
        Array.from(state.refRowInline.querySelectorAll('.ask-ref-chip[data-ref-id]'))
          .map((chip) => [chip.dataset.refId, chip])
      );
      const nextChips = state.refs.map((ref) => {
        const chip = existingById.get(ref.id) || createReferenceCard(ref);
        updateReferenceCard(chip, ref);
        return chip;
      });
      state.refRowInline.replaceChildren(...nextChips);
    }

    function getComposerTokenEntries() {
      const entries = [];
      if (state.activeCmd && state.cmdChipEl) {
        entries.push({
          key: 'cmd',
          el: state.cmdChipEl,
          remove: () => removeCommand(),
        });
      }
      getComposerTokenNodes().forEach((el) => {
        const item = {
          key: el.dataset.tokenKey,
          refId: el.dataset.refId,
        };
        entries.push({
          key: item.key,
          el,
          remove: () => {
            if (item.key === 'context') {
              setContextCardVisible(false);
              return;
            }
            if (item.key === 'selection') {
              clearSelectedTextContext();
              return;
            }
            if (item.key && item.key.startsWith('cap:')) {
              removeCapability(item.key.slice(4));
              return;
            }
            if (item.refId) {
              removeReference(item.refId);
            }
          },
        });
      });
      return entries;
    }

    function clearFocusedComposerToken() {
      state.focusedComposerTokenKey = null;
      state.cmdChipFocused = false;
      state.cmdChipEl?.classList.remove('focused');
      state.inputMain.querySelectorAll('.ask-composer-token.focused').forEach((node) => {
        node.classList.remove('focused');
      });
    }

    function clearComposer(options) {
      const settings = Object.assign({
        showDefaultContext: false,
        keepEditing: false,
      }, options || {});
      hideSendValidation();
      clearFocusedComposerToken();
      state.inputField.innerHTML = '';
      state.inlineRefRow.innerHTML = '';
      if (state.activeCmd) {
        removeCommand();
      }
      state.refs = [];
      state.autoCurrentPageRefId = null;
      state.capabilities = [];
      state.selectedText = '';
      state.selectionTitle.textContent = '';
      state.contextCardVisible = Boolean(settings.showDefaultContext);
      getComposerTokenNodes().forEach((node) => node.remove());
      syncReferenceStrip();
      hideSuggestions();
      if (!settings.keepEditing) {
        state.editingTurnId = null;
        syncEditingBanner();
      }
    }

    function restoreComposerFromSerialized(serialized, activeCmd) {
      clearComposer({ showDefaultContext: false, keepEditing: true });
      if (activeCmd) {
        selectCommand(activeCmd);
      }
      if (serialized) {
        insertSerializedComposerText(serialized);
        syncStateFromComposerDom();
      }
      state.inputField.focus();
    }

    async function copyTextToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {}
      try {
        const selection = window.getSelection();
        const previousRanges = [];
        if (selection) {
          for (let index = 0; index < selection.rangeCount; index += 1) {
            previousRanges.push(selection.getRangeAt(index).cloneRange());
          }
        }
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (selection) {
          selection.removeAllRanges();
          previousRanges.forEach((range) => selection.addRange(range));
        }
        return copied;
      } catch (fallbackError) {}
      return false;
    }

    function setActionButtonState(button, status) {
      if (!button) {
        return;
      }
      button.classList.remove('is-success', 'is-fail');
      if (!status) {
        return;
      }
      button.classList.add(status === 'success' ? 'is-success' : 'is-fail');
      if (button._askStateResetTimer) {
        clearTimeout(button._askStateResetTimer);
      }
      button._askStateResetTimer = window.setTimeout(() => {
        button.classList.remove('is-success', 'is-fail');
      }, 1200);
    }

    async function copyTextWithFeedback(button, text) {
      const ok = await copyTextToClipboard(text);
      setActionButtonState(button, ok ? 'success' : 'fail');
    }

    function animateNodeRemoval(node, callback) {
      if (!node) {
        callback?.();
        return;
      }
      node.classList.add('is-removing');
      window.setTimeout(() => {
        callback?.();
      }, 170);
    }

    function isPanelVisible() {
      return Boolean(panelRoot?.isConnected && panelRoot.offsetParent !== null && !document.hidden);
    }

    function syncSelectedTextSoon() {
      if (!isPanelVisible()) {
        return;
      }
      if (state._selectionSyncFrame) {
        cancelAnimationFrame(state._selectionSyncFrame);
      }
      state._selectionSyncFrame = requestAnimationFrame(() => {
        state._selectionSyncFrame = null;
        syncSelectedText();
      });
    }

    function focusComposerTokenByIndex(index) {
      const entries = getComposerTokenEntries();
      clearFocusedComposerToken();
      const entry = entries[index];
      if (!entry) {
        state.inputField.focus();
        return;
      }
      state.focusedComposerTokenKey = entry.key;
      if (entry.key === 'cmd') {
        state.cmdChipFocused = true;
        state.cmdChipEl?.classList.add('focused');
      } else {
        entry.el.classList.add('focused');
      }
    }

    function focusComposerTokenEntry(entry) {
      if (!entry) {
        return false;
      }
      clearFocusedComposerToken();
      state.focusedComposerTokenKey = entry.key;
      if (entry.key === 'cmd') {
        state.cmdChipFocused = true;
        state.cmdChipEl?.classList.add('focused');
      } else {
        entry.el.classList.add('focused');
      }
      return true;
    }

    function getLastStatusTokenEntry() {
      const entries = getComposerTokenEntries()
        .filter((entry) => entry.key === 'cmd' || String(entry.key || '').startsWith('cap:'));
      return entries[entries.length - 1] || null;
    }

    function moveComposerTokenFocus(step) {
      const entries = getComposerTokenEntries();
      if (!entries.length) {
        return false;
      }
      const currentIndex = entries.findIndex((entry) => entry.key === state.focusedComposerTokenKey);
      if (currentIndex === -1) {
        return false;
      }
      const nextIndex = currentIndex + step;
      if (nextIndex < 0 || nextIndex >= entries.length) {
        clearFocusedComposerToken();
        state.inputField.focus();
        return true;
      }
      focusComposerTokenByIndex(nextIndex);
      return true;
    }

    function isCaretAtComposerStart() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return false;
      }
      const range = selection.getRangeAt(0);
      if (!range.collapsed || !state.inputField.contains(range.startContainer)) {
        return false;
      }
      if (range.startContainer === state.inputField) {
        return range.startOffset === 0;
      }
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        return range.startOffset === 0 && !range.startContainer.previousSibling;
      }
      return false;
    }

    function getAdjacentComposerTokenEntry(direction) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return null;
      }
      const range = selection.getRangeAt(0);
      if (!range.collapsed || !state.inputField.contains(range.startContainer)) {
        return null;
      }
      let container = range.startContainer;
      let offset = range.startOffset;
      let candidate = null;

      if (container === state.inputField) {
        candidate = state.inputField.childNodes[direction < 0 ? offset - 1 : offset] || null;
      } else if (container.nodeType === Node.TEXT_NODE) {
        if (direction < 0) {
          if (offset > 0) {
            return null;
          }
          candidate = container.previousSibling;
        } else {
          if (offset < (container.textContent || '').length) {
            return null;
          }
          candidate = container.nextSibling;
        }
      } else if (container instanceof HTMLElement && container.classList.contains('ask-composer-token')) {
        candidate = direction < 0 ? container.previousSibling : container.nextSibling;
      } else {
        candidate = container.childNodes[direction < 0 ? offset - 1 : offset] || null;
      }

      while (candidate && candidate.nodeType === Node.TEXT_NODE && !(candidate.textContent || '').length) {
        candidate = direction < 0 ? candidate.previousSibling : candidate.nextSibling;
      }
      if (!(candidate instanceof HTMLElement) || !candidate.classList.contains('ask-composer-token')) {
        return null;
      }
      return {
        key: candidate.dataset.tokenKey,
        el: candidate,
        remove: () => {
          const key = candidate.dataset.tokenKey || '';
          if (key === 'context') {
            setContextCardVisible(false);
            return;
          }
          if (key === 'selection') {
            clearSelectedTextContext();
            return;
          }
          if (key.startsWith('cap:')) {
            removeCapability(key.slice(4));
            return;
          }
          const refId = candidate.dataset.refId || '';
          if (refId) {
            removeReference(refId);
          }
        },
      };
    }

    function createComposerTokenElement(item) {
      const token = document.createElement('span');
      token.className = 'ask-composer-token';
      token.contentEditable = 'false';
      token.dataset.tokenKey = item.key;
      token.dataset.tokenKind = item.kind;
      token.dataset.tokenTitle = item.title;
      token.dataset.tokenIcon = item.iconText || '';
      token.dataset.tokenRole = item.tokenRole || '';
      if (item.refId) {
        token.dataset.refId = item.refId;
      }
      if (item.capabilityId) {
        token.dataset.capabilityId = item.capabilityId;
      }
      if (item.capabilityType) {
        token.dataset.capabilityType = item.capabilityType;
      }
      if (item.capabilityCategory) {
        token.dataset.capabilityCategory = item.capabilityCategory;
      }
      if (item.capabilityContent) {
        token.dataset.capabilityContent = item.capabilityContent;
      }
      const icon = document.createElement('span');
      icon.className = 'ask-composer-token-icon';
      icon.textContent = item.iconText || '';
      const label = document.createElement('span');
      label.className = 'ask-composer-token-label';
      label.textContent = item.title;
      token.append(icon, label);
      return token;
    }

    function bindCapabilityTokenRemoval(token, capabilityId) {
      ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
        token.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      });
      token.addEventListener('click', (event) => {
        event.preventDefault();
        removeCapability(capabilityId);
      });
    }

    function placeCaretAfterNode(node) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStartAfter(node);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      state.inputField.focus();
    }

    function placeCaretInTextNode(node, offset) {
      if (!node || node.nodeType !== Node.TEXT_NODE) {
        state.inputField.focus();
        return;
      }
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(node, Math.max(0, Math.min(offset, (node.textContent || '').length)));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      state.inputField.focus();
    }

    function focusComposer() {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && state.inputField.contains(selection.anchorNode)) {
        state.inputField.focus();
        return;
      }
      const lastNode = state.inputField.lastChild;
      if (!lastNode) {
        const emptyNode = document.createTextNode('');
        state.inputField.append(emptyNode);
        placeCaretInTextNode(emptyNode, 0);
        return;
      }
      if (lastNode.nodeType === Node.TEXT_NODE) {
        placeCaretInTextNode(lastNode, (lastNode.textContent || '').length);
        return;
      }
      placeCaretAfterNode(lastNode);
    }

    function insertNodeAtComposerCaret(node) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !state.inputField.contains(selection.anchorNode)) {
        state.inputField.appendChild(node);
        placeCaretAfterNode(node);
        return;
      }
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
      placeCaretAfterNode(node);
    }

    function getComposerTokenNodes() {
      return Array.from(state.inputMain.querySelectorAll('.ask-composer-token'));
    }

    function findComposerTokenNode(key) {
      return state.inputMain.querySelector('.ask-composer-token[data-token-key="' + key + '"]');
    }

    function syncComposerTokenDom() {
      const existingContext = findComposerTokenNode('context');
      if (state.contextCardVisible && state.currentContext) {
        if (!existingContext) {
          const token = createComposerTokenElement({
            key: 'context',
            kind: 'context',
            iconText: state.currentContext.iconText || 'A',
            title: state.currentContext.title,
          });
          state.inputField.prepend(token);
        } else {
          existingContext.dataset.tokenTitle = state.currentContext.title;
          existingContext.dataset.tokenIcon = state.currentContext.iconText || 'A';
          existingContext.querySelector('.ask-composer-token-icon').textContent = state.currentContext.iconText || 'A';
          existingContext.querySelector('.ask-composer-token-label').textContent = state.currentContext.title;
        }
      } else if (existingContext) {
        existingContext.remove();
      }

      const existingSelection = findComposerTokenNode('selection');
      if (state.selectedText) {
        if (!existingSelection) {
          const token = createComposerTokenElement({
            key: 'selection',
            kind: 'selection',
            iconText: 'AI',
            title: state.selectedText,
          });
          state.inputField.appendChild(token);
        } else {
          existingSelection.dataset.tokenTitle = state.selectedText;
          existingSelection.querySelector('.ask-composer-token-label').textContent = state.selectedText;
        }
      } else if (existingSelection) {
        existingSelection.remove();
      }
    }

    function getComposerSequenceParts() {
      const parts = [];
      const collect = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && state.inputField.contains(node.parentNode)) {
            parts.push({
              type: 'text',
              text: node.textContent,
            });
          }
          return;
        }
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.classList.contains('ask-composer-token')) {
          parts.push({
            type: 'ref',
            key: node.dataset.tokenKey,
            kind: node.dataset.tokenKind,
            title: node.dataset.tokenTitle || '',
            iconText: node.dataset.tokenIcon || '',
            refId: node.dataset.refId || '',
            tokenRole: node.dataset.tokenRole || '',
            capabilityId: node.dataset.capabilityId || '',
            capabilityType: node.dataset.capabilityType || '',
            capabilityCategory: node.dataset.capabilityCategory || '',
            capabilityContent: node.dataset.capabilityContent || '',
          });
          return;
        }
        if (node === state.inlineRefRow) {
          return;
        }
        if (node === state.inputField || state.inputField.contains(node)) {
          Array.from(node.childNodes).forEach(collect);
        }
      };
      state.inputMain.childNodes.forEach(collect);
      return parts;
    }

    function syncStateFromComposerDom() {
      const tokenNodes = getComposerTokenNodes();
      const hasContextToken = tokenNodes.some((node) => node.dataset.tokenKey === 'context');
      const selectionToken = tokenNodes.find((node) => node.dataset.tokenKey === 'selection');
      const nextSelectedText = selectionToken?.dataset.tokenTitle || '';
      const presentRefIds = tokenNodes
        .map((node) => node.dataset.refId || '')
        .filter(Boolean);
      const presentCapabilityIds = tokenNodes
        .map((node) => node.dataset.capabilityId || '')
        .filter(Boolean);
      const refsChanged = presentRefIds.length !== state.refs.length || state.refs.some((ref) => !presentRefIds.includes(ref.id));
      const capabilitiesChanged = presentCapabilityIds.length !== state.capabilities.length || state.capabilities.some((item) => !presentCapabilityIds.includes(item.id));
      const contextChanged = state.contextCardVisible !== hasContextToken;
      const selectionChanged = state.selectedText !== nextSelectedText;
      if (!refsChanged && !capabilitiesChanged && !contextChanged && !selectionChanged) {
        return;
      }
      state.contextCardVisible = hasContextToken;
      state.selectedText = nextSelectedText;
      state.selectionTitle.textContent = state.selectedText;
      state.refs = state.refs.filter((ref) => presentRefIds.includes(ref.id));
      state.capabilities = state.capabilities.filter((item) => presentCapabilityIds.includes(item.id));
      syncReferenceStrip();
    }

    function serializeComposerFragment(fragment) {
      let output = '';
      Array.from(fragment.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          output += node.textContent || '';
          return;
        }
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.classList.contains('ask-composer-token')) {
          output += '[[aip:' + serializeTokenPayload({
            key: node.dataset.tokenKey || '',
            kind: node.dataset.tokenKind || '',
            title: node.dataset.tokenTitle || '',
            iconText: node.dataset.tokenIcon || '',
            refId: node.dataset.refId || '',
            tokenRole: node.dataset.tokenRole || '',
            capabilityId: node.dataset.capabilityId || '',
            capabilityType: node.dataset.capabilityType || '',
            capabilityCategory: node.dataset.capabilityCategory || '',
            capabilityContent: node.dataset.capabilityContent || '',
          }) + ']]';
          return;
        }
        output += serializeComposerFragment(node);
      });
      return output;
    }

    function getVisibleTextFromFragment(fragment) {
      let output = '';
      Array.from(fragment.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          output += node.textContent || '';
          return;
        }
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.classList.contains('ask-composer-token') || node.hasAttribute('data-aip-payload')) {
          output += node.dataset.tokenTitle || node.textContent || '';
          return;
        }
        output += getVisibleTextFromFragment(node);
      });
      return output;
    }

    function buildClipboardHtmlFromFragment(fragment) {
      let output = '';
      Array.from(fragment.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          output += escapeHtml(node.textContent || '');
          return;
        }
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.classList.contains('ask-composer-token')) {
          output += '<span data-aip-payload="' + serializeTokenPayload({
            key: node.dataset.tokenKey || '',
            kind: node.dataset.tokenKind || '',
            title: node.dataset.tokenTitle || '',
            iconText: node.dataset.tokenIcon || '',
            refId: node.dataset.refId || '',
            tokenRole: node.dataset.tokenRole || '',
            capabilityId: node.dataset.capabilityId || '',
            capabilityType: node.dataset.capabilityType || '',
            capabilityCategory: node.dataset.capabilityCategory || '',
            capabilityContent: node.dataset.capabilityContent || '',
          }) + '">' + escapeHtml(node.dataset.tokenTitle || '') + '</span>';
          return;
        }
        output += buildClipboardHtmlFromFragment(node);
      });
      return output;
    }

    function insertComposerPayloadToken(payload) {
      if (!payload) {
        return;
      }
      if (payload.key === 'context') {
        setContextCardVisible(true);
        return;
      }
      if (payload.key === 'selection') {
        setSelectedText(payload.title || '');
        return;
      }
      if (payload.capabilityId || payload.tokenRole === 'capability') {
        const capabilityInstanceId = payload.capabilityId || ('cap-' + state.nextCapabilityId++);
        const existingCapability = state.capabilities.find((item) => item.id === capabilityInstanceId);
        if (!existingCapability) {
          state.capabilities.push({
            id: capabilityInstanceId,
            title: payload.title || '',
            iconText: payload.iconText || '',
            type: payload.capabilityType || '',
            category: payload.capabilityCategory || 'format',
            content: payload.capabilityContent || '',
          });
        }
        const token = createComposerTokenElement({
          key: payload.key || ('cap:' + capabilityInstanceId),
          kind: payload.kind || 'capability',
          title: payload.title || '',
          iconText: payload.iconText || '',
          tokenRole: 'capability',
          capabilityId: capabilityInstanceId,
          capabilityType: payload.capabilityType || '',
          capabilityCategory: payload.capabilityCategory || 'format',
          capabilityContent: payload.capabilityContent || '',
        });
        bindCapabilityTokenRemoval(token, capabilityInstanceId);
        state.inputMain.insertBefore(token, state.inlineRefRow);
        return;
      }
      if (payload.refId) {
        const existing = state.refs.find((ref) => ref.id === payload.refId);
        if (!existing) {
          state.refs.push({
            id: payload.refId,
            kind: payload.kind,
            title: payload.title || '',
            subtitle: '',
            meta: '',
            iconText: payload.iconText || '',
            source: payload.kind,
          });
        }
        insertNodeAtComposerCaret(createComposerTokenElement(payload));
      }
    }

    function insertSerializedComposerText(text) {
      const cmdMatch = text.match(/^\[\[aip-cmd:([^\]]+)]]/);
      if (cmdMatch) {
        try {
          selectCommand(decodeURIComponent(cmdMatch[1]));
        } catch (error) {}
        text = text.slice(cmdMatch[0].length);
      }
      const pattern = /\[\[aip:([^[\]]+)]]/g;
      let lastIndex = 0;
      let match;
      while ((match = pattern.exec(text))) {
        const plain = text.slice(lastIndex, match.index);
        if (plain) {
          insertNodeAtComposerCaret(document.createTextNode(plain));
        }
        const payload = parseSerializedTokenPayload(match[1]);
        insertComposerPayloadToken(payload);
        lastIndex = pattern.lastIndex;
      }
      const trailing = text.slice(lastIndex);
      if (trailing) {
        insertNodeAtComposerCaret(document.createTextNode(trailing));
      }
      syncReferenceStrip();
    }

    function insertPlainComposerText(text) {
      const normalized = String(text || '').replace(/\r\n?/g, '\n');
      if (!normalized) {
        return;
      }
      insertNodeAtComposerCaret(document.createTextNode(normalized));
    }

    function insertClipboardHtmlWithTokens(html) {
      const template = document.createElement('template');
      template.innerHTML = String(html || '');
      const walk = (parent) => {
        Array.from(parent.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent) {
              insertNodeAtComposerCaret(document.createTextNode(node.textContent));
            }
            return;
          }
          if (!(node instanceof HTMLElement)) {
            return;
          }
          const payload = parseSerializedTokenPayload(node.getAttribute('data-aip-payload') || '');
          if (payload) {
            insertComposerPayloadToken(payload);
            return;
          }
          walk(node);
          if (/^(?:div|p|br)$/i.test(node.tagName)) {
            insertNodeAtComposerCaret(document.createTextNode('\n'));
          }
        });
      };
      walk(template.content);
      syncStateFromComposerDom();
    }

    function syncReferenceStrip() {
      const hasRefs = state.refs.length > 0;
      const hasSelectedText = Boolean(state.selectedText);
      state.contextCard.classList.toggle('hidden', !state.contextCardVisible);
      state.selectionCard.classList.toggle('hidden', !hasSelectedText);
      state.inputContext.classList.toggle('hidden', !state.contextCardVisible && !hasRefs && !hasSelectedText);
      renderReferenceCards();
      syncInlineReferenceTokens();
      syncComposerTokenDom();
      syncCommandsRow();
    }

    function setContextCardVisible(visible) {
      if (!visible && state.focusedComposerTokenKey === 'context') {
        clearFocusedComposerToken();
      }
      state.contextCardVisible = visible;
      syncReferenceStrip();
    }

    function hasReferenceForTab(tabLike) {
      const tabId = String(tabLike?.id || tabLike?.raw?.id || '');
      const url = String(tabLike?.url || tabLike?.raw?.url || tabLike?.raw?.pendingUrl || '');
      return state.refs.some((ref) => {
        return refMatchesTab(ref, tabLike);
      });
    }

    function refMatchesTab(ref, tabLike) {
      if (!ref || ref.kind !== 'tab') {
        return false;
      }
      const tabId = String(tabLike?.id || tabLike?.raw?.id || '');
      const url = String(tabLike?.url || tabLike?.raw?.url || tabLike?.raw?.pendingUrl || '');
      const refTabId = String(ref.raw?.id || '');
      const refUrl = String(ref.raw?.url || ref.raw?.pendingUrl || '');
      return (tabId && refTabId && tabId === refTabId) || (url && refUrl && url === refUrl);
    }

    function findReferenceForTab(tabLike) {
      return state.refs.find((ref) => {
        if (ref.kind !== 'tab') {
          return false;
        }
        return refMatchesTab(ref, tabLike);
      });
    }

    function setContextFromTab(tab) {
      if (!tab) {
        return;
      }
      const normalized = normalizeTab(tab);
      state.currentContext = normalized;
      state.ctxFavicon.textContent = normalized.iconText || 'A';
      state.ctxFavicon.style.background = normalized.color;
      state.ctxTitle.textContent = normalized.title;
      state.ctxUrl.textContent = normalized.subtitle || normalized.raw?.url || '';
      syncReferenceStrip();
    }

    async function syncContext(options) {
      const settings = Object.assign({
        addCurrentPageReference: false,
      }, options || {});
      try {
        const tab = await getCurrentTab();
        setContextFromTab(tab);
        if (settings.addCurrentPageReference && state.currentContext) {
          setAutoCurrentPageReference(state.currentContext);
        }
      } catch (error) {
        if (!state.currentContext) {
          setContextFromTab({
            title: t('currentPage'),
            url: '',
          });
        }
      }
    }

    function setSelectedText(text) {
      const normalized = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 140);
      if (normalized === state.selectedText) {
        return;
      }
      hideSendValidation();
      if (!normalized && state.focusedComposerTokenKey === 'selection') {
        clearFocusedComposerToken();
      }
      state.selectedText = normalized;
      state.selectionTitle.textContent = normalized;
      syncReferenceStrip();
    }

    async function clearSelectedTextContext() {
      setSelectedText('');
      try {
        await clearCurrentTabSelection();
      } catch (error) {}
    }

    async function syncSelectedText() {
      try {
        setSelectedText(await getCurrentTabSelection());
      } catch (error) {
        setSelectedText('');
      }
    }

    state.syncContext = syncContext;
    state.syncSelectedText = syncSelectedText;
    state.setSelectedTextContext = setSelectedText;
    state.focusComposer = focusComposer;

    function startSelectionPolling() {
      if (state.selectionPollId) {
        clearInterval(state.selectionPollId);
      }
      state.selectionPollId = window.setInterval(() => {
        if (!isPanelVisible() || state.isBusy) {
          return;
        }
        syncSelectedText();
      }, PERFORMANCE_CONFIG.selectionPollIntervalMs);
      if (state.selectionEventHandlersBound) {
        return;
      }
      state.selectionEventHandlersBound = true;
      document.addEventListener('selectionchange', syncSelectedTextSoon, { passive: true });
      window.addEventListener('mouseup', syncSelectedTextSoon, { passive: true });
      window.addEventListener('keyup', (event) => {
        if (event.key.startsWith('Arrow') || event.key === 'Shift') {
          syncSelectedTextSoon();
        }
      }, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          syncSelectedTextSoon();
        }
      }, { passive: true });
    }

    function isInputEmpty() {
      return Array.from(state.inputField.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent || '')
        .join('')
        .replace(/[\s\u200B\uFEFF]/g, '').length === 0;
    }

    function hideSendValidation() {
      if (!state.sendValidation) {
        return;
      }
      state.sendValidation.textContent = '';
      state.sendValidation.classList.add('hidden');
    }

    function showSendValidation(message) {
      if (!state.sendValidation) {
        return;
      }
      state.sendValidation.textContent = message;
      state.sendValidation.classList.remove('hidden');
      state.inputField.focus();
    }

    function getSendValidationMessage(sequenceParts, text) {
      const hasManualText = Boolean(String(text || '').trim());
      const hasInformation =
        hasManualText ||
        state.refs.length > 0 ||
        Boolean(state.selectedText) ||
        Boolean(state.contextCardVisible && state.currentContext);
      const hasInstruction =
        hasManualText ||
        Boolean(state.activeCmd) ||
        sequenceParts.some((part) => part.type === 'ref' && part.tokenRole === 'capability');
      if (hasInformation && hasInstruction) {
        return '';
      }
      if (!hasInformation && !hasInstruction) {
        return t('sendValidationEmpty');
      }
      return hasInformation ? t('sendValidationNeedsInstruction') : t('sendValidationNeedsInfo');
    }

    function hideSuggestions() {
      state.suggestionItems = [];
      state.suggestionSections = [];
      state.suggestionToken = null;
      state.suggestionSelectedIndex = 0;
      state.suggestionMode = null;
      state.atSuggestionData = null;
      state.suggestionDropdown.style.display = 'none';
      state.suggestionDropdown.classList.remove('visible');
      state.suggestionDropdown.setAttribute('aria-hidden', 'true');
      state.suggestionBody.innerHTML = '';
    }

    function showSuggestions() {
      state.suggestionDropdown.style.display = 'flex';
      state.suggestionDropdown.classList.add('visible');
      state.suggestionDropdown.setAttribute('aria-hidden', 'false');
    }

    function createMessageReferenceStack(cards) {
      if (!cards.length) {
        return null;
      }
      const createRefCard = (card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'ask-msg-ref-card';
        if (index !== undefined && index !== null) {
          cardEl.dataset.stackIndex = String(index);
        }
        const icon = document.createElement('div');
        icon.className = 'ask-msg-ref-card-icon';
        icon.textContent = card.iconText;
        const info = document.createElement('div');
        info.className = 'ask-msg-ref-card-info';
        const title = document.createElement('div');
        title.className = 'ask-msg-ref-card-title';
        title.textContent = card.title;
        const subtitle = document.createElement('div');
        subtitle.className = 'ask-msg-ref-card-subtitle';
        subtitle.textContent = card.subtitle;
        info.append(title, subtitle);
        cardEl.append(icon, info);
        return cardEl;
      };
      const group = document.createElement('div');
      group.className = 'ask-msg-ref-group';
      const stack = document.createElement('div');
      stack.className = 'ask-msg-ref-stack';
      stack.setAttribute('role', 'button');
      stack.setAttribute('tabindex', '0');
      stack.setAttribute('aria-expanded', 'false');
      stack.dataset.cardCount = String(cards.length);
      stack.style.setProperty('--aip-ref-expanded-count', String(Math.max(cards.length, 1)));
      const renderStack = () => {
        stack.innerHTML = '';
        cards.forEach((card, index) => {
          const cardEl = createRefCard(card, index);
          cardEl.style.setProperty('--aip-stack-order', String(index));
          stack.appendChild(cardEl);
        });
        if (cards.length > 3) {
          const more = document.createElement('div');
          more.className = 'ask-msg-ref-more';
          more.textContent = '+' + (cards.length - 3);
          stack.appendChild(more);
        }
      };
      renderStack();
      const clearHoveredCard = () => {
        stack.dataset.hoveredIndex = '';
      };
      const setExpanded = (expanded) => {
        clearHoveredCard();
        stack.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      };
      const toggleExpanded = () => {
        const nextExpanded = stack.getAttribute('aria-expanded') !== 'true';
        setExpanded(nextExpanded);
      };
      stack.addEventListener('pointerover', (event) => {
        if (stack.getAttribute('aria-expanded') === 'true') {
          return;
        }
        const target = event.target instanceof Element ? event.target : null;
        const cardEl = target?.closest('.ask-msg-ref-card');
        if (!cardEl) {
          return;
        }
        stack.dataset.hoveredIndex = cardEl.dataset.stackIndex || '';
      });
      stack.addEventListener('pointerout', (event) => {
        if (!stack.contains(event.relatedTarget)) {
          clearHoveredCard();
        }
      });
      stack.addEventListener('click', toggleExpanded);
      stack.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleExpanded();
        }
      });
      group.appendChild(stack);
      return group;
    }

    function createTurnData() {
      const sequenceParts = getComposerSequenceParts();
      const text = sequenceParts.filter((part) => part.type === 'text').map((part) => part.text).join('').trim();
      const capabilitySnapshots = sequenceParts
        .filter((part) => part.type === 'ref' && part.tokenRole === 'capability')
        .map((part) => ({
          id: part.capabilityId || '',
          type: part.capabilityType || '',
          category: part.capabilityCategory || 'format',
          title: part.title,
          iconText: part.iconText || '',
          content: part.capabilityContent || '',
        }));
      const commandDefinition = getCommandDefinition(state.activeCmd);
      const contextSnapshot = state.contextCardVisible && state.currentContext
        ? {
          kind: 'context',
          title: state.currentContext.title,
          subtitle: state.currentContext.subtitle || '',
          iconText: state.currentContext.iconText || 'A',
          raw: state.currentContext.raw || state.currentContext,
        }
        : null;
      const selectedTextSnapshot = state.selectedText
        ? {
          kind: 'selection',
          title: state.selectedText,
          subtitle: t('selectedText'),
          iconText: 'AI',
        }
        : null;
      const refSnapshots = state.refs.map((ref) => ({
        id: ref.id,
        kind: ref.kind,
        title: ref.title,
        subtitle: ref.subtitle || '',
        meta: ref.meta || '',
        iconText: ref.kind === 'file' ? 'D' : (ref.iconText || ref.title.slice(0, 1).toUpperCase()),
        raw: ref.raw || null,
        rawBlob: ref.rawBlob || null,
        rawFile: ref.rawFile || null,
        mime: ref.mime || '',
        autoCurrentPage: Boolean(ref.autoCurrentPage),
      }));
      const headerCards = [];
      if (contextSnapshot) {
        headerCards.push({
          kind: contextSnapshot.kind,
          title: contextSnapshot.title,
          subtitle: contextSnapshot.subtitle,
          iconText: contextSnapshot.iconText,
        });
      }
      if (selectedTextSnapshot) {
        headerCards.push({
          kind: selectedTextSnapshot.kind,
          title: selectedTextSnapshot.title,
          subtitle: selectedTextSnapshot.subtitle,
          iconText: selectedTextSnapshot.iconText,
        });
      }
      refSnapshots.forEach((ref) => {
        headerCards.push({
          kind: ref.kind,
          title: ref.title,
          subtitle: ref.kind === 'file'
            ? ((ref.title.split('.').pop() || '').toLowerCase() || 'file')
            : (ref.subtitle || ''),
          iconText: ref.kind === 'file' ? 'D' : (ref.iconText || ref.title.slice(0, 1).toUpperCase()),
        });
      });
      const aiReadItems = [];
      if (contextSnapshot) {
        aiReadItems.push({
          kind: contextSnapshot.kind,
          title: contextSnapshot.title,
        });
      }
      if (selectedTextSnapshot) {
        aiReadItems.push({
          kind: selectedTextSnapshot.kind,
          title: selectedTextSnapshot.title,
        });
      }
      refSnapshots.forEach((ref) => {
        aiReadItems.push({
          kind: ref.kind,
          title: ref.title,
        });
      });
      return {
        id: state.editingTurnId || ('turn-' + state.nextTurnId++),
        activeCmd: state.activeCmd,
        activeCmdPrompt: commandDefinition?.prompt || '',
        sequenceParts,
        capabilitySnapshots,
        text,
        contextSnapshot,
        selectedTextSnapshot,
        refSnapshots,
        headerCards,
        aiReadItems,
        fileRefs: refSnapshots.filter((ref) => ref.kind === 'file'),
        timestamp: formatMessageTime(),
        serialized: serializeMessagePayload(sequenceParts, state.activeCmd),
        visibleText: buildVisibleTextFromSequence(sequenceParts, state.activeCmd),
        aiReplyText: '',
        aiReasoningText: '',
        apiUserMessage: '',
        apiUserMessages: [],
      };
    }

    function findTurnNode(turnId) {
      return state.messages.querySelector('.ask-turn[data-turn-id="' + turnId + '"]');
    }

    function animateTurnSendFlight(turnNode) {
      const userMsg = turnNode?.querySelector('.ask-msg-user');
      if (!userMsg || !panelRoot?.isConnected) {
        return;
      }
      const sourceNode = state.inputBox;
      const sourceRect = sourceNode?.getBoundingClientRect?.();
      const targetRect = userMsg.getBoundingClientRect();
      if (!sourceRect || !targetRect || targetRect.width <= 0 || targetRect.height <= 0) {
        return;
      }
      const ghost = userMsg.cloneNode(true);
      ghost.classList.add('ask-send-flight-ghost');
      const targetStyle = window.getComputedStyle(userMsg);
      const sourceStyle = window.getComputedStyle(state.inputBox);
      const startWidth = Math.max(Math.min(sourceRect.width - 22, 360), Math.min(targetRect.width + 120, sourceRect.width - 22));
      const startHeight = Math.max(40, Math.min(sourceRect.height - 18, 72));
      const startLeft = sourceRect.right - startWidth - 10;
      const startTop = sourceRect.bottom - startHeight - 10;
      ghost.style.width = startWidth + 'px';
      ghost.style.height = startHeight + 'px';
      ghost.style.left = startLeft + 'px';
      ghost.style.top = startTop + 'px';
      ghost.style.padding = '10px 14px 12px';
      ghost.style.borderRadius = window.getComputedStyle(state.inputBox).borderRadius;
      ghost.style.background = sourceStyle.background;
      ghost.style.border = sourceStyle.border;
      ghost.style.color = targetStyle.color;
      ghost.style.opacity = '0.98';
      ghost.style.boxShadow = window.getComputedStyle(state.inputBox).boxShadow;
      ghost.querySelectorAll('.ask-msg-text, .ask-msg-inline-ref, .ask-msg-cmd-tag').forEach((node) => {
        node.style.opacity = '0';
        node.style.transform = 'translateY(6px) scale(.985)';
      });
      userMsg.classList.add('is-send-arriving');
      document.body.appendChild(ghost);
      const duration = 230;
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const startState = {
        left: startLeft,
        top: startTop,
        width: startWidth,
        height: startHeight,
      };
      const revealNodes = Array.from(ghost.querySelectorAll('.ask-msg-text, .ask-msg-inline-ref, .ask-msg-cmd-tag'));
      let startTime = 0;
      const step = (timestamp) => {
        if (!startTime) {
          startTime = timestamp;
        }
        const progress = Math.min(1, (timestamp - startTime) / duration);
        const eased = easeOut(progress);
        const liveTargetRect = userMsg.getBoundingClientRect();
        const currentLeft = startState.left + ((liveTargetRect.left) - startState.left) * eased;
        const currentTop = startState.top + ((liveTargetRect.top) - startState.top) * eased;
        const currentWidth = startState.width + (liveTargetRect.width - startState.width) * eased;
        const currentHeight = startState.height + (liveTargetRect.height - startState.height) * eased;
        ghost.style.left = currentLeft + 'px';
        ghost.style.top = currentTop + 'px';
        ghost.style.width = currentWidth + 'px';
        ghost.style.height = currentHeight + 'px';
        ghost.style.borderRadius = progress < 0.7 ? window.getComputedStyle(state.inputBox).borderRadius : targetStyle.borderRadius;
        ghost.style.background = progress < 0.42 ? sourceStyle.background : targetStyle.background;
        ghost.style.border = progress < 0.42 ? sourceStyle.border : targetStyle.border;
        ghost.style.boxShadow = progress < 0.42 ? window.getComputedStyle(state.inputBox).boxShadow : targetStyle.boxShadow;
        revealNodes.forEach((node) => {
          const revealProgress = Math.max(0, Math.min(1, (progress - 0.18) / 0.55));
          node.style.opacity = String(revealProgress);
          node.style.transform = 'translateY(' + ((1 - revealProgress) * 6) + 'px) scale(' + (0.985 + (0.015 * revealProgress)) + ')';
        });
        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }
        userMsg.classList.remove('is-send-arriving');
        ghost.remove();
      };
      requestAnimationFrame(step);
    }

    function clearPendingAiTask(turnId) {
      const task = state.pendingAiTasks.get(turnId);
      if (!task) {
        return;
      }
      try {
        task.abortController?.abort?.();
      } catch (error) {}
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      state.pendingAiTasks.delete(turnId);
      if (state.currentStreamingTurnId === turnId) {
        state.currentStreamingTurnId = null;
      }
      syncBusyState();
    }

    function removeTurnsAfter(turnNode) {
      if (!turnNode) {
        return;
      }
      let next = turnNode.nextElementSibling;
      while (next) {
        const current = next;
        next = next.nextElementSibling;
        const removedTurnId = current.dataset.turnId;
        if (removedTurnId) {
          clearPendingAiTask(removedTurnId);
        }
        current.remove();
      }
    }

    function createAiMessageScaffold(turnData) {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'ask-msg ask-msg-ai';
      const processing = document.createElement('div');
      processing.className = 'ask-msg-ai-processing';
      const thinking = document.createElement('div');
      thinking.className = 'ask-msg-ai-thinking hidden';
      thinking.textContent = 'Thinking...';
      processing.appendChild(thinking);
      if (turnData.aiReadItems.length) {
        const reading = document.createElement('div');
        reading.className = 'ask-msg-ai-reading';
        reading.innerHTML = '<span>@</span><span>Reading ' + turnData.aiReadItems.length + ' attachments</span>';
        processing.appendChild(reading);
        const list = document.createElement('div');
        list.className = 'ask-msg-ai-reading-list';
        turnData.aiReadItems.forEach((ref) => {
          const pill = document.createElement('div');
          pill.className = 'ask-msg-ai-reading-pill';
          pill.dataset.readingIndex = String(list.childElementCount);
          const icon = document.createElement('span');
          icon.className = 'ask-msg-ai-reading-pill-icon';
          icon.textContent = ref.kind === 'file' ? 'D' : (ref.kind === 'selection' ? 'AI' : '◦');
          const label = document.createElement('span');
          label.className = 'ask-msg-ai-reading-pill-text';
          label.textContent = ref.title;
          pill.append(icon, label);
          list.appendChild(pill);
        });
        processing.appendChild(list);
      }
      const thoughtWrap = document.createElement('div');
      thoughtWrap.className = 'ask-msg-ai-thought-wrap';
      thoughtWrap.setAttribute('aria-expanded', 'false');
      const thoughtButton = document.createElement('button');
      thoughtButton.type = 'button';
      thoughtButton.className = 'ask-msg-ai-thought';
      thoughtButton.innerHTML = '<span>Thought for 0 seconds</span><span class="ask-msg-ai-thought-arrow">›</span>';
      const thoughtPanel = document.createElement('div');
      thoughtPanel.className = 'ask-msg-ai-thought-panel';
      thoughtWrap.append(thoughtButton, thoughtPanel);
      thoughtButton.addEventListener('click', () => {
        if (!thoughtWrap.dataset.hasReasoning) {
          return;
        }
        thoughtWrap.setAttribute('aria-expanded', thoughtWrap.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      });
      const answer = document.createElement('div');
      answer.className = 'ask-msg-ai-answer';
      aiMsg.append(processing, thoughtWrap, answer);
      if (!turnData.aiReadItems.length) {
        processing.classList.add('hidden');
      }
      return {
        aiMsg,
        processing,
        thinking,
        readingList: processing.querySelector('.ask-msg-ai-reading-list'),
        thoughtWrap,
        thoughtButton,
        thoughtPanel,
        answer,
      };
    }

    async function buildTurnAttachments(turnData) {
      const attachmentTasks = [];
      if (turnData.contextSnapshot) {
        attachmentTasks.push((async () => {
          const snapshot = await getTabContentSnapshot(turnData.contextSnapshot.raw || turnData.contextSnapshot);
          return {
            kind: 'current-page',
            title: snapshot.title || turnData.contextSnapshot.title,
            subtitle: snapshot.subtitle || getHostFromUrl(snapshot.url || turnData.contextSnapshot.raw?.url || ''),
            url: snapshot.url || turnData.contextSnapshot.raw?.url || '',
            metaDescription: snapshot.metaDescription || '',
            headings: snapshot.headings || [],
            imageAlts: snapshot.imageAlts || [],
            importantLinks: snapshot.importantLinks || [],
            jsonLd: snapshot.jsonLd || [],
            extractionSource: snapshot.extractionSource || '',
            content: snapshot.content || '',
          };
        })());
      }
      if (turnData.selectedTextSnapshot) {
        attachmentTasks.push(Promise.resolve({
          kind: 'selected-text',
          title: truncateText(turnData.selectedTextSnapshot.title, 120),
          subtitle: t('selectedText'),
          content: turnData.selectedTextSnapshot.title,
        }));
      }
      (turnData.refSnapshots || []).forEach((ref) => {
        if (ref.kind === 'file') {
          attachmentTasks.push((async () => ({
            kind: 'file',
            title: ref.title,
            subtitle: ref.subtitle || ref.meta || 'file',
            content: await readBlobPreview(ref.rawBlob || ref.rawFile || ref.raw, ref.mime || ref.raw?.mime || ref.raw?.type),
          }))());
          return;
        }
        attachmentTasks.push((async () => {
          const snapshot = await getTabContentSnapshot(ref.raw || ref);
          return {
            kind: 'referenced-page',
            title: snapshot.title || ref.title,
            subtitle: snapshot.subtitle || getHostFromUrl(snapshot.url || ref.raw?.url || ref.subtitle || ''),
            url: snapshot.url || ref.raw?.url || '',
            metaDescription: snapshot.metaDescription || '',
            headings: snapshot.headings || [],
            imageAlts: snapshot.imageAlts || [],
            importantLinks: snapshot.importantLinks || [],
            jsonLd: snapshot.jsonLd || [],
            extractionSource: snapshot.extractionSource || '',
            content: snapshot.content || '',
          };
        })());
      });
      const results = await Promise.allSettled(attachmentTasks);
      return results
        .filter((entry) => entry.status === 'fulfilled' && entry.value)
        .map((entry) => entry.value);
    }

    function buildUserTurnPayload(turnData, attachments) {
      const capabilityBlocks = (turnData.capabilitySnapshots || []).map((item) => (
        '<attachment><assistant-capability type="' + escapeXmlAttribute(item.type) + '" category="' + escapeXmlAttribute(item.category) + '"><content>' + escapeXmlText(item.content) + '</content></assistant-capability></attachment>'
      ));
      const attachmentBlocks = attachments.map((item) => {
        if (item.kind === 'current-page') {
          const content = [
            item.metaDescription ? ('Meta Description: ' + item.metaDescription) : '',
            item.headings?.length ? ('Headings:\n- ' + item.headings.join('\n- ')) : '',
            item.jsonLd?.length ? ('Structured Data:\n- ' + item.jsonLd.join('\n- ')) : '',
            item.imageAlts?.length ? ('Image Alts:\n- ' + item.imageAlts.join('\n- ')) : '',
            item.importantLinks?.length ? ('Important Links:\n- ' + item.importantLinks.join('\n- ')) : '',
            item.extractionSource ? ('Extraction Source: ' + item.extractionSource) : '',
            item.content ? ('Main Content:\n' + item.content) : 'Main Content: (unavailable)',
          ].filter(Boolean).join('\n\n');
          return '<attachment><referenced-webpage type="current-page" title="' + escapeXmlAttribute(item.title) + '" url="' + escapeXmlAttribute(item.url) + '"><content>' + escapeXmlText(content) + '</content></referenced-webpage></attachment>';
        }
        if (item.kind === 'selected-text') {
          return '<attachment><selected-text title="' + escapeXmlAttribute(item.title) + '"><content>' + escapeXmlText(item.content) + '</content></selected-text></attachment>';
        }
        if (item.kind === 'referenced-page') {
          const content = [
            item.metaDescription ? ('Meta Description: ' + item.metaDescription) : '',
            item.headings?.length ? ('Headings:\n- ' + item.headings.join('\n- ')) : '',
            item.jsonLd?.length ? ('Structured Data:\n- ' + item.jsonLd.join('\n- ')) : '',
            item.imageAlts?.length ? ('Image Alts:\n- ' + item.imageAlts.join('\n- ')) : '',
            item.importantLinks?.length ? ('Important Links:\n- ' + item.importantLinks.join('\n- ')) : '',
            item.extractionSource ? ('Extraction Source: ' + item.extractionSource) : '',
            item.content ? ('Main Content:\n' + item.content) : 'Main Content: (unavailable)',
          ].filter(Boolean).join('\n\n');
          return '<attachment><referenced-webpage type="referenced-page" title="' + escapeXmlAttribute(item.title) + '"' + (item.url ? (' url="' + escapeXmlAttribute(item.url) + '"') : '') + '><content>' + escapeXmlText(content) + '</content></referenced-webpage></attachment>';
        }
        return '<attachment><referenced-file title="' + escapeXmlAttribute(item.title) + '"' + (item.subtitle ? (' meta="' + escapeXmlAttribute(item.subtitle) + '"') : '') + '><content>' + escapeXmlText(item.content || 'Extracted text: (unavailable, use filename and metadata only)') + '</content></referenced-file></attachment>';
      });
      const messages = capabilityBlocks.concat(attachmentBlocks);
      messages.push('<user-message>' + escapeXmlText(turnData.visibleText || '(empty)') + '</user-message>');
      if (turnData.activeCmdPrompt) {
        messages.push('<user-message>' + escapeXmlText(turnData.activeCmdPrompt) + '</user-message>');
      }
      return messages;
    }

    function extractLeadSentence(text, maxLength) {
      const normalized = String(text || '').replace(/\s+/g, ' ').trim();
      if (!normalized) {
        return '';
      }
      const match = normalized.match(/^(.+?[.!?。！？])(?:\s|$)/);
      const sentence = match?.[1] || normalized;
      return truncateText(sentence, maxLength || 220);
    }

    function buildCompactUserText(data) {
      const visible = truncateText(String(data?.visibleText || '').trim(), 240);
      if (visible) {
        return visible;
      }
      const titles = [];
      if (data?.contextSnapshot?.title) {
        titles.push(data.contextSnapshot.title);
      }
      (data?.refSnapshots || []).slice(0, 3).forEach((ref) => {
        if (ref?.title) {
          titles.push(ref.title);
        }
      });
      return titles.length ? ('Attachments: ' + titles.join(', ')) : '(empty)';
    }

    function buildSummaryLineForTurn(data, index) {
      const userText = buildCompactUserText(data);
      const aiText = extractLeadSentence(data?.aiReplyText || '', 220);
      const refTitles = (data?.headerCards || [])
        .map((item) => String(item?.title || '').trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(', ');
      return [
        '[' + (index + 1) + '] User: ' + userText,
        aiText ? ('Assistant: ' + aiText) : '',
        refTitles ? ('Refs: ' + refTitles) : '',
      ].filter(Boolean).join(' | ');
    }

    function buildConversationSummary(turns) {
      const recentWindow = CONVERSATION_MEMORY_CONFIG.recentTurns;
      const olderTurns = turns.slice(0, Math.max(0, turns.length - recentWindow));
      const summarizeCount = Math.floor(olderTurns.length / CONVERSATION_MEMORY_CONFIG.summaryChunkTurns) * CONVERSATION_MEMORY_CONFIG.summaryChunkTurns;
      if (summarizeCount <= 0) {
        state.conversationMemory.summary = '';
        state.conversationMemory.summarizedTurnCount = 0;
        state.lastSummaryDebug = {
          summary: '',
          summarizedTurnCount: 0,
          totalTurns: turns.length,
          recentWindow,
        };
        logAiDebug('Conversation Summary', {
          mode: 'cleared',
          totalTurns: turns.length,
          summarizedTurnCount: 0,
          recentWindow,
          summary: '',
        });
        return {
          summary: '',
          summarizedTurnCount: 0,
        };
      }
      const lines = olderTurns
        .slice(0, summarizeCount)
        .map((node, index) => buildSummaryLineForTurn(node._askTurnData || {}, index))
        .filter(Boolean);
      const summary = [
        'Conversation memory for earlier turns.',
        'Use this as compressed context for turns older than the recent window.',
        lines.join('\n'),
      ].filter(Boolean).join('\n');
      state.conversationMemory.summary = summary;
      state.conversationMemory.summarizedTurnCount = summarizeCount;
      state.lastSummaryDebug = {
        summary,
        summarizedTurnCount: summarizeCount,
        totalTurns: turns.length,
        recentWindow,
        chunkTurns: CONVERSATION_MEMORY_CONFIG.summaryChunkTurns,
      };
      logAiCompose('Conversation Summary', {
        totalTurns: turns.length,
        summarizedTurnCount: summarizeCount,
        recentWindow,
        chunkTurns: CONVERSATION_MEMORY_CONFIG.summaryChunkTurns,
        summary,
      });
      logAiDebug('Conversation Summary', {
        mode: 'updated',
        totalTurns: turns.length,
        summarizedTurnCount: summarizeCount,
        recentWindow,
        chunkTurns: CONVERSATION_MEMORY_CONFIG.summaryChunkTurns,
        summary,
      });
      return {
        summary,
        summarizedTurnCount: summarizeCount,
      };
    }

    function tokenizeForRetrieval(text) {
      const normalized = String(text || '').toLowerCase();
      return Array.from(new Set(
        normalized
          .split(/[^a-z0-9\u4e00-\u9fff]+/i)
          .map((token) => token.trim())
          .filter((token) => token.length >= 2)
      ));
    }

    function scoreAttachmentCandidate(candidate, tokens) {
      if (!tokens.length) {
        return 0;
      }
      const haystack = [
        candidate.title,
        candidate.subtitle,
        candidate.meta,
        candidate.url,
      ].filter(Boolean).join(' ').toLowerCase();
      let score = 0;
      tokens.forEach((token) => {
        if (haystack.includes(token)) {
          score += 3;
        }
      });
      return score;
    }

    function normalizeAttachmentIdentityParts(parts) {
      return parts
        .map((part) => String(part || '').trim().toLowerCase())
        .filter(Boolean);
    }

    function getAttachmentIdentityKeys(item) {
      if (!item) {
        return [];
      }
      const keys = new Set();
      const addKey = (...parts) => {
        const normalized = normalizeAttachmentIdentityParts(parts);
        if (normalized.length) {
          keys.add(normalized.join('::'));
        }
      };

      const rawUrl = item.url || item.raw?.url || item.raw?.pendingUrl || '';
      const rawId = item.raw?.id || item.id || '';
      const title = item.title || '';
      const subtitle = item.subtitle || item.meta || '';
      const rawName = item.rawFile?.name || item.rawBlob?.name || item.raw?.name || '';

      if (item.kind === 'current-page' || item.kind === 'referenced-page' || item.kind === 'context' || item.kind === 'tab') {
        addKey('page-url', rawUrl);
        addKey('page-id', rawId);
        addKey('page-title-subtitle', title, subtitle);
        return Array.from(keys);
      }
      if (item.kind === 'file' || item.kind === 'referenced-file') {
        addKey('file-id', rawId);
        addKey('file-name', rawName || title);
        addKey('file-title-subtitle', title, subtitle);
        return Array.from(keys);
      }
      if (item.kind === 'selected-text' || item.kind === 'selection') {
        addKey('selection', title || item.content || '');
        return Array.from(keys);
      }
      addKey(item.kind || 'attachment', rawUrl, rawId, title, subtitle);
      return Array.from(keys);
    }

    function buildExplicitAttachmentKeySet(turnData, attachments) {
      const keys = new Set();
      const addItem = (item) => {
        getAttachmentIdentityKeys(item).forEach((key) => keys.add(key));
      };
      if (turnData?.contextSnapshot) {
        addItem(turnData.contextSnapshot);
      }
      if (turnData?.selectedTextSnapshot) {
        addItem(turnData.selectedTextSnapshot);
      }
      (turnData?.refSnapshots || []).forEach(addItem);
      (attachments || []).forEach(addItem);
      return keys;
    }

    function dedupeAttachments(items) {
      const seen = new Set();
      return (items || []).filter((item) => {
        const keys = getAttachmentIdentityKeys(item);
        const duplicate = keys.some((key) => seen.has(key));
        if (duplicate) {
          return false;
        }
        keys.forEach((key) => seen.add(key));
        return true;
      });
    }

    async function buildRetrievedHistoryAttachments(turnData, priorTurnNodes, explicitAttachmentKeys) {
      const tokens = tokenizeForRetrieval(turnData.visibleText || '');
      if (!tokens.length) {
        return [];
      }
      const seenKeys = new Set();
      const candidates = [];
      priorTurnNodes.forEach((node) => {
        const data = node?._askTurnData;
        if (!data) {
          return;
        }
        const addCandidate = (candidate) => {
          if (!candidate) {
            return;
          }
          const candidateIdentityKeys = getAttachmentIdentityKeys(candidate);
          if (candidateIdentityKeys.some((key) => explicitAttachmentKeys?.has(key))) {
            return;
          }
          const key = [
            candidate.kind,
            candidate.url || '',
            candidate.raw?.id || '',
            candidate.title || '',
          ].join('::');
          if (seenKeys.has(key)) {
            return;
          }
          seenKeys.add(key);
          const score = scoreAttachmentCandidate(candidate, tokens);
          if (score <= 0) {
            return;
          }
          candidates.push({ candidate, score });
        };
        if (data.contextSnapshot) {
          addCandidate({
            kind: 'referenced-page',
            title: data.contextSnapshot.title,
            subtitle: data.contextSnapshot.subtitle,
            url: data.contextSnapshot.raw?.url || data.contextSnapshot.raw?.pendingUrl || '',
            raw: data.contextSnapshot.raw || data.contextSnapshot,
          });
        }
        (data.refSnapshots || []).forEach((ref) => {
          addCandidate(ref);
        });
      });
      const topCandidates = candidates
        .sort((a, b) => b.score - a.score)
        .slice(0, CONVERSATION_MEMORY_CONFIG.maxRetrievedAttachments);
      const attachments = await Promise.all(topCandidates.map(async ({ candidate }) => {
        if (candidate.kind === 'file') {
          return {
            kind: 'referenced-file',
            title: candidate.title,
            subtitle: candidate.subtitle || candidate.meta || 'file',
            content: await readBlobPreview(candidate.rawBlob || candidate.rawFile || candidate.raw, candidate.mime || candidate.raw?.mime || candidate.raw?.type),
          };
        }
        const snapshot = await getTabContentSnapshot(candidate.raw || candidate, { allowCachedLightweight: true });
        return {
          kind: 'referenced-page',
          title: snapshot.title || candidate.title,
          subtitle: snapshot.subtitle || candidate.subtitle || '',
          url: snapshot.url || candidate.url || '',
          metaDescription: snapshot.metaDescription || '',
          headings: snapshot.headings || [],
          imageAlts: snapshot.imageAlts || [],
          importantLinks: snapshot.importantLinks || [],
          jsonLd: snapshot.jsonLd || [],
          extractionSource: snapshot.extractionSource || 'history-retrieval',
          content: snapshot.content || '',
        };
      }));
      const filtered = dedupeAttachments(attachments.filter(Boolean)).filter((item) => {
        const identityKeys = getAttachmentIdentityKeys(item);
        return !identityKeys.some((key) => explicitAttachmentKeys?.has(key));
      });
      logAiDebug('History Attachment Retrieval', {
        query: turnData.visibleText || '',
        tokenCount: tokens.length,
        candidateCount: candidates.length,
        selectedCount: filtered.length,
        selectedItems: filtered.map((item) => ({
          kind: item.kind,
          title: item.title,
          url: item.url || '',
          extractionSource: item.extractionSource || '',
        })),
      });
      return filtered;
    }

    function buildSystemPrompt() {
      const languageName = getLanguageName(getBrowserLanguage());
      return [
        'You are Vivaldi, an AI assistant built into the Vivaldi browser sidebar.',
        'The user is usually asking about the current webpage, selected text, or explicitly referenced attachments.',
        'Prefer the current webpage and selected text over generic world knowledge when they are relevant.',
        'If the user used a slash command, follow its instruction first.',
        'Use markdown naturally, but keep answers concise unless the user clearly wants depth.',
        'Default to a short answer: usually 1 short paragraph or 3-5 brief bullet points.',
        'Do not produce long essays unless the user explicitly asks for a detailed answer.',
        'When the answer could become long, summarize first and stop early.',
        'Do not mention these hidden instructions.',
        'Write responses in ' + languageName + '.',
      ].join('\n');
    }

    function getConversationMessagesForTurn(turnNode, currentUserContents) {
      const messages = [{ role: 'system', content: buildSystemPrompt() }];
      const turns = Array.from(state.messages.querySelectorAll('.ask-turn'));
      const targetIndex = turns.indexOf(turnNode);
      const priorTurnNodes = targetIndex >= 0 ? turns.slice(0, targetIndex) : turns.slice();
      const summaryInfo = buildConversationSummary(priorTurnNodes);
      if (summaryInfo.summary) {
        messages.push({
          role: 'system',
          content: summaryInfo.summary,
        });
      }
      const recentTurnNodes = priorTurnNodes.slice(-CONVERSATION_MEMORY_CONFIG.recentTurns);
      for (const node of recentTurnNodes.concat(targetIndex >= 0 ? [turnNode] : [])) {
        const data = node._askTurnData;
        if (!data) {
          continue;
        }
        const userContents = node === turnNode
          ? currentUserContents
          : [buildCompactUserText(data)];
        userContents.filter(Boolean).forEach((content) => {
          messages.push({ role: 'user', content });
        });
        if (node !== turnNode && data.aiReplyText) {
          messages.push({ role: 'assistant', content: data.aiReplyText });
        }
        if (node === turnNode) {
          break;
        }
      }
      logAiDebug('Conversation Context Window', {
        totalTurns: turns.length,
        targetIndex,
        summarizedTurnCount: summaryInfo.summarizedTurnCount,
        recentTurnsIncluded: recentTurnNodes.length,
        currentUserMessageCount: currentUserContents.length,
        messageCount: messages.length,
        summary: summaryInfo.summary || '',
      });
      return messages;
    }

    function createChatRequestBody(messages) {
      const isBigModel = /bigmodel\.cn/.test(AI_CONFIG.apiEndpoint);
      const body = {
        model: AI_CONFIG.model,
        messages,
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        stream: true,
        stream_options: { include_usage: true },
      };
      if (isBigModel) {
        body.thinking = { type: 'enabled' };
      }
      return body;
    }

    function applyReasoningUi(scaffold, reasoningText, elapsedSeconds) {
      const hasReasoning = Boolean(String(reasoningText || '').trim());
      scaffold.thoughtWrap.classList.toggle('has-content', hasReasoning);
      scaffold.thoughtWrap.dataset.hasReasoning = hasReasoning ? 'true' : '';
      scaffold.thoughtButton.classList.toggle('has-content', Boolean(reasoningText));
      scaffold.thoughtButton.querySelector('span').textContent = 'Thought for ' + Math.max(1, elapsedSeconds) + ' seconds';
      scaffold.thoughtPanel.textContent = reasoningText || '';
      if (!hasReasoning) {
        scaffold.thoughtWrap.setAttribute('aria-expanded', 'false');
      }
    }

    function finalizeThoughtUi(scaffold, reasoningText, elapsedSeconds) {
      if (state.readingQueueTimer) {
        clearInterval(state.readingQueueTimer);
        state.readingQueueTimer = null;
      }
      scaffold.processing.classList.add('hidden');
      applyReasoningUi(scaffold, reasoningText, elapsedSeconds);
    }

    function showThinkingAnimation(scaffold) {
      scaffold.thinking.classList.remove('hidden');
      scaffold.processing.classList.remove('hidden');
    }

    function startReadingQueue(scaffold) {
      if (state.readingQueueTimer) {
        clearInterval(state.readingQueueTimer);
        state.readingQueueTimer = null;
      }
      const pills = Array.from(scaffold.readingList?.querySelectorAll('.ask-msg-ai-reading-pill') || []);
      if (!pills.length) {
        return;
      }
      const sync = () => {
        pills.forEach((pill, index) => {
          pill.classList.toggle('is-active', index === state.readingQueueIndex % pills.length);
        });
      };
      state.readingQueueIndex = 0;
      sync();
      state.readingQueueTimer = window.setInterval(() => {
        state.readingQueueIndex += 1;
        sync();
      }, 820);
    }

    function getNextRevealLength(text, startIndex) {
      if (startIndex >= text.length) {
        return startIndex;
      }
      const maxChunkLength = 14;
      let index = startIndex;
      let lastBoundary = startIndex;
      while (index < text.length && (index - startIndex) < maxChunkLength) {
        index += 1;
        if (/[,\s.!?;:，。！？；：\n]/.test(text[index - 1] || '')) {
          lastBoundary = index;
          if (index - startIndex >= 4) {
            break;
          }
        }
      }
      return Math.min(text.length, lastBoundary > startIndex ? lastBoundary : index);
    }

    function stopStreamingOutput() {
      if (!state.currentStreamingTurnId) {
        return;
      }
      const turnNode = findTurnNode(state.currentStreamingTurnId);
      const task = state.pendingAiTasks.get(state.currentStreamingTurnId);
      if (task) {
        task.stoppedByUser = true;
        try {
          task.abortController?.abort?.();
        } catch (error) {}
      }
      if (state.readingQueueTimer) {
        clearInterval(state.readingQueueTimer);
        state.readingQueueTimer = null;
      }
      turnNode?.querySelector('.ask-msg-ai-processing')?.classList.add('hidden');
      const answerNode = turnNode?.querySelector('.ask-msg-ai-answer');
      if (answerNode && !answerNode.textContent.trim()) {
        answerNode.textContent = 'Stopped.';
      }
    }

    function openAtSuggestions(query) {
      const safeQuery = String(query || '');
      state.atTabsExpanded = false;
      state.atSuggestionData = null;
      state.suggestionSearchText.textContent = '@' + safeQuery;
      state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">' + escapeHtml(t('preparingSuggestions')) + '</div>';
      showSuggestions();
      loadAtSuggestions(safeQuery);
      state.inputField.focus();
    }

    function openReferenceSuggestions() {
      state.suggestionToken = null;
      openAtSuggestions('');
    }

    async function streamAiForTurn(turnNode, turnData) {
      clearPendingAiTask(turnData.id);
      state.currentStreamingTurnId = turnData.id;
      turnNode.classList.remove('is-ai-complete');
      const aiSlot = turnNode.querySelector('.ask-turn-ai-slot');
      aiSlot.innerHTML = '';
      const scaffold = createAiMessageScaffold(turnData);
      aiSlot.appendChild(scaffold.aiMsg);
      syncBusyState();
      scrollToBottom({ smooth: true });

      if (!AI_CONFIG.apiKey) {
        scaffold.processing.classList.add('hidden');
        scaffold.answer.classList.add('ask-msg-ai-error');
        scaffold.answer.textContent = t('apiKeyMissing');
        turnNode.classList.add('is-ai-complete');
        return;
      }

      const attachments = await buildTurnAttachments(turnData);
      const explicitAttachmentKeys = buildExplicitAttachmentKeySet(turnData, attachments);
      const allTurnNodes = Array.from(state.messages.querySelectorAll('.ask-turn'));
      const turnIndex = allTurnNodes.indexOf(turnNode);
      const priorTurnNodes = turnIndex >= 0 ? allTurnNodes.slice(0, turnIndex) : [];
      const retrievedHistoryAttachments = await buildRetrievedHistoryAttachments(turnData, priorTurnNodes, explicitAttachmentKeys);
      const finalAttachments = dedupeAttachments(attachments.concat(retrievedHistoryAttachments));
      const currentUserMessages = buildUserTurnPayload(turnData, finalAttachments);
      turnData.apiUserMessages = currentUserMessages.slice();
      turnData.apiUserMessage = currentUserMessages.join('\n\n');
      turnNode._askTurnData = turnData;
      const messages = getConversationMessagesForTurn(turnNode, currentUserMessages);
      const body = createChatRequestBody(messages);
      logAiDebug('Raw User Requests', {
        turnId: turnData.id,
        visibleText: turnData.visibleText,
        rawUserRequests: currentUserMessages,
        requestBody: body,
      });
      if (ASK_IN_PAGE_DEBUG) {
        const compiledPrompt = messages.map((message, index) => [
          '# Message ' + (index + 1),
          'role: ' + message.role,
          message.content,
        ].join('\n')).join('\n\n');
        logAiCompose('Compose Payload', {
          turnId: turnData.id,
          activeCommand: turnData.activeCmd || '(none)',
          browserLanguage: getBrowserLanguage(),
          responseLanguage: getLanguageName(getBrowserLanguage()),
          sequenceParts: turnData.sequenceParts,
          headerCards: turnData.headerCards,
          aiReadItems: turnData.aiReadItems,
          attachments,
          currentUserContent: currentUserMessages.join('\n\n'),
          currentUserMessages,
          messages,
          compiledPrompt,
          requestBody: body,
          requestBodyJson: JSON.stringify(body, null, 2),
          endpoint: maskApiEndpoint(AI_CONFIG.apiEndpoint),
        });
      }
      const abortController = new AbortController();
      const timeoutId = window.setTimeout(() => abortController.abort(), AI_CONFIG.timeout);
      state.pendingAiTasks.set(turnData.id, { abortController, timeoutId });
      syncBusyState();
      const startedAt = Date.now();
      let answerText = '';
      let reasoningText = '';
      let rawResponseBody = '';
      const normalizationState = createResponseNormalizationState();
      let displayedLength = 0;
      let playbackLastTick = 0;
      let playbackLastScrollAt = 0;
      let playbackFrameId = 0;
      let playbackStartAt = 0;
      let playbackFinished = false;
      let streamCompleted = false;
      let resolvePlaybackDone = null;
      const playbackDone = new Promise((resolve) => {
        resolvePlaybackDone = resolve;
      });
      startReadingQueue(scaffold);

      function finishPlaybackWithCurrentText() {
        if (playbackFinished) {
          return;
        }
        playbackFinished = true;
        if (playbackFrameId) {
          cancelAnimationFrame(playbackFrameId);
          playbackFrameId = 0;
        }
        displayedLength = answerText.length;
        renderStreamingMarkdown(scaffold.answer, answerText, answerText);
        resolvePlaybackDone?.(cleanModelText(answerText).trim());
      }

      function scheduleAnswerPlayback() {
        if (playbackFrameId || playbackFinished) {
          return;
        }
        playbackFrameId = requestAnimationFrame((timestamp) => {
          playbackFrameId = 0;
          const task = state.pendingAiTasks.get(turnData.id);
          if (task?.stoppedByUser) {
            finishPlaybackWithCurrentText();
            return;
          }
          if (!playbackStartAt) {
            playbackStartAt = timestamp + STREAM_UI_CONFIG.startDelayMs;
          }
          if (timestamp < playbackStartAt) {
            if (displayedLength < answerText.length || !streamCompleted) {
              scheduleAnswerPlayback();
              return;
            }
            finishPlaybackWithCurrentText();
            return;
          }
          if (!playbackLastTick) {
            playbackLastTick = timestamp;
          }
          const elapsed = timestamp - playbackLastTick;
          playbackLastTick = timestamp;
          const chunkBudget = Math.max(1, Math.floor((elapsed / 1000) * STREAM_UI_CONFIG.charsPerSecond));
          let nextLength = displayedLength;
          let remainingBudget = chunkBudget;
          while (remainingBudget > 0 && nextLength < answerText.length) {
            const nextBoundary = getNextRevealLength(answerText, nextLength);
            remainingBudget -= Math.max(1, nextBoundary - nextLength);
            nextLength = nextBoundary;
          }
          if (nextLength === displayedLength && answerText.length > displayedLength) {
            nextLength = getNextRevealLength(answerText, displayedLength);
          }
          if (nextLength !== displayedLength) {
            displayedLength = nextLength;
            renderStreamingMarkdown(scaffold.answer, answerText.slice(0, displayedLength), answerText);
            if (state.autoScrollPinned && (timestamp - playbackLastScrollAt > 90 || displayedLength === answerText.length)) {
              playbackLastScrollAt = timestamp;
              scrollToBottom();
            }
          }
          if (displayedLength < answerText.length || !streamCompleted) {
            scheduleAnswerPlayback();
            return;
          }
          finishPlaybackWithCurrentText();
        });
      }

      try {
        const response = await fetch(AI_CONFIG.apiEndpoint, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + AI_CONFIG.apiKey,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/Gershom-Chen/VivaldiModpack',
            'X-Title': 'Vivaldi Ask in Page',
          },
          body: JSON.stringify(body),
          signal: abortController.signal,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || ('HTTP ' + response.status));
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        if (!reader) {
          const data = await response.json();
          rawResponseBody = JSON.stringify(data, null, 2);
          logAiCompose('AI Response', {
            turnId: turnData.id,
            response: data,
            rawResponseBody,
          });
          logAiDebug('AI Response', {
            turnId: turnData.id,
            rawResponseBody,
            answerText: data?.choices?.[0]?.message?.content || '',
            reasoningText: data?.choices?.[0]?.message?.reasoning_content || data?.choices?.[0]?.message?.reasoning || '',
          });
          appendNormalizedChunk(
            normalizationState,
            'reasoning',
            data?.choices?.[0]?.message?.reasoning_content ||
            data?.choices?.[0]?.message?.reasoning ||
            data?.choices?.[0]?.message?.thinking ||
            ''
          );
          appendNormalizedChunk(
            normalizationState,
            'visible',
            data?.choices?.[0]?.message?.content || ''
          );
          const normalizedResult = finalizeNormalizedResponse(normalizationState);
          reasoningText = normalizedResult.thinkingText;
          answerText = normalizedResult.visibleText;
          if (reasoningText) {
            showThinkingAnimation(scaffold);
          }
          scheduleAnswerPlayback();
          streamCompleted = true;
          finalizeThoughtUi(scaffold, reasoningText, Math.round((Date.now() - startedAt) / 1000));
          const playedText = await playbackDone;
          const finalText = playedText || cleanModelText(answerText).trim() || t('noDisplayBody');
          logAiDebug('AI Response Normalized', {
            turnId: turnData.id,
            visibleText: normalizedResult.visibleText,
            thinkingText: normalizedResult.thinkingText,
            fallbackMode: normalizedResult.fallbackMode,
            confidence: normalizedResult.confidence,
            diagnostics: normalizedResult.diagnostics,
            providerSignals: normalizedResult.providerSignals,
          });
          turnData.aiReasoningText = reasoningText.trim();
          turnData.aiReplyText = finalText;
          if (!(state.pendingAiTasks.get(turnData.id)?.stoppedByUser)) {
            await renderRichAnswer(scaffold.answer, turnData.aiReplyText);
          }
          return;
        }
        while (reader) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data:')) {
              continue;
            }
            const dataLine = line.slice(5).trim();
          if (!dataLine || dataLine === '[DONE]') {
            continue;
          }
            rawResponseBody += dataLine + '\n';
            let parsed;
            try {
              parsed = JSON.parse(dataLine);
            } catch (error) {
              continue;
            }
            const delta = parsed.choices?.[0]?.delta || {};
            const reasoningFieldDelta =
              delta.reasoning_content ||
              delta.reasoning ||
              delta.thinking ||
              parsed.choices?.[0]?.message?.reasoning_content ||
              '';
            const contentDelta = delta.content || parsed.choices?.[0]?.message?.content || '';
            appendNormalizedChunk(normalizationState, 'reasoning', reasoningFieldDelta);
            appendNormalizedChunk(normalizationState, 'visible', contentDelta);
            if (reasoningFieldDelta) {
              showThinkingAnimation(scaffold);
            }
            if (contentDelta) {
              const normalizedResult = finalizeNormalizedResponse(normalizationState);
              answerText = normalizedResult.visibleText;
              reasoningText = normalizedResult.thinkingText;
              if (reasoningText) {
                showThinkingAnimation(scaffold);
              }
              scheduleAnswerPlayback();
            }
          }
        }
        const normalizedResult = finalizeNormalizedResponse(normalizationState);
        reasoningText = normalizedResult.thinkingText;
        answerText = normalizedResult.visibleText;
        scheduleAnswerPlayback();
        streamCompleted = true;
        finalizeThoughtUi(scaffold, reasoningText, Math.round((Date.now() - startedAt) / 1000));
        logAiCompose('AI Response', {
          turnId: turnData.id,
          rawResponseBody: rawResponseBody.trim(),
          answerText,
          reasoningText,
        });
        logAiDebug('AI Response', {
          turnId: turnData.id,
          rawResponseBody: rawResponseBody.trim(),
          answerText,
          reasoningText,
        });
        logAiDebug('AI Response Normalized', {
          turnId: turnData.id,
          visibleText: normalizedResult.visibleText,
          thinkingText: normalizedResult.thinkingText,
          fallbackMode: normalizedResult.fallbackMode,
          confidence: normalizedResult.confidence,
          diagnostics: normalizedResult.diagnostics,
          providerSignals: normalizedResult.providerSignals,
        });
        const playedText = await playbackDone;
        const finalText = playedText || cleanModelText(answerText).trim() || t('noDisplayBody');
        turnData.aiReasoningText = reasoningText.trim();
        turnData.aiReplyText = finalText;
        if (!(state.pendingAiTasks.get(turnData.id)?.stoppedByUser)) {
          await renderRichAnswer(scaffold.answer, turnData.aiReplyText);
        }
        turnNode.classList.add('is-ai-complete');
      } catch (error) {
        const activeTask = state.pendingAiTasks.get(turnData.id);
        if (error.name === 'AbortError' || activeTask?.stoppedByUser) {
          finishPlaybackWithCurrentText();
          if (state.readingQueueTimer) {
            clearInterval(state.readingQueueTimer);
            state.readingQueueTimer = null;
          }
          scaffold.processing.classList.add('hidden');
          const partialText = cleanModelText(answerText).trim();
          if (partialText) {
            turnData.aiReplyText = partialText;
            await settleStreamingAnswer(scaffold.answer, partialText, { isError: false });
          } else {
            turnData.aiReplyText = '';
            await settleStreamingAnswer(scaffold.answer, '', { fallbackText: 'Stopped.', isError: false });
          }
        } else {
          finishPlaybackWithCurrentText();
          if (state.readingQueueTimer) {
            clearInterval(state.readingQueueTimer);
            state.readingQueueTimer = null;
          }
          scaffold.processing.classList.add('hidden');
          const partialText = cleanModelText(answerText).trim();
          if (partialText) {
            turnData.aiReplyText = partialText;
            await settleStreamingAnswer(scaffold.answer, partialText, { isError: false });
          } else {
            turnData.aiReplyText = '';
            await settleStreamingAnswer(
              scaffold.answer,
              '',
              {
                fallbackText: tf('aiRequestFailed', { message: cleanModelText(error.message || t('unknownError')) }),
                isError: true,
              }
            );
          }
        }
        turnNode.classList.add('is-ai-complete');
      } finally {
        clearPendingAiTask(turnData.id);
        turnNode._askTurnData = turnData;
        scrollToBottom();
      }
    }

    function renderTurn(turnData, existingTurnNode) {
      const turnNode = existingTurnNode || document.createElement('div');
      turnNode.className = 'ask-turn';
      turnNode.dataset.turnId = turnData.id;
      turnNode._askTurnData = turnData;
      turnNode.innerHTML = '';
      if (turnData.headerCards.length) {
        const cardsRow = createMessageReferenceStack(turnData.headerCards);
        if (cardsRow) {
          turnNode.appendChild(cardsRow);
        }
      }
      const userMsg = document.createElement('div');
      userMsg.className = 'ask-msg ask-msg-user';
      const body = document.createElement('div');
      body.className = 'ask-msg-user-body';
      const hasBodyText = turnData.sequenceParts.some((part) => part.type === 'text' && String(part.text || '').trim());
      const hasInlineRefs = turnData.sequenceParts.some((part) => part.type === 'ref' && part.tokenRole !== 'capability');
      const hasStatusChips = Boolean(turnData.activeCmd) || turnData.sequenceParts.some((part) => part.type === 'ref' && part.tokenRole === 'capability');
      const isCommandOnlyTurn = Boolean(hasStatusChips && !hasBodyText && !hasInlineRefs);
      if (isCommandOnlyTurn) {
        userMsg.classList.add('ask-msg-user-command-only');
        body.classList.add('ask-msg-user-body-command-only');
      }
      if (turnData.activeCmd) {
        const cmdTag = document.createElement('div');
        cmdTag.className = 'ask-msg-cmd-tag';
        cmdTag.innerHTML = '<span>◔</span><span>' + turnData.activeCmd + '</span>';
        body.appendChild(cmdTag);
      }
      turnData.sequenceParts.forEach((part) => {
        if (part.type === 'ref') {
          if (part.tokenRole === 'capability') {
            const formatTag = document.createElement('div');
            formatTag.className = 'ask-msg-cmd-tag ask-msg-format-tag';
            const icon = document.createElement('span');
            icon.textContent = part.iconText || '';
            const label = document.createElement('span');
            label.textContent = part.title;
            formatTag.append(icon, label);
            body.appendChild(formatTag);
            return;
          }
          const refEl = document.createElement('span');
          refEl.className = 'ask-msg-inline-ref';
          const icon = document.createElement('span');
          icon.className = 'ask-msg-inline-ref-icon';
          icon.textContent = part.iconText;
          const label = document.createElement('span');
          label.className = 'ask-msg-inline-ref-label';
          label.textContent = part.title;
          refEl.append(icon, label);
          body.appendChild(refEl);
          return;
        }
        if (part.type === 'text' && part.text) {
          const textNode = document.createElement('span');
          textNode.className = 'ask-msg-text';
          textNode.textContent = part.text;
          body.appendChild(textNode);
        }
      });
      userMsg.appendChild(body);
      turnNode.appendChild(userMsg);

      const meta = document.createElement('div');
      meta.className = 'ask-turn-meta';
      const time = document.createElement('span');
      time.className = 'ask-turn-time';
      time.textContent = turnData.timestamp;
      const actions = document.createElement('div');
      actions.className = 'ask-turn-actions';
      const createActionIconMarkup = (mainSvg) => (
        '<span class="ask-turn-action-icon ask-turn-action-icon-main">' + mainSvg + '</span>' +
        '<span class="ask-turn-action-icon ask-turn-action-icon-success"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>' +
        '<span class="ask-turn-action-icon ask-turn-action-icon-fail"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5"/><path d="M12 16h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg></span>'
      );
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'ask-turn-action';
      copyBtn.title = t('copyMessage');
      copyBtn.innerHTML = createActionIconMarkup('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M5 15V7a2 2 0 0 1 2-2h8"/></svg>');
      copyBtn.addEventListener('click', () => {
        copyTextWithFeedback(copyBtn, turnData.visibleText || '');
      });
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'ask-turn-action';
      editBtn.title = t('editMessage');
      editBtn.innerHTML = createActionIconMarkup('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>');
      editBtn.addEventListener('click', () => {
        state.editingTurnId = turnData.id;
        syncEditingBanner();
        restoreComposerFromSerialized(turnData.serialized.replace(/^\[\[aip-cmd:[^\]]+]]/, ''), turnData.activeCmd);
      });
      actions.append(copyBtn, editBtn);
      meta.append(time, actions);
      turnNode.appendChild(meta);

      const aiSlot = document.createElement('div');
      aiSlot.className = 'ask-turn-ai-slot';
      turnNode.appendChild(aiSlot);
      const aiMeta = document.createElement('div');
      aiMeta.className = 'ask-turn-ai-meta';
      const aiActions = document.createElement('div');
      aiActions.className = 'ask-turn-ai-actions';
      const aiCopyBtn = document.createElement('button');
      aiCopyBtn.type = 'button';
      aiCopyBtn.className = 'ask-turn-action';
      aiCopyBtn.title = t('copyReply');
      aiCopyBtn.innerHTML = createActionIconMarkup('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M5 15V7a2 2 0 0 1 2-2h8"/></svg>');
      aiCopyBtn.addEventListener('click', () => {
        copyTextWithFeedback(aiCopyBtn, turnNode._askTurnData?.aiReplyText || '');
      });
      const aiRetryBtn = document.createElement('button');
      aiRetryBtn.type = 'button';
      aiRetryBtn.className = 'ask-turn-action';
      aiRetryBtn.title = t('retryReply');
      aiRetryBtn.innerHTML = createActionIconMarkup('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15.55-6.36L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15.55 6.36L3 16"/></svg>');
      aiRetryBtn.addEventListener('click', () => {
        const latestTurnData = turnNode._askTurnData;
        if (!latestTurnData) {
          return;
        }
        clearPendingAiTask(latestTurnData.id);
        removeTurnsAfter(turnNode);
        latestTurnData.aiReplyText = '';
        latestTurnData.aiReasoningText = '';
        streamAiForTurn(turnNode, latestTurnData);
      });
      aiActions.append(aiCopyBtn, aiRetryBtn);
      aiMeta.appendChild(aiActions);
      turnNode.appendChild(aiMeta);
      return turnNode;
    }

    function removeCommand() {
      state.activeCmd = null;
      state.cmdChipFocused = false;
      if (state.focusedComposerTokenKey === 'cmd') {
        state.focusedComposerTokenKey = null;
      }
      const chip = state.cmdChipEl;
      state.cmdChipEl = null;
      animateNodeRemoval(chip, () => {
        chip?.remove();
        syncCommandsRow();
        state.inputField.focus();
      });
    }

    function selectCommand(cmdName) {
      hideSendValidation();
      if (state.cmdChipEl?.parentNode) {
        state.cmdChipEl.remove();
      }
      state.activeCmd = cmdName;
      state.cmdChipFocused = false;
      const chip = document.createElement('span');
      chip.className = 'ask-cmd-chip';
      chip.append(document.createTextNode(cmdName));
      ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
        chip.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      });
      chip.addEventListener('click', (event) => {
        event.preventDefault();
        removeCommand();
      });
      state.inputMain.insertBefore(chip, state.inputMain.querySelector('.ask-composer-token[data-token-role="capability"]') || state.inlineRefRow);
      state.cmdChipEl = chip;
      syncCommandsRow();
      state.inputField.focus();
    }

    function clearReferences() {
      state.refs = [];
      getComposerTokenNodes().forEach((node) => {
        if ((node.dataset.tokenKey || '').startsWith('ref:')) {
          node.remove();
        }
      });
      syncReferenceStrip();
    }

    function addReferences(items) {
      let inserted = 0;
      (items || []).forEach((item) => {
        if (!item || isSuggestionAlreadySelected(item)) {
          return;
        }
        addReference(item);
        inserted += 1;
      });
      return inserted;
    }

    function removeReference(refId) {
      const composerToken = findComposerTokenNode('ref:' + refId);
      state.refs = state.refs.filter((item) => item.id !== refId);
      if (state.autoCurrentPageRefId === refId) {
        state.autoCurrentPageRefId = null;
      }
      animateNodeRemoval(composerToken, () => {
        composerToken?.remove();
        syncReferenceStrip();
      });
      if (state.focusedComposerTokenKey === 'ref:' + refId) {
        clearFocusedComposerToken();
      }
      state.inputField.focus();
    }

    function makeReferenceFromItem(item, options) {
      const ref = {
        id: String(options?.id || state.nextRefId++),
        kind: item.kind,
        title: item.title,
        subtitle: item.subtitle || '',
        meta: item.meta || '',
        iconText: item.iconText || item.title.slice(0, 1).toUpperCase(),
        source: item.kind,
        raw: item.raw || null,
        rawBlob: item.rawBlob || item.blob || null,
        rawFile: item.rawFile || null,
        mime: item.mime || item.raw?.mime || item.raw?.type || '',
        autoCurrentPage: Boolean(options?.autoCurrentPage),
      };
      return ref;
    }

    function insertReferenceToken(ref, options) {
      const token = createComposerTokenElement({
        key: 'ref:' + ref.id,
        kind: ref.kind,
        iconText: ref.kind === 'file' ? 'D' : ref.iconText,
        title: ref.title,
        refId: ref.id,
      });
      if (options?.prepend) {
        state.inputField.prepend(token);
      } else {
        insertNodeAtComposerCaret(token);
      }
      return token;
    }

    function setAutoCurrentPageReference(item) {
      if (!item) {
        return;
      }
      hideSendValidation();
      const existingRef = state.autoCurrentPageRefId
        ? state.refs.find((ref) => ref.id === state.autoCurrentPageRefId)
        : null;
      const matchingRef = findReferenceForTab(item);
      if (matchingRef && matchingRef.id !== existingRef?.id) {
        if (existingRef) {
          const oldToken = findComposerTokenNode('ref:' + existingRef.id);
          oldToken?.remove();
          state.refs = state.refs.filter((ref) => ref.id !== existingRef.id);
        }
        state.autoCurrentPageRefId = null;
        syncReferenceStrip();
        return;
      }
      const ref = makeReferenceFromItem(item, {
        id: existingRef?.id || undefined,
        autoCurrentPage: true,
      });
      ref.kind = 'tab';
      if (existingRef) {
        Object.assign(existingRef, ref);
        const token = findComposerTokenNode('ref:' + existingRef.id);
        if (token) {
          token.dataset.tokenKind = existingRef.kind;
          token.dataset.tokenTitle = existingRef.title;
          token.dataset.tokenIcon = existingRef.iconText || '';
          token.querySelector('.ask-composer-token-icon').textContent = existingRef.iconText || 'A';
          token.querySelector('.ask-composer-token-label').textContent = existingRef.title;
        }
      } else {
        state.refs.unshift(ref);
        state.autoCurrentPageRefId = ref.id;
        insertReferenceToken(ref, { prepend: true });
      }
      syncReferenceStrip();
    }

    function removeCapability(capabilityInstanceId) {
      const composerToken = findComposerTokenNode('cap:' + capabilityInstanceId);
      state.capabilities = state.capabilities.filter((item) => item.id !== capabilityInstanceId);
      if (state.focusedComposerTokenKey === 'cap:' + capabilityInstanceId) {
        clearFocusedComposerToken();
      }
      animateNodeRemoval(composerToken, () => {
        composerToken?.remove();
        syncReferenceStrip();
      });
      state.inputField.focus();
    }

    function addReference(item) {
      hideSendValidation();
      const ref = makeReferenceFromItem(item);
      state.refs.push(ref);
      insertReferenceToken(ref);
      syncReferenceStrip();
    }

    function addCapability(item) {
      hideSendValidation();
      const capability = {
        id: 'cap-' + state.nextCapabilityId++,
        type: item.capabilityType || item.capabilityId || item.id || '',
        category: item.capabilityCategory || item.category || 'format',
        title: item.title,
        iconText: item.iconText || item.title.slice(0, 1).toUpperCase(),
        content: item.capabilityContent || item.content || '',
      };
      state.capabilities.push(capability);
      const token = createComposerTokenElement({
        key: 'cap:' + capability.id,
        kind: 'capability',
        title: capability.title,
        iconText: capability.iconText,
        tokenRole: 'capability',
        capabilityId: capability.id,
        capabilityType: capability.type,
        capabilityCategory: capability.category,
        capabilityContent: capability.content,
      });
      bindCapabilityTokenRemoval(token, capability.id);
      state.inputMain.insertBefore(token, state.inlineRefRow);
      syncReferenceStrip();
    }

    function replaceSuggestionToken() {
      if (!state.suggestionToken?.node) {
        return;
      }
      const node = state.suggestionToken.node;
      const nextText = node.textContent.slice(0, state.suggestionToken.startOffset) + node.textContent.slice(state.suggestionToken.endOffset);
      node.textContent = nextText;
      if (!node.textContent) {
        const emptyNode = document.createTextNode('');
        node.parentNode?.insertBefore(emptyNode, node.nextSibling);
        node.remove();
        placeCaretInTextNode(emptyNode, 0);
      } else {
        placeCaretInTextNode(node, state.suggestionToken.startOffset);
      }
      state.suggestionToken = null;
    }

    function detectTriggerToken(trigger) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return null;
      }
      const range = selection.getRangeAt(0);
      let node = range.endContainer;
      let offset = range.endOffset;
      if (node === state.inputField) {
        const previous = state.inputField.childNodes[offset - 1];
        if (previous?.nodeType === Node.TEXT_NODE) {
          node = previous;
          offset = previous.textContent.length;
        } else {
          return null;
        }
      }
      if (node?.nodeType !== Node.TEXT_NODE) {
        return null;
      }
      const beforeCaret = node.textContent.slice(0, offset);
      const afterCaret = node.textContent.slice(offset);
      const triggerIndex = beforeCaret.lastIndexOf(trigger);
      if (triggerIndex < 0) {
        return null;
      }
      const token = beforeCaret.slice(triggerIndex);
      if (token.length > 1 && /[\n\s]/.test(token.slice(1))) {
        return null;
      }
      if (triggerIndex > 0) {
        const previousChar = beforeCaret[triggerIndex - 1];
        if (previousChar && !/\s/.test(previousChar)) {
          return null;
        }
      }
      const nextChar = afterCaret[0];
      if (nextChar && !/\s/.test(nextChar)) {
        return null;
      }
      if (token[0] !== trigger) {
        return null;
      }
      return {
        node,
        startOffset: triggerIndex,
        endOffset: offset,
        query: token.slice(1),
        trigger,
      };
    }

    function renderSuggestionItem(item, index) {
      if (item.kind === 'divider') {
        return '<div class="ask-suggestion-divider" role="separator"></div>';
      }
      if (item.kind === 'action') {
        return [
          '<button class="ask-suggestion-item ask-suggestion-item-action" type="button" data-action="' + escapeHtml(item.action || '') + '">',
          '<span class="ask-suggestion-icon" style="background:' + escapeHtml(item.color || '#2D3139') + ';">',
          '<span>' + escapeHtml(item.iconText || '+') + '</span>',
          '</span>',
          '<span class="ask-suggestion-text">',
          '<span class="ask-suggestion-title">' + escapeHtml(item.title) + '</span>',
          '<span class="ask-suggestion-subtitle">' + escapeHtml(item.subtitle || '') + '</span>',
          '</span>',
          '</button>',
        ].join('');
      }
      const icon = item.iconUrl
        ? '<img src="' + escapeHtml(item.iconUrl) + '" alt="">'
        : '<span>' + escapeHtml(item.iconText || item.title.slice(0, 1).toUpperCase()) + '</span>';
      return [
        '<button class="ask-suggestion-item' + (index === state.suggestionSelectedIndex ? ' active' : '') + '" type="button" data-index="' + index + '">',
        '<span class="ask-suggestion-icon" style="background:' + escapeHtml(item.color || '#2D3139') + ';">' + icon + '</span>',
        '<span class="ask-suggestion-text">',
        '<span class="ask-suggestion-title">' + escapeHtml(item.title) + (item.isCurrentPage ? '<span class="ask-suggestion-current-badge">' + escapeHtml(t('currentPage')) + '</span>' : '') + '</span>',
        '<span class="ask-suggestion-subtitle">' + escapeHtml(item.subtitle || '') + '</span>',
        '</span>',
        '<span class="ask-suggestion-meta">' + escapeHtml(item.meta || '') + '</span>',
        '</button>',
      ].join('');
    }

    function renderSuggestions() {
      if (!state.suggestionSections.length) {
        state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">' + escapeHtml(t('noMatchingSuggestions')) + '</div>';
        return;
      }
      const sections = state.suggestionSections.map((section) => {
        if (!section.items?.length) {
          return '';
        }
        return [
          '<div class="ask-suggestion-section">',
          section.title ? ('<div class="ask-suggestion-section-title">' + escapeHtml(section.title) + '</div>') : '',
          section.items.map((entry) => {
            if (entry.selectable) {
              return renderSuggestionItem(entry.item, entry.index);
            }
            return renderSuggestionItem(entry.item, -1);
          }).join(''),
          '</div>',
        ].join('');
      }).filter(Boolean);
      state.suggestionBody.innerHTML = sections.join('');
    }

    function syncSuggestionActiveItem(previousIndex) {
      if (typeof previousIndex === 'number' && previousIndex >= 0) {
        state.suggestionBody.querySelector('.ask-suggestion-item[data-index="' + previousIndex + '"]')?.classList.remove('active');
      }
      const active = state.suggestionBody.querySelector('.ask-suggestion-item[data-index="' + state.suggestionSelectedIndex + '"]');
      if (!active) {
        return;
      }
      active.classList.add('active');
      active.scrollIntoView({ block: 'nearest' });
    }

    function moveSuggestionSelection(step) {
      if (!state.suggestionItems.length) {
        return;
      }
      const previousIndex = state.suggestionSelectedIndex;
      state.suggestionSelectedIndex = (state.suggestionSelectedIndex + step + state.suggestionItems.length) % state.suggestionItems.length;
      syncSuggestionActiveItem(previousIndex);
    }

    function selectSuggestion(item) {
      replaceSuggestionToken();
      hideSuggestions();
      if (item.kind === 'command') {
        selectCommand(item.commandName);
        state.inputField.focus();
        return;
      }
      if (item.kind === 'capability') {
        addCapability(item);
        state.inputField.focus();
        return;
      }
      if (item.kind === 'context') {
        setAutoCurrentPageReference(Object.assign({}, item, { kind: 'tab' }));
        state.inputField.focus();
        return;
      }
      if (item.kind === 'files-action') {
        pickLocalFile().then((file) => {
          if (file) {
            addReference({
              kind: 'file',
              title: file.fileName || file.filename,
              subtitle: file.mime || 'local file',
              iconText: 'D',
              rawFile: file.rawFile || null,
              blob: file.blob || null,
              mime: file.mime || '',
            });
          }
          state.inputField.focus();
        });
        return;
      }
      if (item.kind === 'tab-group') {
        addReferences(item.tabs || []);
        state.inputField.focus();
        return;
      }
      if (item.kind === 'tab' && item.isCurrentPage) {
        setAutoCurrentPageReference(item);
        state.inputField.focus();
        return;
      }
      addReference(item);
      state.inputField.focus();
    }

    function buildTabGroupSuggestions(tabItems) {
      const allTabs = tabItems.filter((item) => item.kind === 'tab');
      if (!allTabs.length) {
        return [];
      }
      const groups = [];
      groups.push({
        id: 'tab-group-all',
        kind: 'tab-group',
        title: tf('allOpenTabsTitle', { count: allTabs.length }),
        subtitle: t('allOpenTabsSubtitle'),
        iconText: '◎',
        color: '#295B63',
        meta: '',
        tabs: allTabs,
      });
      const hostMap = new Map();
      allTabs.forEach((item) => {
        const host = String(item.subtitle || '').trim();
        if (!host) {
          return;
        }
        if (!hostMap.has(host)) {
          hostMap.set(host, []);
        }
        hostMap.get(host).push(item);
      });
      Array.from(hostMap.entries())
        .filter(([, items]) => items.length > 1)
        .sort((a, b) => {
          if (b[1].length !== a[1].length) {
            return b[1].length - a[1].length;
          }
          return a[0].localeCompare(b[0]);
        })
        .forEach(([host, items]) => {
          groups.push({
            id: 'tab-group-' + host,
            kind: 'tab-group',
            title: tf('domainTabsTitle', { host, count: items.length }),
            subtitle: t('domainTabsSubtitle'),
            iconText: '◌',
            color: '#2C4E63',
            meta: '',
            tabs: items,
          });
        });
      return groups;
    }

    function setAtSuggestionState({ tabItems, fileItems, formatItems }) {
      const visibleTabItems = tabItems.slice(0, state.atTabsExpanded ? TAB_SUGGESTION_LIMITS.expanded : TAB_SUGGESTION_LIMITS.collapsed);
      const moreCount = Math.max(0, Math.min(tabItems.length, TAB_SUGGESTION_LIMITS.expanded) - visibleTabItems.length);
      const tabGroupItems = buildTabGroupSuggestions(tabItems);
      const sections = [];
      const tabSectionItems = visibleTabItems.map((item) => ({ selectable: true, item }));
      if (moreCount > 0) {
        tabSectionItems.push({
          selectable: false,
          item: {
            kind: 'action',
            action: 'expand-tabs',
            title: t('showMoreTabs'),
            subtitle: tf('showMoreTabsSubtitle', { count: moreCount }),
            iconText: '+',
            color: '#2D3139',
          },
        });
      }
      if (tabGroupItems.length) {
        if (tabSectionItems.length) {
          tabSectionItems.push({
            selectable: false,
            item: {
              kind: 'divider',
            },
          });
        }
        tabGroupItems.forEach((item) => {
          tabSectionItems.push({ selectable: true, item });
        });
      }
      if (tabSectionItems.length) {
        sections.push({
          title: t('tabsSection'),
          items: tabSectionItems,
        });
      }
      if (fileItems.length) {
        sections.push({
          title: t('filesSection'),
          items: fileItems.map((item) => ({ selectable: true, item })),
        });
      }
      if (formatItems.length) {
        sections.push({
          title: t('formatsSection'),
          items: formatItems.map((item) => ({ selectable: true, item })),
        });
      }
      const selectableItems = [];
      let selectableIndex = 0;
      sections.forEach((section) => {
        section.items.forEach((entry) => {
          if (!entry.selectable) {
            return;
          }
          entry.index = selectableIndex++;
          selectableItems.push(entry.item);
        });
      });
      state.suggestionItems = selectableItems;
      state.suggestionSections = sections;
      if (!state.suggestionItems.length && !sections.length) {
        state.suggestionSelectedIndex = 0;
        return;
      }
      state.suggestionSelectedIndex = Math.min(state.suggestionSelectedIndex, Math.max(0, state.suggestionItems.length - 1));
    }

    async function loadAtSuggestions(query) {
      state.suggestionMode = 'at';
      state.suggestionSearchText.textContent = '@' + query;
      state.suggestionBody.innerHTML = '<div class="ask-suggestion-section"><div class="ask-suggestion-section-title">Loading</div><button class="ask-suggestion-item active" type="button"><span class="ask-suggestion-icon"><span>@</span></span><span class="ask-suggestion-text"><span class="ask-suggestion-title">' + escapeHtml(t('loadingTabsFilesTitle')) + '</span><span class="ask-suggestion-subtitle">' + escapeHtml(t('loadingTabsFilesSubtitle')) + '</span></span></button></div>';
      showSuggestions();
      try {
        const [tabsResult, filesResult, clipboardResult] = await Promise.allSettled([getPanelTabs(), getDownloadedFiles(query), getClipboardFiles()]);
        const tabs = tabsResult.status === 'fulfilled' ? (tabsResult.value || []) : [];
        const files = filesResult.status === 'fulfilled' ? (filesResult.value || []) : [];
        const clipboardFiles = clipboardResult.status === 'fulfilled' ? (clipboardResult.value || []) : [];
        const lowerQuery = query.trim().toLowerCase();
        const formatItems = formatCapabilityDefinitions
          .filter((item) => {
            if (isSuggestionAlreadySelected({ kind: 'capability', capabilityType: item.id, title: item.title })) {
              return false;
            }
            if (!lowerQuery) {
              return true;
            }
            return [item.title, item.subtitle]
              .concat(item.aliases || [])
              .some((token) => String(token || '').toLowerCase().includes(lowerQuery));
          })
          .map((item) => ({
            id: 'capability-' + item.id,
            kind: 'capability',
            group: 'Formats',
            title: item.title,
            subtitle: item.subtitle,
            iconText: item.iconText,
            color: '#2D3139',
            capabilityType: item.id,
            capabilityCategory: 'format',
            capabilityContent: item.content,
          }));
        const tabItems = ((tabs || []).map(normalizeTab))
          .filter((item, index, arr) => {
            const unique = arr.findIndex((candidate) => candidate.id === item.id) === index;
            if (!unique) {
              return false;
            }
            if (isSuggestionAlreadySelected(item)) {
              return false;
            }
            if (!lowerQuery) {
              return true;
            }
            return (item.title + ' ' + item.subtitle).toLowerCase().includes(lowerQuery);
          });
        const fileItems = (clipboardFiles || [])
          .map(normalizeFile)
          .concat((files || []).map(normalizeFile))
          .filter((item, index, arr) => {
            const unique = arr.findIndex((candidate) => candidate.id === item.id && candidate.title === item.title) === index;
            if (!unique) {
              return false;
            }
            if (isSuggestionAlreadySelected(item)) {
              return false;
            }
            if (!lowerQuery) {
              return true;
            }
            return (item.title + ' ' + item.subtitle).toLowerCase().includes(lowerQuery);
          });
        const openFolderItem = {
          id: 'files-action-open',
          kind: 'files-action',
          group: 'Files',
          title: t('chooseFileTitle'),
          subtitle: t('chooseFileSubtitle'),
          iconText: '+',
          color: '#2D3139',
        };
        const finalFileItems = fileItems.concat(openFolderItem);
        state.atSuggestionData = {
          tabItems,
          fileItems: finalFileItems,
          formatItems,
        };
        setAtSuggestionState({
          tabItems,
          fileItems: finalFileItems,
          formatItems,
        });
        if (!state.suggestionItems.length && !state.suggestionSections.length) {
          state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">' + escapeHtml(t('noTabsOrFiles')) + '</div>';
          return;
        }
        renderSuggestions();
      } catch (error) {
        state.suggestionItems = [];
        state.suggestionSections = [];
        state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">' + escapeHtml(t('tabsFilesReadFailed')) + '</div>';
      }
    }

    function loadCommandSuggestions(query) {
      state.suggestionMode = 'slash';
      state.suggestionSearchText.textContent = '/' + query;
      const lowerQuery = query.trim().toLowerCase();
      state.suggestionItems = commandDefinitions
        .filter((command) => {
          if (!lowerQuery) {
            return true;
          }
          return [command.name, command.trigger]
            .concat(command.aliases || [])
            .some((token) => String(token || '').toLowerCase().startsWith(lowerQuery));
        })
        .map((command) => ({
          id: 'command-' + command.id,
          kind: 'command',
          group: 'Commands',
          title: '/' + command.name,
          subtitle: command.subtitle,
          iconText: command.iconText,
          color: '#2D3139',
          commandName: command.name,
          commandPrompt: command.prompt,
        }));
      state.suggestionSections = state.suggestionItems.length ? [{
        title: t('commandsSection'),
        items: state.suggestionItems.map((item, index) => ({ selectable: true, item, index })),
      }] : [];
      state.suggestionSelectedIndex = 0;
      showSuggestions();
      if (!state.suggestionItems.length) {
        state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">' + escapeHtml(t('noMatchingCommands')) + '</div>';
        return;
      }
      renderSuggestions();
    }

    function handleSend() {
      if (state.isBusy) {
        stopStreamingOutput();
        return;
      }
      const sequenceParts = getComposerSequenceParts();
      const text = sequenceParts.filter((part) => part.type === 'text').map((part) => part.text).join('').trim();
      const validationMessage = getSendValidationMessage(sequenceParts, text);
      if (validationMessage) {
        showSendValidation(validationMessage);
        return;
      }
      hideSendValidation();
      if (state.activeCmd) {
        state.commandUsage.set(state.activeCmd, (state.commandUsage.get(state.activeCmd) || 0) + 1);
      }
      hideSuggestions();
      state.empty.style.display = 'none';
      const turnData = createTurnData();
      const existingTurn = state.editingTurnId ? findTurnNode(state.editingTurnId) : null;
      if (existingTurn) {
        removeTurnsAfter(existingTurn);
      }
      const turnNode = renderTurn(turnData, existingTurn);
      if (!existingTurn) {
        state.messages.appendChild(turnNode);
      }
      clearComposer({ showDefaultContext: false });
      streamAiForTurn(turnNode, turnData);
      scrollToBottom({ smooth: true });
      requestAnimationFrame(() => {
        animateTurnSendFlight(turnNode);
      });
    }

    state.btnSend.addEventListener('click', handleSend);
    state.btnNew.addEventListener('click', () => {
      state.pendingAiTasks.forEach((task, turnId) => clearPendingAiTask(turnId));
      state.pendingAiTasks.clear();
      state.currentStreamingTurnId = null;
      state.conversationMemory.summary = '';
      state.conversationMemory.summarizedTurnCount = 0;
      syncBusyState();
      state.messages.innerHTML = '';
      state.empty.style.display = '';
      clearComposer({ showDefaultContext: false });
      syncContext();
      syncSelectedText();
    });
    state.editClose.addEventListener('click', () => {
      clearComposer({ showDefaultContext: false });
    });
    state.contextCard.addEventListener('click', () => {
      setContextCardVisible(false);
    });
    state.selectionCard.addEventListener('click', () => {
      clearSelectedTextContext();
    });
    state.btnTool.addEventListener('click', () => {
      openReferenceSuggestions();
    });
    state.inputField.addEventListener('focus', () => {
      state.inputBox.classList.add('focused');
      state.autoScrollPinned = isNearBottom();
      if (state.focusedComposerTokenKey) {
        clearFocusedComposerToken();
      }
    });
    state.inputField.addEventListener('blur', () => {
      state.inputBox.classList.remove('focused');
    });
    state.inputField.addEventListener('input', () => {
      hideSendValidation();
      syncStateFromComposerDom();
      if (state.focusedComposerTokenKey) {
        clearFocusedComposerToken();
      }
      const slashToken = detectTriggerToken('/');
      if (slashToken) {
        state.suggestionToken = slashToken;
        loadCommandSuggestions(slashToken.query);
        return;
      }
      const atToken = detectTriggerToken('@');
      if (atToken) {
        state.suggestionToken = atToken;
        loadAtSuggestions(atToken.query);
      } else {
        hideSuggestions();
      }
    });
    state.inputField.addEventListener('copy', (event) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !state.inputField.contains(selection.anchorNode)) {
        return;
      }
      const fragment = selection.getRangeAt(0).cloneContents();
      const serialized = serializeComposerFragment(fragment);
      const visibleText = getVisibleTextFromFragment(fragment);
      if (!serialized && !visibleText) {
        return;
      }
      event.preventDefault();
      event.clipboardData.setData('text/plain', visibleText);
      if (serialized) {
        event.clipboardData.setData(INTERNAL_CLIPBOARD_MIME, serialized);
        event.clipboardData.setData('text/html', buildClipboardHtmlFromFragment(fragment));
      }
    });
    state.inputField.addEventListener('cut', (event) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !state.inputField.contains(selection.anchorNode)) {
        return;
      }
      const range = selection.getRangeAt(0);
      const fragment = range.cloneContents();
      const serialized = serializeComposerFragment(fragment);
      const visibleText = getVisibleTextFromFragment(fragment);
      if (!serialized && !visibleText) {
        return;
      }
      event.preventDefault();
      event.clipboardData.setData('text/plain', visibleText);
      if (serialized) {
        event.clipboardData.setData(INTERNAL_CLIPBOARD_MIME, serialized);
        event.clipboardData.setData('text/html', buildClipboardHtmlFromFragment(fragment));
      }
      range.deleteContents();
      syncStateFromComposerDom();
    });
    state.inputField.addEventListener('paste', (event) => {
      hideSendValidation();
      const internal = event.clipboardData?.getData(INTERNAL_CLIPBOARD_MIME) || '';
      if (internal) {
        event.preventDefault();
        insertSerializedComposerText(internal);
        syncStateFromComposerDom();
        return;
      }
      const html = event.clipboardData?.getData('text/html') || '';
      if (html.includes('data-aip-payload=')) {
        event.preventDefault();
        insertClipboardHtmlWithTokens(html);
        syncStateFromComposerDom();
        return;
      }
      const text = event.clipboardData?.getData('text/plain') || '';
      event.preventDefault();
      if (text.includes('[[aip:')) {
        insertSerializedComposerText(text);
      } else {
        insertPlainComposerText(text);
      }
      syncStateFromComposerDom();
    });
      state.inputField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && state.isBusy) {
        event.preventDefault();
        stopStreamingOutput();
        return;
      }
      if (event.key === '@') {
        requestAnimationFrame(() => {
          const token = detectTriggerToken('@');
          if (!token) {
            hideSuggestions();
            return;
          }
          state.suggestionToken = token;
          openAtSuggestions(token.query || '');
        });
      }
      if (event.key === '/') {
        requestAnimationFrame(() => {
          const token = detectTriggerToken('/');
          if (!token) {
            hideSuggestions();
            return;
          }
          state.suggestionToken = token;
          state.suggestionSearchText.textContent = '/';
          state.suggestionBody.innerHTML = '<div class="ask-suggestion-empty">' + escapeHtml(t('preparingCommands')) + '</div>';
          showSuggestions();
          loadCommandSuggestions(token.query || '');
        });
      }
      if (state.suggestionDropdown.classList.contains('visible')) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          moveSuggestionSelection(1);
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          moveSuggestionSelection(-1);
          return;
        }
        if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
          const item = state.suggestionItems[state.suggestionSelectedIndex];
          if (item) {
            event.preventDefault();
            selectSuggestion(item);
            return;
          }
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          hideSuggestions();
          return;
        }
      }
      if (event.key === 'Backspace' && state.activeCmd && state.cmdChipEl && isInputEmpty()) {
        const focusedEntry = getComposerTokenEntries().find((entry) => entry.key === state.focusedComposerTokenKey);
        if (focusedEntry?.key === 'cmd' || String(focusedEntry?.key || '').startsWith('cap:')) {
          event.preventDefault();
          focusedEntry.remove();
          return;
        }
        const lastStatusEntry = getLastStatusTokenEntry();
        if (!focusedEntry && lastStatusEntry && isCaretAtComposerStart()) {
          event.preventDefault();
          focusComposerTokenEntry(lastStatusEntry);
          return;
        }
      }
      if (event.key === 'Backspace') {
        const focusedEntry = getComposerTokenEntries().find((entry) => entry.key === state.focusedComposerTokenKey);
        if (focusedEntry && (focusedEntry.key === 'cmd' || String(focusedEntry.key || '').startsWith('cap:'))) {
          event.preventDefault();
          focusedEntry.remove();
          return;
        }
        if (!focusedEntry && isInputEmpty() && isCaretAtComposerStart()) {
          const lastStatusEntry = getLastStatusTokenEntry();
          if (lastStatusEntry) {
            event.preventDefault();
            focusComposerTokenEntry(lastStatusEntry);
            return;
          }
        }
        const adjacent = getAdjacentComposerTokenEntry(-1);
        if (adjacent) {
          event.preventDefault();
          if (!focusedEntry || focusedEntry.key !== adjacent.key) {
            clearFocusedComposerToken();
            state.focusedComposerTokenKey = adjacent.key;
            adjacent.el.classList.add('focused');
          } else {
            adjacent.remove();
          }
          return;
        }
        if (isCaretAtComposerStart()) {
          event.preventDefault();
          return;
        }
      }
      if (event.key === 'ArrowLeft' && getCaretOffset(state.inputField) === 0) {
        if (state.focusedComposerTokenKey && moveComposerTokenFocus(-1)) {
          event.preventDefault();
          return;
        }
        const adjacent = getAdjacentComposerTokenEntry(-1);
        if (adjacent) {
          event.preventDefault();
          clearFocusedComposerToken();
          state.focusedComposerTokenKey = adjacent.key;
          adjacent.el.classList.add('focused');
          return;
        }
        const lastStatusEntry = getLastStatusTokenEntry();
        if (lastStatusEntry && isCaretAtComposerStart()) {
          event.preventDefault();
          focusComposerTokenEntry(lastStatusEntry);
          return;
        }
        if (state.activeCmd && state.cmdChipEl && isCaretAtComposerStart()) {
          event.preventDefault();
          clearFocusedComposerToken();
          state.focusedComposerTokenKey = 'cmd';
          state.cmdChipFocused = true;
          state.cmdChipEl?.classList.add('focused');
          return;
        }
        if (moveComposerTokenFocus(-1)) {
          event.preventDefault();
          return;
        }
      }
      if (event.key === 'ArrowRight' && state.focusedComposerTokenKey) {
        if (moveComposerTokenFocus(1)) {
          event.preventDefault();
          return;
        }
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    });
    state.suggestionBody.addEventListener('mousedown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const actionButton = event.target.closest('[data-action]');
      if (actionButton?.dataset.action === 'expand-tabs') {
        const previousScrollTop = state.suggestionBody.scrollTop;
        state.atTabsExpanded = true;
        if (state.atSuggestionData) {
          setAtSuggestionState(state.atSuggestionData);
          renderSuggestions();
          state.suggestionBody.scrollTop = previousScrollTop;
          return;
        }
        const atToken = state.suggestionToken?.trigger === '@' ? state.suggestionToken : detectTriggerToken('@');
        if (atToken) {
          state.suggestionToken = atToken;
        }
        loadAtSuggestions(state.suggestionToken?.query || '');
        return;
      }
      const button = event.target.closest('.ask-suggestion-item');
      if (!button) {
        return;
      }
      const item = state.suggestionItems[Number(button.dataset.index)];
      if (item) {
        selectSuggestion(item);
      }
    });
    state.messages.addEventListener('pointerdown', () => {
      state.userScrollingMessages = true;
    });
    state.messages.addEventListener('scroll', () => {
      if (isNearBottom()) {
        state.autoScrollPinned = true;
      } else if (state.userScrollingMessages || state.isBusy) {
        state.autoScrollPinned = false;
      }
    }, { passive: true });
    window.addEventListener('pointerup', () => {
      state.userScrollingMessages = false;
      if (isNearBottom()) {
        state.autoScrollPinned = true;
      }
    });
    ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
      state.suggestionDropdown.addEventListener(eventName, (event) => {
        event.stopPropagation();
      });
    });
    root.addEventListener('mousedown', (event) => {
      if (!state.suggestionDropdown.classList.contains('visible')) {
        return;
      }
      if (state.suggestionDropdown.contains(event.target) || state.inputBox.contains(event.target)) {
        return;
      }
      hideSuggestions();
    });

    syncCommandsRow();
    syncReferenceStrip();
    syncContext();
    syncSelectedText();
    syncBusyState();
    startSelectionPolling();
    panelState = state;
  }

  function ensurePanelUI(panel) {
    panel.querySelectorAll(':scope > .ask-in-page-content').forEach((node) => {
      if (node !== panelRoot) {
        node.remove();
      }
    });

    if (panelRoot && panelRoot.dataset.askInPageUiVersion !== uiVersion) {
      panelRoot.remove();
      panelRoot = null;
      panelState = null;
    }

    if (!panelRoot) {
      panelRoot = createElement('div', {
        class: 'ask-in-page-content',
      });
      panelRoot.dataset.askInPageUiVersion = uiVersion;
      initPanelState(panelRoot);
    }
    if (panelRoot.parentNode !== panel) {
      panel.append(panelRoot);
    }
    const webview = panel.querySelector('webview');
    if (webview) {
      webview.blur?.();
      webview.tabIndex = -1;
    }
    panel.dataset.askInPage = 'true';
    if (panelState) {
      panelState.root.style.display = '';
      panelState.inputField.setAttribute('data-panel-ready', 'true');
      if (!panelState.currentContext) {
        getCurrentTab().then((tab) => {
          if (tab && panelState) {
            panelState.ctxFavicon.textContent = normalizeTab(tab).iconText || 'A';
            panelState.ctxTitle.textContent = normalizeTab(tab).title;
            panelState.ctxUrl.textContent = normalizeTab(tab).subtitle;
            panelState.currentContext = normalizeTab(tab);
          }
        }).catch(() => {});
      }
    }
  }

  function createWebPanel() {
    vivaldi.prefs.get('vivaldi.panels.web.elements', (elements) => {
      const elementsArr = (elements && elements.value !== undefined) ? elements.value : elements;
      let element = elementsArr.find((item) => item.id === webPanelId);
      if (!element) {
        element = {
          activeUrl: code,
          faviconUrl: panelIcon,
          faviconUrlValid: true,
          id: webPanelId,
          mobileMode: true,
          origin: 'user',
          resizable: false,
          title: name,
          url: code,
          width: -1,
          zoom: 1,
        };
        elementsArr.unshift(element);
      } else {
        element.activeUrl = code;
        element.faviconUrl = panelIcon;
        element.faviconUrlValid = true;
        element.url = code;
      }
      vivaldi.prefs.set({
        path: 'vivaldi.panels.web.elements',
        value: elementsArr,
      });

      Promise.all([
        'vivaldi.toolbars.panel',
        'vivaldi.toolbars.navigation',
        'vivaldi.toolbars.status',
        'vivaldi.toolbars.mail',
        'vivaldi.toolbars.mail_message',
        'vivaldi.toolbars.mail_composer',
      ].map((path) => vivaldi.prefs.get(path))).then((toolbars) => {
        const hasPanel = toolbars.some((toolbar) => {
          const arr = (toolbar && toolbar.value !== undefined) ? toolbar.value : toolbar;
          return arr.some((entry) => entry === webPanelId);
        });
        if (!hasPanel) {
          const panels = toolbars[0];
          const panelsArr = (panels && panels.value !== undefined) ? panels.value : panels;
          const panelIndex = panelsArr.findIndex((entry) => entry.startsWith('WEBPANEL_'));
          panelsArr.splice(panelIndex, 0, webPanelId);
          vivaldi.prefs.set({
            path: 'vivaldi.toolbars.panel',
            value: panelsArr,
          });
        }
      });
    });
  }

  function updatePanel() {
    const webviewButtons = Array.from(document.querySelectorAll(
      '.toolbar > .button-toolbar > .ToolbarButton-Button[data-name*="' + webPanelId + '"]'
    ));
    const webPanelStack = getReactProps('.panel-group .webpanel-stack')?.children?.filter(Boolean) ?? [];
    const webPanelIndex = webPanelStack.findIndex((webPanel) => webPanel.key === webPanelId) + 1;
    const panel = webPanelIndex > 0
      ? document.querySelector('.panel-group .webpanel-stack .panel.webpanel:nth-child(' + webPanelIndex + ')')
      : null;

    if (panel && webviewButtons.length) {
      ensurePanelUI(panel);
    }

    webviewButtons.forEach((button) => {
      if (!button.dataset.askInPage) {
        button.dataset.askInPage = 'true';
      }
    });
  }

  function waitForBrowser(callback) {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (document.getElementById('browser')) {
        clearInterval(interval);
        callback();
      } else if (count > 100) {
        clearInterval(interval);
      }
    }, 100);
  }

  function scheduleUpdatePanel() {
    if (scheduleUpdatePanel.queued) {
      return;
    }
    scheduleUpdatePanel.queued = true;
    requestAnimationFrame(() => {
      scheduleUpdatePanel.queued = false;
      updatePanel();
    });
  }

  waitForBrowser(() => {
    injectStyles();
    createWebPanel();
    registerAskInPageRuntimeBridge();
    registerAskInPageContextMenus();
    scheduleUpdatePanel();
    ensureSelectionAskButton().catch(() => {});

    const observer = new MutationObserver(() => {
      scheduleUpdatePanel();
    });
    const observerRoot = document.querySelector('#panels .webpanel-stack') || document.querySelector('#panels') || document.body;
    observer.observe(observerRoot, {
      childList: true,
      subtree: true,
    });

    chrome.tabs?.onActivated?.addListener(() => {
      ensureSelectionAskButton().catch(() => {});
      if (panelState) {
        panelState.syncContext?.({ addCurrentPageReference: true });
        panelState.syncSelectedText?.();
      }
    });

    chrome.tabs?.onUpdated?.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab) {
        prefetchLightTabSnapshot(tab).catch(() => {});
        if (tab.active) {
          ensureSelectionAskButton(tab).catch(() => {});
        }
      }
      if (!panelState || !tab?.active) {
        return;
      }
      if (changeInfo.title || changeInfo.url || changeInfo.status === 'complete') {
        const previousUrl = String(panelState.currentContext?.raw?.url || panelState.currentContext?.raw?.pendingUrl || '');
        panelState.syncContext?.({ addCurrentPageReference: Boolean(changeInfo.url && changeInfo.url !== previousUrl) });
        panelState.syncSelectedText?.();
      }
    });
  });
})();
