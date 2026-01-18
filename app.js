// ========================================
// Visual HTML Builder - Main Application
// ========================================

// State
let elements = [];
let selectedElement = null;
let elementCounter = 0;
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let resizeHandle = null;
let currentTab = 'design';
let clipboard = null;
let undoStack = [];
let redoStack = [];
let showGrid = true;
let snapToGrid = true;
let canvasZoom = 1;

// Multi-page system
let pages = [
    {
        id: 0,
        name: 'index.html',
        elements: [],
        html: '',
        css: '',
        js: '',
        settings: {
            canvasWidth: 800,
            canvasHeight: 600,
            canvasBgColor: '#ffffff'
        }
    }
];
let currentPageId = 0;
let pageCounter = 0;

// Monaco Editors
let htmlEditor = null;
let cssEditor = null;
let jsEditor = null;

// Plugins state
let plugins = {
    bootstrap: false,
    fontawesome: false,
    animate: false,
    jquery: false
};

// Settings
let settings = {
    gridSize: 10,
    canvasWidth: 800,
    canvasHeight: 600,
    theme: 'dark',
    autoSave: false,
    // Editor settings
    editor: {
        fontSize: 14,
        fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
        tabSize: 2,
        wordWrap: 'on',
        minimap: true,
        lineNumbers: true,
        theme: 'vs-dark',
        autoCloseBrackets: true,
        formatOnPaste: true,
        formatOnType: true
    }
};

// Component Templates
const componentTemplates = {
    // ===== СТАНДАРТНЫЕ =====
    button: {
        tag: 'button',
        defaultText: 'Кнопка',
        defaultStyle: {
            width: '120px',
            height: '36px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
        }
    },
    label: {
        tag: 'span',
        defaultText: 'Надпись',
        defaultStyle: {
            fontSize: '14px',
            color: '#333'
        }
    },
    input: {
        tag: 'input',
        defaultAttrs: { type: 'text', placeholder: 'Введите текст...' },
        defaultStyle: {
            width: '200px',
            height: '36px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    textarea: {
        tag: 'textarea',
        defaultAttrs: { placeholder: 'Введите текст...' },
        defaultStyle: {
            width: '250px',
            height: '100px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'both'
        }
    },
    checkbox: {
        tag: 'label',
        innerHTML: '<input type="checkbox"> Флажок',
        defaultStyle: {
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }
    },
    radio: {
        tag: 'label',
        innerHTML: '<input type="radio" name="radio"> Радио',
        defaultStyle: {
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }
    },
    select: {
        tag: 'select',
        innerHTML: '<option>Вариант 1</option><option>Вариант 2</option><option>Вариант 3</option>',
        defaultStyle: {
            width: '150px',
            height: '36px',
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    
    // ===== ПОЛЯ ВВОДА =====
    password: {
        tag: 'input',
        defaultAttrs: { type: 'password', placeholder: 'Введите пароль...' },
        defaultStyle: {
            width: '200px',
            height: '36px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    email: {
        tag: 'input',
        defaultAttrs: { type: 'email', placeholder: 'email@example.com' },
        defaultStyle: {
            width: '220px',
            height: '36px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    number: {
        tag: 'input',
        defaultAttrs: { type: 'number', placeholder: '0', min: '0', max: '100' },
        defaultStyle: {
            width: '120px',
            height: '36px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    date: {
        tag: 'input',
        defaultAttrs: { type: 'date' },
        defaultStyle: {
            width: '160px',
            height: '36px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    time: {
        tag: 'input',
        defaultAttrs: { type: 'time' },
        defaultStyle: {
            width: '120px',
            height: '36px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    color: {
        tag: 'input',
        defaultAttrs: { type: 'color', value: '#3b82f6' },
        defaultStyle: {
            width: '50px',
            height: '36px',
            padding: '2px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer'
        }
    },
    range: {
        tag: 'input',
        defaultAttrs: { type: 'range', min: '0', max: '100', value: '50' },
        defaultStyle: {
            width: '200px',
            height: '20px',
            cursor: 'pointer'
        }
    },
    file: {
        tag: 'input',
        defaultAttrs: { type: 'file' },
        defaultStyle: {
            width: '250px',
            height: '36px',
            fontSize: '14px'
        }
    },
    search: {
        tag: 'input',
        defaultAttrs: { type: 'search', placeholder: 'Поиск...' },
        defaultStyle: {
            width: '220px',
            height: '36px',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '18px',
            fontSize: '14px'
        }
    },
    
    // ===== КОНТЕЙНЕРЫ =====
    div: {
        tag: 'div',
        defaultText: '',
        defaultStyle: {
            width: '200px',
            height: '150px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px'
        }
    },
    panel: {
        tag: 'div',
        defaultText: 'Панель',
        defaultStyle: {
            width: '250px',
            height: '180px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '12px'
        }
    },
    card: {
        tag: 'div',
        innerHTML: '<img src="https://via.placeholder.com/280x140" style="width:100%;border-radius:8px 8px 0 0;"><div style="padding:16px;"><h3 style="margin:0 0 8px 0;font-size:18px;">Заголовок карточки</h3><p style="margin:0;color:#666;font-size:14px;">Описание карточки с текстом.</p></div>',
        defaultStyle: {
            width: '280px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            overflow: 'hidden'
        }
    },
    header: {
        tag: 'header',
        innerHTML: '<div style="display:flex;justify-content:space-between;align-items:center;"><h2 style="margin:0;">Logo</h2><nav style="display:flex;gap:20px;"><a href="#" style="color:white;text-decoration:none;">Главная</a><a href="#" style="color:white;text-decoration:none;">О нас</a><a href="#" style="color:white;text-decoration:none;">Контакты</a></nav></div>',
        defaultStyle: {
            width: '100%',
            padding: '16px 24px',
            backgroundColor: '#1e293b',
            color: 'white'
        }
    },
    footer: {
        tag: 'footer',
        innerHTML: '<div style="text-align:center;"><p style="margin:0;">© 2024 Компания. Все права защищены.</p></div>',
        defaultStyle: {
            width: '100%',
            padding: '20px 24px',
            backgroundColor: '#1e293b',
            color: '#94a3b8'
        }
    },
    section: {
        tag: 'section',
        innerHTML: '<h2 style="margin:0 0 16px 0;">Секция</h2><p style="margin:0;color:#666;">Контент секции</p>',
        defaultStyle: {
            width: '100%',
            padding: '40px 24px',
            backgroundColor: '#f8fafc'
        }
    },
    article: {
        tag: 'article',
        innerHTML: '<h2 style="margin:0 0 12px 0;">Заголовок статьи</h2><p style="margin:0 0 12px 0;color:#64748b;font-size:14px;">Опубликовано: 1 января 2024</p><p style="margin:0;line-height:1.6;">Текст статьи с подробным описанием...</p>',
        defaultStyle: {
            width: '400px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
    },
    aside: {
        tag: 'aside',
        innerHTML: '<h4 style="margin:0 0 12px 0;">Боковая панель</h4><ul style="margin:0;padding-left:20px;"><li>Пункт 1</li><li>Пункт 2</li><li>Пункт 3</li></ul>',
        defaultStyle: {
            width: '200px',
            padding: '16px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px'
        }
    },
    fieldset: {
        tag: 'fieldset',
        innerHTML: '<legend style="padding:0 8px;font-weight:bold;">Группа полей</legend><div style="padding:12px;">Контент</div>',
        defaultStyle: {
            width: '300px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '12px'
        }
    },
    details: {
        tag: 'details',
        innerHTML: '<summary style="cursor:pointer;font-weight:bold;padding:8px;">Нажмите для раскрытия</summary><div style="padding:12px;">Скрытый контент, который появляется при раскрытии.</div>',
        defaultStyle: {
            width: '300px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: 'white'
        }
    },
    modal: {
        tag: 'div',
        innerHTML: '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid #e5e7eb;"><h3 style="margin:0;">Модальное окно</h3><button style="background:none;border:none;font-size:20px;cursor:pointer;">×</button></div><div style="padding:16px;">Контент модального окна</div><div style="padding:16px;border-top:1px solid #e5e7eb;text-align:right;"><button style="padding:8px 16px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;">OK</button></div>',
        defaultStyle: {
            width: '400px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            overflow: 'hidden'
        }
    },
    
    // ===== НАВИГАЦИЯ =====
    nav: {
        tag: 'nav',
        innerHTML: '<a href="#" style="padding:8px 16px;color:#3b82f6;text-decoration:none;">Главная</a><a href="#" style="padding:8px 16px;color:#3b82f6;text-decoration:none;">О нас</a><a href="#" style="padding:8px 16px;color:#3b82f6;text-decoration:none;">Услуги</a><a href="#" style="padding:8px 16px;color:#3b82f6;text-decoration:none;">Контакты</a>',
        defaultStyle: {
            display: 'flex',
            gap: '8px',
            padding: '8px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
        }
    },
    menu: {
        tag: 'ul',
        innerHTML: '<li style="padding:8px 16px;cursor:pointer;border-bottom:1px solid #e5e7eb;">☰ Пункт меню 1</li><li style="padding:8px 16px;cursor:pointer;border-bottom:1px solid #e5e7eb;">📁 Пункт меню 2</li><li style="padding:8px 16px;cursor:pointer;">⚙ Пункт меню 3</li>',
        defaultStyle: {
            width: '200px',
            listStyle: 'none',
            margin: '0',
            padding: '0',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
    },
    breadcrumb: {
        tag: 'nav',
        innerHTML: '<a href="#" style="color:#3b82f6;text-decoration:none;">Главная</a><span style="margin:0 8px;color:#94a3b8;">/</span><a href="#" style="color:#3b82f6;text-decoration:none;">Раздел</a><span style="margin:0 8px;color:#94a3b8;">/</span><span style="color:#64748b;">Текущая страница</span>',
        defaultStyle: {
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            fontSize: '14px'
        }
    },
    tabs: {
        tag: 'div',
        innerHTML: '<div style="display:flex;border-bottom:2px solid #e5e7eb;"><button style="padding:12px 24px;background:none;border:none;border-bottom:2px solid #3b82f6;margin-bottom:-2px;color:#3b82f6;cursor:pointer;font-weight:bold;">Вкладка 1</button><button style="padding:12px 24px;background:none;border:none;color:#64748b;cursor:pointer;">Вкладка 2</button><button style="padding:12px 24px;background:none;border:none;color:#64748b;cursor:pointer;">Вкладка 3</button></div><div style="padding:16px;">Контент вкладки 1</div>',
        defaultStyle: {
            width: '400px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
    },
    pagination: {
        tag: 'nav',
        innerHTML: '<button style="padding:8px 12px;border:1px solid #e5e7eb;background:white;cursor:pointer;border-radius:4px 0 0 4px;">←</button><button style="padding:8px 12px;border:1px solid #e5e7eb;border-left:none;background:#3b82f6;color:white;cursor:pointer;">1</button><button style="padding:8px 12px;border:1px solid #e5e7eb;border-left:none;background:white;cursor:pointer;">2</button><button style="padding:8px 12px;border:1px solid #e5e7eb;border-left:none;background:white;cursor:pointer;">3</button><button style="padding:8px 12px;border:1px solid #e5e7eb;border-left:none;background:white;cursor:pointer;border-radius:0 4px 4px 0;">→</button>',
        defaultStyle: {
            display: 'flex'
        }
    },
    
    // ===== ТЕКСТ =====
    heading: {
        tag: 'h1',
        defaultText: 'Заголовок H1',
        defaultStyle: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111',
            margin: '0'
        }
    },
    heading2: {
        tag: 'h2',
        defaultText: 'Заголовок H2',
        defaultStyle: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111',
            margin: '0'
        }
    },
    heading3: {
        tag: 'h3',
        defaultText: 'Заголовок H3',
        defaultStyle: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111',
            margin: '0'
        }
    },
    paragraph: {
        tag: 'p',
        defaultText: 'Это параграф текста. Здесь может быть любой текст для вашего приложения.',
        defaultStyle: {
            fontSize: '14px',
            color: '#333',
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: '0'
        }
    },
    span: {
        tag: 'span',
        defaultText: 'Текст',
        defaultStyle: {
            fontSize: '14px',
            color: '#333'
        }
    },
    blockquote: {
        tag: 'blockquote',
        innerHTML: '<p style="margin:0;font-style:italic;">"Это цитата или выделенный текст для привлечения внимания."</p><cite style="display:block;margin-top:8px;color:#64748b;font-size:14px;">— Автор цитаты</cite>',
        defaultStyle: {
            width: '350px',
            padding: '16px 24px',
            borderLeft: '4px solid #3b82f6',
            backgroundColor: '#f8fafc',
            margin: '0',
            fontSize: '16px'
        }
    },
    code: {
        tag: 'code',
        defaultText: 'const hello = "world";',
        defaultStyle: {
            padding: '4px 8px',
            backgroundColor: '#1e293b',
            color: '#22d3ee',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px'
        }
    },
    pre: {
        tag: 'pre',
        innerHTML: '<code>function hello() {\n  console.log("Hello, World!");\n  return true;\n}</code>',
        defaultStyle: {
            width: '350px',
            padding: '16px',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            overflow: 'auto',
            margin: '0'
        }
    },
    hr: {
        tag: 'hr',
        defaultStyle: {
            width: '300px',
            border: 'none',
            borderTop: '1px solid #e5e7eb',
            margin: '0'
        }
    },
    
    // ===== СПИСКИ =====
    ul: {
        tag: 'ul',
        innerHTML: '<li>Элемент списка 1</li><li>Элемент списка 2</li><li>Элемент списка 3</li>',
        defaultStyle: {
            margin: '0',
            paddingLeft: '24px',
            fontSize: '14px',
            lineHeight: '1.8'
        }
    },
    ol: {
        tag: 'ol',
        innerHTML: '<li>Первый пункт</li><li>Второй пункт</li><li>Третий пункт</li>',
        defaultStyle: {
            margin: '0',
            paddingLeft: '24px',
            fontSize: '14px',
            lineHeight: '1.8'
        }
    },
    dl: {
        tag: 'dl',
        innerHTML: '<dt style="font-weight:bold;">Термин 1</dt><dd style="margin:0 0 12px 16px;color:#666;">Определение термина 1</dd><dt style="font-weight:bold;">Термин 2</dt><dd style="margin:0 0 0 16px;color:#666;">Определение термина 2</dd>',
        defaultStyle: {
            margin: '0',
            fontSize: '14px'
        }
    },
    
    // ===== ТАБЛИЦЫ =====
    table: {
        tag: 'table',
        innerHTML: '<tr><th style="border:1px solid #e5e7eb;padding:12px;background:#f8fafc;text-align:left;">Заголовок 1</th><th style="border:1px solid #e5e7eb;padding:12px;background:#f8fafc;text-align:left;">Заголовок 2</th></tr><tr><td style="border:1px solid #e5e7eb;padding:12px;">Ячейка 1</td><td style="border:1px solid #e5e7eb;padding:12px;">Ячейка 2</td></tr><tr><td style="border:1px solid #e5e7eb;padding:12px;">Ячейка 3</td><td style="border:1px solid #e5e7eb;padding:12px;">Ячейка 4</td></tr>',
        defaultStyle: {
            borderCollapse: 'collapse',
            fontSize: '14px',
            width: '300px'
        }
    },
    tableAdvanced: {
        tag: 'table',
        innerHTML: '<thead><tr><th style="border:1px solid #e5e7eb;padding:12px;background:#1e293b;color:white;text-align:left;">ID</th><th style="border:1px solid #e5e7eb;padding:12px;background:#1e293b;color:white;text-align:left;">Имя</th><th style="border:1px solid #e5e7eb;padding:12px;background:#1e293b;color:white;text-align:left;">Email</th></tr></thead><tbody><tr><td style="border:1px solid #e5e7eb;padding:12px;">1</td><td style="border:1px solid #e5e7eb;padding:12px;">Иван</td><td style="border:1px solid #e5e7eb;padding:12px;">ivan@mail.ru</td></tr><tr style="background:#f8fafc;"><td style="border:1px solid #e5e7eb;padding:12px;">2</td><td style="border:1px solid #e5e7eb;padding:12px;">Мария</td><td style="border:1px solid #e5e7eb;padding:12px;">maria@mail.ru</td></tr></tbody>',
        defaultStyle: {
            borderCollapse: 'collapse',
            fontSize: '14px',
            width: '400px'
        }
    },
    
    // ===== МЕДИА =====
    image: {
        tag: 'img',
        defaultAttrs: { src: 'https://via.placeholder.com/200x150', alt: 'Изображение' },
        defaultStyle: {
            width: '200px',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '8px'
        }
    },
    video: {
        tag: 'video',
        defaultAttrs: { controls: 'true', poster: 'https://via.placeholder.com/320x180' },
        innerHTML: '<source src="" type="video/mp4">Ваш браузер не поддерживает видео.',
        defaultStyle: {
            width: '320px',
            height: '180px',
            backgroundColor: '#000',
            borderRadius: '8px'
        }
    },
    audio: {
        tag: 'audio',
        defaultAttrs: { controls: 'true' },
        innerHTML: '<source src="" type="audio/mpeg">Ваш браузер не поддерживает аудио.',
        defaultStyle: {
            width: '300px'
        }
    },
    iframe: {
        tag: 'iframe',
        defaultAttrs: { src: 'https://www.wikipedia.org/', frameborder: '0' },
        defaultStyle: {
            width: '400px',
            height: '300px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
        }
    },
    canvas: {
        tag: 'canvas',
        defaultAttrs: { width: '300', height: '200' },
        defaultStyle: {
            width: '300px',
            height: '200px',
            backgroundColor: '#f0f0f0',
            border: '1px dashed #ccc',
            borderRadius: '8px'
        }
    },
    svg: {
        tag: 'div',
        innerHTML: '<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#3b82f6"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="14">SVG</text></svg>',
        defaultStyle: {
            width: '100px',
            height: '100px'
        }
    },
    
    // ===== ССЫЛКИ =====
    link: {
        tag: 'a',
        defaultText: 'Ссылка',
        defaultAttrs: { href: '#' },
        defaultStyle: {
            color: '#3b82f6',
            textDecoration: 'underline',
            fontSize: '14px',
            cursor: 'pointer'
        }
    },
    buttonLink: {
        tag: 'a',
        defaultText: 'Кнопка-ссылка',
        defaultAttrs: { href: '#' },
        defaultStyle: {
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
        }
    },
    socialLinks: {
        tag: 'div',
        innerHTML: '<a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:#1877f2;color:white;border-radius:50%;text-decoration:none;margin-right:8px;">f</a><a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:#1da1f2;color:white;border-radius:50%;text-decoration:none;margin-right:8px;">𝕏</a><a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:white;border-radius:50%;text-decoration:none;margin-right:8px;">📷</a><a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:#0077b5;color:white;border-radius:50%;text-decoration:none;">in</a>',
        defaultStyle: {
            display: 'flex',
            gap: '8px'
        }
    },
    
    // ===== ИНДИКАТОРЫ =====
    progress: {
        tag: 'progress',
        defaultAttrs: { value: '70', max: '100' },
        defaultStyle: {
            width: '200px',
            height: '20px'
        }
    },
    meter: {
        tag: 'meter',
        defaultAttrs: { value: '0.7', min: '0', max: '1', low: '0.3', high: '0.7', optimum: '0.8' },
        defaultStyle: {
            width: '200px',
            height: '20px'
        }
    },
    spinner: {
        tag: 'div',
        innerHTML: '<div style="width:40px;height:40px;border:4px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;"></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>',
        defaultStyle: {
            display: 'inline-block'
        }
    },
    badge: {
        tag: 'span',
        defaultText: 'Новое',
        defaultStyle: {
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#22c55e',
            color: 'white',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 'bold'
        }
    },
    alert: {
        tag: 'div',
        innerHTML: '<strong>⚠️ Внимание!</strong> Это важное уведомление для пользователя.',
        defaultStyle: {
            width: '350px',
            padding: '16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            color: '#92400e',
            fontSize: '14px'
        }
    },
    tooltip: {
        tag: 'div',
        innerHTML: '<span style="cursor:help;border-bottom:1px dashed #666;">Наведите на меня</span><div style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%);padding:8px 12px;background:#1e293b;color:white;border-radius:6px;font-size:12px;white-space:nowrap;opacity:0.9;margin-bottom:8px;">Это подсказка</div>',
        defaultStyle: {
            position: 'relative',
            display: 'inline-block'
        }
    },
    
    // ===== ФОРМЫ =====
    form: {
        tag: 'form',
        innerHTML: '<div style="margin-bottom:16px;"><label style="display:block;margin-bottom:4px;font-weight:500;">Имя</label><input type="text" placeholder="Введите имя" style="width:100%;padding:8px 12px;border:1px solid #ccc;border-radius:6px;"></div><div style="margin-bottom:16px;"><label style="display:block;margin-bottom:4px;font-weight:500;">Email</label><input type="email" placeholder="email@example.com" style="width:100%;padding:8px 12px;border:1px solid #ccc;border-radius:6px;"></div><button type="submit" style="width:100%;padding:10px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;">Отправить</button>',
        defaultStyle: {
            width: '300px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
    },
    formGroup: {
        tag: 'div',
        innerHTML: '<label style="display:block;margin-bottom:4px;font-weight:500;font-size:14px;">Название поля</label><input type="text" placeholder="Введите значение" style="width:100%;padding:8px 12px;border:1px solid #ccc;border-radius:6px;font-size:14px;">',
        defaultStyle: {
            width: '250px',
            marginBottom: '16px'
        }
    },
    submitBtn: {
        tag: 'button',
        defaultText: 'Отправить',
        defaultAttrs: { type: 'submit' },
        defaultStyle: {
            padding: '10px 24px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
        }
    },
    resetBtn: {
        tag: 'button',
        defaultText: 'Сбросить',
        defaultAttrs: { type: 'reset' },
        defaultStyle: {
            padding: '10px 24px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
        }
    },
    
    // ===== ИНТЕРАКТИВНЫЕ =====
    accordion: {
        tag: 'div',
        innerHTML: '<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;"><div style="padding:16px;background:#f8fafc;cursor:pointer;font-weight:bold;display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;">Раздел 1 <span>▼</span></div><div style="padding:16px;">Содержимое первого раздела аккордеона.</div><div style="padding:16px;background:#f8fafc;cursor:pointer;font-weight:bold;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">Раздел 2 <span>▶</span></div><div style="padding:16px;background:#f8fafc;cursor:pointer;font-weight:bold;">Раздел 3 <span>▶</span></div></div>',
        defaultStyle: {
            width: '350px'
        }
    },
    dropdown: {
        tag: 'div',
        innerHTML: '<button style="padding:10px 16px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:8px;">Выберите опцию ▼</button><div style="position:absolute;top:100%;left:0;margin-top:4px;background:white;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:180px;"><div style="padding:10px 16px;cursor:pointer;border-bottom:1px solid #e5e7eb;">Опция 1</div><div style="padding:10px 16px;cursor:pointer;border-bottom:1px solid #e5e7eb;">Опция 2</div><div style="padding:10px 16px;cursor:pointer;">Опция 3</div></div>',
        defaultStyle: {
            position: 'relative',
            display: 'inline-block'
        }
    },
    carousel: {
        tag: 'div',
        innerHTML: '<div style="position:relative;overflow:hidden;border-radius:8px;"><img src="https://via.placeholder.com/400x200/3b82f6/ffffff?text=Слайд+1" style="width:100%;display:block;"><button style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.8);border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:18px;">←</button><button style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.8);border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:18px;">→</button><div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:8px;"><span style="width:10px;height:10px;background:white;border-radius:50%;"></span><span style="width:10px;height:10px;background:rgba(255,255,255,0.5);border-radius:50%;"></span><span style="width:10px;height:10px;background:rgba(255,255,255,0.5);border-radius:50%;"></span></div></div>',
        defaultStyle: {
            width: '400px'
        }
    },
    toggle: {
        tag: 'label',
        innerHTML: '<input type="checkbox" style="display:none;"><div style="width:50px;height:26px;background:#ccc;border-radius:13px;position:relative;cursor:pointer;transition:background 0.3s;"><div style="width:22px;height:22px;background:white;border-radius:50%;position:absolute;top:2px;left:2px;transition:left 0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div></div>',
        defaultStyle: {
            display: 'inline-block',
            cursor: 'pointer'
        }
    },
    rating: {
        tag: 'div',
        innerHTML: '<span style="font-size:24px;cursor:pointer;color:#fbbf24;">★</span><span style="font-size:24px;cursor:pointer;color:#fbbf24;">★</span><span style="font-size:24px;cursor:pointer;color:#fbbf24;">★</span><span style="font-size:24px;cursor:pointer;color:#fbbf24;">★</span><span style="font-size:24px;cursor:pointer;color:#d1d5db;">★</span>',
        defaultStyle: {
            display: 'flex',
            gap: '4px'
        }
    },
    
    // ===== ИКОНКИ =====
    icon: {
        tag: 'span',
        defaultText: '⭐',
        defaultStyle: {
            fontSize: '32px'
        }
    },
    avatar: {
        tag: 'div',
        innerHTML: '<img src="https://via.placeholder.com/60x60" style="width:100%;height:100%;object-fit:cover;">',
        defaultStyle: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #3b82f6'
        }
    },
    emoji: {
        tag: 'span',
        defaultText: '😀',
        defaultStyle: {
            fontSize: '48px'
        }
    }
};

// ========================================
// Initialization
// ========================================

function initApp() {
    console.log('Initializing Visual HTML Builder...');
    
    setupDragAndDrop();
    setupCanvasEvents();
    setupFileInput();
    setupMenus();
    setupKeyboardShortcuts();
    setupContextMenu();
    updateObjectTree();
    
    // Initialize canvas with grid
    const canvas = document.getElementById('designCanvas');
    if (showGrid) {
        canvas.classList.add('show-grid');
    }
    
    // Setup Monaco Editors
    setupMonacoEditors();
    
    // Initialize first page
    syncPageWithState();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('vhb-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
    
    // Try to restore autosaved project
    const autosaved = localStorage.getItem('vhb-autosave');
    if (autosaved) {
        try {
            const savedTime = localStorage.getItem('vhb-autosave-time');
            if (savedTime) {
                const timeAgo = Date.now() - parseInt(savedTime);
                if (timeAgo < 86400000) { // Less than 24 hours
                    logMessage('Найден автосохранённый проект. Используйте Файл → Открыть для восстановления.', 'info');
                }
            }
        } catch (e) {}
    }
    
    logMessage('Visual HTML Builder загружен и готов к работе', 'info');
}

// ========================================
// Context Menu
// ========================================

function setupContextMenu() {
    const canvas = document.getElementById('designCanvas');
    const contextMenu = document.getElementById('contextMenu');
    
    // Show context menu on right-click
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // Check if clicked on an element
        const wrapper = e.target.closest('.design-element');
        if (wrapper) {
            const id = wrapper.id.replace('wrapper-', '');
            selectElement(id);
        }
        
        showContextMenu(e.clientX, e.clientY);
    });
    
    // Hide context menu on click elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu();
        }
    });
    
    // Hide on scroll
    document.addEventListener('scroll', hideContextMenu);
    
    // Hide on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });
}

function showContextMenu(x, y) {
    const contextMenu = document.getElementById('contextMenu');
    
    // Adjust position to stay within viewport
    const menuWidth = 220;
    const menuHeight = 350;
    
    if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 10;
    }
    
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('show');
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.classList.remove('show');
}

// Context menu actions
function bringToFront() {
    hideContextMenu();
    if (!selectedElement) {
        logMessage('Нет выбранного элемента', 'warn');
        return;
    }
    
    saveState();
    const index = elements.findIndex(el => el.id === selectedElement.id);
    if (index > -1) {
        const element = elements.splice(index, 1)[0];
        elements.push(element);
        rebuildCanvas();
        selectElement(selectedElement.id);
        logMessage('Элемент перемещен на передний план', 'info');
    }
}

function sendToBack() {
    hideContextMenu();
    if (!selectedElement) {
        logMessage('Нет выбранного элемента', 'warn');
        return;
    }
    
    saveState();
    const index = elements.findIndex(el => el.id === selectedElement.id);
    if (index > -1) {
        const element = elements.splice(index, 1)[0];
        elements.unshift(element);
        rebuildCanvas();
        selectElement(selectedElement.id);
        logMessage('Элемент перемещен на задний план', 'info');
    }
}

function lockElement() {
    hideContextMenu();
    if (!selectedElement) {
        logMessage('Нет выбранного элемента', 'warn');
        return;
    }
    
    saveState();
    selectedElement.locked = !selectedElement.locked;
    
    const wrapper = document.getElementById(`wrapper-${selectedElement.id}`);
    if (wrapper) {
        wrapper.classList.toggle('locked', selectedElement.locked);
        wrapper.style.pointerEvents = selectedElement.locked ? 'none' : 'auto';
    }
    
    logMessage(`Элемент ${selectedElement.locked ? 'заблокирован' : 'разблокирован'}`, 'info');
    updateObjectTree();
}

function hideElement() {
    hideContextMenu();
    if (!selectedElement) {
        logMessage('Нет выбранного элемента', 'warn');
        return;
    }
    
    saveState();
    selectedElement.hidden = !selectedElement.hidden;
    
    const wrapper = document.getElementById(`wrapper-${selectedElement.id}`);
    if (wrapper) {
        wrapper.style.opacity = selectedElement.hidden ? '0.3' : '1';
    }
    
    logMessage(`Элемент ${selectedElement.hidden ? 'скрыт' : 'показан'}`, 'info');
    updateObjectTree();
}

// ========================================
// Multi-Page System
// ========================================

function getCurrentPage() {
    return pages.find(p => p.id === currentPageId) || pages[0];
}

function syncPageWithState() {
    const page = getCurrentPage();
    page.elements = [...elements];
    page.html = getEditorValue('html');
    page.css = getEditorValue('css');
    page.js = getEditorValue('js');
    page.settings = {
        canvasWidth: settings.canvasWidth,
        canvasHeight: settings.canvasHeight,
        canvasBgColor: settings.canvasBgColor
    };
}

function loadPageToState(page) {
    elements = [...page.elements];
    elementCounter = elements.length > 0 ? 
        Math.max(...elements.map(el => parseInt(el.id.replace(/\D/g, '')) || 0)) + 1 : 0;
    
    if (page.html) setEditorValue('html', page.html);
    if (page.css) setEditorValue('css', page.css);
    if (page.js) setEditorValue('js', page.js);
    
    if (page.settings) {
        settings.canvasWidth = page.settings.canvasWidth || 800;
        settings.canvasHeight = page.settings.canvasHeight || 600;
        settings.canvasBgColor = page.settings.canvasBgColor || '#ffffff';
        updateCanvasSettingsUI();
    }
    
    rebuildCanvas();
    updateObjectTree();
}

function addNewPage() {
    // Save current page first
    syncPageWithState();
    
    pageCounter++;
    const newPage = {
        id: pageCounter,
        name: `page${pageCounter}.html`,
        elements: [],
        html: '',
        css: '',
        js: '',
        settings: {
            canvasWidth: 800,
            canvasHeight: 600,
            canvasBgColor: '#ffffff'
        }
    };
    
    pages.push(newPage);
    currentPageId = newPage.id;
    
    // Clear state for new page
    elements = [];
    setEditorValue('html', '');
    setEditorValue('css', '');
    setEditorValue('js', getDefaultJS());
    
    rebuildCanvas();
    updatePagesTabs();
    updateObjectTree();
    deselectAll();
    
    logMessage(`Создана страница: ${newPage.name}`, 'info');
}

function switchPage(pageId) {
    if (currentPageId === pageId) return;
    
    // Save current page
    syncPageWithState();
    
    // Switch to new page
    currentPageId = pageId;
    const page = getCurrentPage();
    loadPageToState(page);
    
    updatePagesTabs();
    logMessage(`Открыта страница: ${page.name}`, 'info');
}

function closePage(pageId) {
    if (pages.length <= 1) {
        logMessage('Нельзя закрыть последнюю страницу', 'warn');
        return;
    }
    
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    const pageName = pages[pageIndex].name;
    
    if (!confirm(`Закрыть страницу "${pageName}"? Несохраненные изменения будут потеряны.`)) {
        return;
    }
    
    pages.splice(pageIndex, 1);
    
    // If closing current page, switch to another
    if (currentPageId === pageId) {
        const newPage = pages[Math.min(pageIndex, pages.length - 1)];
        currentPageId = newPage.id;
        loadPageToState(newPage);
    }
    
    updatePagesTabs();
    logMessage(`Закрыта страница: ${pageName}`, 'info');
}

function renamePage(pageId, newName) {
    const page = pages.find(p => p.id === pageId);
    if (page) {
        page.name = newName;
        updatePagesTabs();
        logMessage(`Страница переименована: ${newName}`, 'info');
    }
}

function updatePagesTabs() {
    const tabsContainer = document.getElementById('pagesTabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = pages.map(page => `
        <div class="page-tab ${page.id === currentPageId ? 'active' : ''}" 
            data-page="${page.id}" 
            onclick="switchPage(${page.id})"
            ondblclick="startRenamePage(${page.id})">
            <span class="page-name">${page.name}</span>
            ${pages.length > 1 ? `
                <button class="page-close" onclick="event.stopPropagation(); closePage(${page.id})" title="Закрыть">×</button>
            ` : ''}
        </div>
    `).join('');
}

function startRenamePage(pageId) {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    
    const tabEl = document.querySelector(`.page-tab[data-page="${pageId}"] .page-name`);
    if (!tabEl) return;
    
    const currentName = page.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'page-rename-input';
    input.value = currentName;
    
    input.onblur = () => {
        const newName = input.value.trim() || currentName;
        renamePage(pageId, newName);
    };
    
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            input.blur();
        } else if (e.key === 'Escape') {
            input.value = currentName;
            input.blur();
        }
    };
    
    tabEl.innerHTML = '';
    tabEl.appendChild(input);
    input.focus();
    input.select();
}

// Wait for DOM and Monaco
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ========================================
// Monaco Editor Setup
// ========================================

function setupMonacoEditors() {
    if (typeof monaco === 'undefined') {
        console.error('Monaco Editor not loaded!');
        logMessage('Ошибка: Monaco Editor не загружен', 'error');
        return;
    }
    
    console.log('Setting up Monaco Editors...');
    
    // Define custom theme
    monaco.editor.defineTheme('vhb-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6A9955' },
            { token: 'keyword', foreground: '569CD6' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'tag', foreground: '569CD6' },
            { token: 'attribute.name', foreground: '9CDCFE' },
            { token: 'attribute.value', foreground: 'CE9178' },
        ],
        colors: {
            'editor.background': '#1e1e1e',
            'editor.foreground': '#d4d4d4',
            'editorLineNumber.foreground': '#858585',
            'editorCursor.foreground': '#ffffff',
            'editor.selectionBackground': '#264f78',
            'editor.lineHighlightBackground': '#2a2a2a',
        }
    });
    
    // Common editor options
    const commonOptions = {
        theme: 'vhb-dark',
        fontSize: 14,
        fontFamily: "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
        fontLigatures: true,
        minimap: { enabled: true, scale: 1 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoIndent: 'full',
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
            other: true,
            comments: true,
            strings: true
        },
        parameterHints: { enabled: true },
        folding: true,
        foldingHighlight: true,
        showFoldingControls: 'always',
        matchBrackets: 'always',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        mouseWheelZoom: true,
        links: true,
        colorDecorators: true,
    };
    
    // Create HTML Editor
    const htmlContainer = document.getElementById('htmlEditorContainer');
    if (htmlContainer) {
        htmlEditor = monaco.editor.create(htmlContainer, {
            ...commonOptions,
            language: 'html',
            value: getDefaultHTML()
        });
        console.log('HTML Editor created');
    }
    
    // Create CSS Editor
    const cssContainer = document.getElementById('cssEditorContainer');
    if (cssContainer) {
        cssEditor = monaco.editor.create(cssContainer, {
            ...commonOptions,
            language: 'css',
            value: getDefaultCSS()
        });
        console.log('CSS Editor created');
    }
    
    // Create JS Editor
    const jsContainer = document.getElementById('jsEditorContainer');
    if (jsContainer) {
        jsEditor = monaco.editor.create(jsContainer, {
            ...commonOptions,
            language: 'javascript',
            value: getDefaultJS()
        });
        console.log('JS Editor created');
    }
    
    // Register custom completions
    registerHTMLCompletions();
    registerCSSCompletions();
    registerJSCompletions();
    
    // Setup auto-sync
    setupEditorSync();
    
    logMessage('Monaco редакторы инициализированы', 'info');
}

function getDefaultHTML() {
    return `<!-- HTML разметка вашего приложения -->
<div class="container">
    <!-- Элементы будут добавлены автоматически -->
</div>`;
}

function getDefaultCSS() {
    return `/* CSS стили вашего приложения */

.container {
    padding: 20px;
}

/* Добавьте свои стили ниже */
`;
}

function getDefaultJS() {
    return `// JavaScript код для вашего приложения

// Пример функции для кнопки
function buttonClick() {
    alert('Кнопка нажата!');
}

// Пример функции для обработки формы
function handleSubmit(event) {
    event.preventDefault();
    console.log('Форма отправлена');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Приложение загружено');
});
`;
}

function registerHTMLCompletions() {
    monaco.languages.registerCompletionItemProvider('html', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            
            const suggestions = [
                { label: 'div', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<div class="${1:class}">\n\t$0\n</div>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Блочный контейнер', range },
                { label: 'span', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<span class="${1:class}">$0</span>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Строчный контейнер', range },
                { label: 'button', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<button type="${1:button}" onclick="${2:handleClick()}">${3:Кнопка}</button>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Кнопка', range },
                { label: 'input', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<input type="${1:text}" name="${2:name}" placeholder="${3:Placeholder}">', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Поле ввода', range },
                { label: 'form', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<form action="${1:#}" method="${2:post}">\n\t$0\n</form>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Форма', range },
                { label: 'a', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<a href="${1:#}">${2:Ссылка}</a>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Ссылка', range },
                { label: 'img', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<img src="${1:url}" alt="${2:описание}">', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Изображение', range },
                { label: 'ul', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<ul>\n\t<li>$0</li>\n</ul>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Список', range },
                { label: 'table', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<table>\n\t<tr>\n\t\t<th>${1:Заголовок}</th>\n\t</tr>\n\t<tr>\n\t\t<td>${2:Данные}</td>\n\t</tr>\n</table>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Таблица', range },
                { label: 'h1', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<h1>$0</h1>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Заголовок', range },
                { label: 'p', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<p>$0</p>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Параграф', range },
            ];
            
            return { suggestions };
        }
    });
}

function registerCSSCompletions() {
    monaco.languages.registerCompletionItemProvider('css', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            
            const suggestions = [
                { label: 'flex-center', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'display: flex;\njustify-content: center;\nalign-items: center;', documentation: 'Flexbox центрирование', range },
                { label: 'grid-2col', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'display: grid;\ngrid-template-columns: repeat(2, 1fr);\ngap: 20px;', documentation: 'Grid 2 колонки', range },
                { label: 'shadow', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);', documentation: 'Тень', range },
                { label: 'transition', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'transition: all 0.3s ease;', documentation: 'Переход', range },
                { label: 'gradient', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);', documentation: 'Градиент', range },
            ];
            
            return { suggestions };
        }
    });
}

function registerJSCompletions() {
    monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            
            const suggestions = [
                { label: 'qs', kind: monaco.languages.CompletionItemKind.Snippet, insertText: "document.querySelector('${1:selector}')", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'querySelector', range },
                { label: 'qsa', kind: monaco.languages.CompletionItemKind.Snippet, insertText: "document.querySelectorAll('${1:selector}')", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'querySelectorAll', range },
                { label: 'gid', kind: monaco.languages.CompletionItemKind.Snippet, insertText: "document.getElementById('${1:id}')", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'getElementById', range },
                { label: 'adel', kind: monaco.languages.CompletionItemKind.Snippet, insertText: "${1:element}.addEventListener('${2:click}', (e) => {\n\t$0\n});", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'addEventListener', range },
                { label: 'fn', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'function ${1:name}(${2:params}) {\n\t$0\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Функция', range },
                { label: 'afn', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'const ${1:name} = (${2:params}) => {\n\t$0\n};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Стрелочная функция', range },
                { label: 'log', kind: monaco.languages.CompletionItemKind.Snippet, insertText: "console.log($0);", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'console.log', range },
                { label: 'fetch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: "fetch('${1:url}')\n\t.then(res => res.json())\n\t.then(data => {\n\t\t$0\n\t});", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Fetch API', range },
            ];
            
            return { suggestions };
        }
    });
}

// ========================================
// Menu System
// ========================================

function setupMenus() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-item')) {
            closeAllMenus();
        }
    });
}

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    const wasOpen = menu.classList.contains('show');
    
    closeAllMenus();
    
    if (!wasOpen) {
        menu.classList.add('show');
    }
    
    event.stopPropagation();
}

function closeAllMenus() {
    document.querySelectorAll('.menu-dropdown').forEach(menu => {
        menu.classList.remove('show');
    });
}

// ========================================
// Keyboard Shortcuts
// ========================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs (except for specific combos)
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveProject();
            return;
        }
        
        if (isInput) return;
        
        if (e.key === 'Delete' && selectedElement) {
            deleteSelected();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            newProject();
        }
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            loadProject();
        }
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undoAction();
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redoAction();
        }
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            copyElement();
        }
        if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            pasteElement();
        }
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            duplicateElement();
        }
        if (e.key === 'F1') {
            e.preventDefault();
            switchTab('design');
        }
        if (e.key === 'F2') {
            e.preventDefault();
            switchTab('html');
        }
        if (e.key === 'F3') {
            e.preventDefault();
            switchTab('css');
        }
        if (e.key === 'F4') {
            e.preventDefault();
            switchTab('js');
        }
        if (e.key === 'F5') {
            e.preventDefault();
            runPreview();
        }
    });
}

// ========================================
// Drag and Drop from Components Panel
// ========================================

function setupDragAndDrop() {
    const components = document.querySelectorAll('.component-item');
    const canvas = document.getElementById('designCanvas');

    components.forEach(comp => {
        comp.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('componentType', comp.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('componentType');
        if (type) {
            const rect = canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left) / canvasZoom;
            let y = (e.clientY - rect.top) / canvasZoom;
            
            if (snapToGrid) {
                x = Math.round(x / settings.gridSize) * settings.gridSize;
                y = Math.round(y / settings.gridSize) * settings.gridSize;
            }
            
            createElement(type, x, y);
        }
    });
    
    // Also support click to add
    components.forEach(comp => {
        comp.addEventListener('dblclick', (e) => {
            const type = comp.dataset.type;
            createElement(type, 50 + Math.random() * 100, 50 + Math.random() * 100);
        });
    });
}

// ========================================
// Create Element
// ========================================

function createElement(type, x, y) {
    const template = componentTemplates[type];
    if (!template) {
        console.error('Unknown component type:', type);
        return;
    }

    saveState();
    
    elementCounter++;
    const id = `${type}${elementCounter}`;

    const elementData = {
        id,
        type,
        name: id,
        x: Math.round(x),
        y: Math.round(y),
        style: { ...template.defaultStyle },
        attrs: template.defaultAttrs ? { ...template.defaultAttrs } : {},
        text: template.defaultText || '',
        innerHTML: template.innerHTML || null,
        events: {}
    };

    elements.push(elementData);
    renderElement(elementData);
    selectElement(id);
    updateObjectTree();
    logMessage(`Создан элемент: ${id}`, 'info');
}

// ========================================
// Render Element on Canvas
// ========================================

function renderElement(data) {
    const canvas = document.getElementById('designCanvas');
    const template = componentTemplates[data.type];

    const wrapper = document.createElement('div');
    wrapper.className = 'design-element';
    wrapper.id = `wrapper-${data.id}`;
    wrapper.style.left = data.x + 'px';
    wrapper.style.top = data.y + 'px';

    const el = document.createElement(template.tag);
    el.id = data.id;
    
    // Apply styles
    Object.assign(el.style, data.style);
    
    // Apply attributes
    if (data.attrs) {
        Object.entries(data.attrs).forEach(([key, value]) => {
            el.setAttribute(key, value);
        });
    }

    // Set content
    if (data.innerHTML) {
        el.innerHTML = data.innerHTML;
    } else if (data.text && template.tag !== 'input') {
        el.textContent = data.text;
    }

    wrapper.appendChild(el);

    // Resize handles
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        handle.dataset.handle = pos;
        wrapper.appendChild(handle);
    });

    canvas.appendChild(wrapper);
}

// ========================================
// Canvas Events
// ========================================

function setupCanvasEvents() {
    const canvas = document.getElementById('designCanvas');

    canvas.addEventListener('mousedown', (e) => {
        const wrapper = e.target.closest('.design-element');
        const handle = e.target.closest('.resize-handle');

        if (handle && selectedElement) {
            isResizing = true;
            resizeHandle = handle.dataset.handle;
            e.preventDefault();
            return;
        }

        if (wrapper) {
            const id = wrapper.id.replace('wrapper-', '');
            selectElement(id);
            
            isDragging = true;
            const rect = wrapper.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            e.preventDefault();
        } else if (e.target === canvas) {
            deselectAll();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && selectedElement) {
            const canvas = document.getElementById('designCanvas');
            const canvasRect = canvas.getBoundingClientRect();
            const wrapper = document.getElementById(`wrapper-${selectedElement.id}`);
            
            let x = (e.clientX - canvasRect.left - dragOffset.x) / canvasZoom;
            let y = (e.clientY - canvasRect.top - dragOffset.y) / canvasZoom;
            
            if (snapToGrid) {
                x = Math.round(x / settings.gridSize) * settings.gridSize;
                y = Math.round(y / settings.gridSize) * settings.gridSize;
            }
            
            x = Math.max(0, x);
            y = Math.max(0, y);
            
            wrapper.style.left = x + 'px';
            wrapper.style.top = y + 'px';
            selectedElement.x = x;
            selectedElement.y = y;
            updateProperties();
        }

        if (isResizing && selectedElement) {
            const wrapper = document.getElementById(`wrapper-${selectedElement.id}`);
            const innerEl = document.getElementById(selectedElement.id);
            const canvasRect = document.getElementById('designCanvas').getBoundingClientRect();
            
            let newWidth = parseInt(selectedElement.style.width) || 100;
            let newHeight = parseInt(selectedElement.style.height) || 50;
            
            if (resizeHandle.includes('e')) {
                newWidth = (e.clientX - canvasRect.left) / canvasZoom - selectedElement.x;
            }
            if (resizeHandle.includes('s')) {
                newHeight = (e.clientY - canvasRect.top) / canvasZoom - selectedElement.y;
            }
            
            if (snapToGrid) {
                newWidth = Math.round(newWidth / settings.gridSize) * settings.gridSize;
                newHeight = Math.round(newHeight / settings.gridSize) * settings.gridSize;
            }
            
            newWidth = Math.max(50, newWidth);
            newHeight = Math.max(20, newHeight);
            
            selectedElement.style.width = newWidth + 'px';
            selectedElement.style.height = newHeight + 'px';
            innerEl.style.width = newWidth + 'px';
            innerEl.style.height = newHeight + 'px';
            updateProperties();
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            saveState();
        }
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    });

    // Double click to edit text
    canvas.addEventListener('dblclick', (e) => {
        if (selectedElement && ['label', 'button', 'heading', 'paragraph', 'link'].includes(selectedElement.type)) {
            const el = document.getElementById(selectedElement.id);
            const newText = prompt('Введите текст:', selectedElement.text);
            if (newText !== null) {
                saveState();
                selectedElement.text = newText;
                el.textContent = newText;
                updateProperties();
            }
        }
    });
}

// ========================================
// Selection
// ========================================

function selectElement(id) {
    deselectAll();
    const data = elements.find(el => el.id === id);
    if (!data) return;

    selectedElement = data;
    const wrapper = document.getElementById(`wrapper-${id}`);
    if (wrapper) {
        wrapper.classList.add('selected');
    }
    
    updateProperties();
    updateEvents();
    updateObjectTree();
    updateStatus(`Выбран: ${id}`);
}

function deselectAll() {
    selectedElement = null;
    document.querySelectorAll('.design-element').forEach(el => {
        el.classList.remove('selected');
    });
    
    document.getElementById('propertiesPanel').innerHTML = `
        <div class="empty-message">
            Выберите элемент<br>для редактирования
        </div>
    `;
    document.getElementById('eventsPanel').innerHTML = `
        <div class="empty-message">
            Выберите элемент<br>для настройки событий
        </div>
    `;
    updateObjectTree();
}

function selectAllElements() {
    logMessage('Выделены все элементы: ' + elements.length, 'info');
}

// ========================================
// Properties Panel - moved to end of file
// ========================================

// ========================================
// Events Panel
// ========================================

function updateEvents() {
    if (!selectedElement) return;
    
    const panel = document.getElementById('eventsPanel');
    const events = ['onclick', 'onmouseover', 'onmouseout', 'onchange', 'oninput'];
    
    panel.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            ${events.map(event => `
                <div class="property-group" style="margin-bottom: 0;">
                    <label class="property-label">${event}</label>
                    <input type="text" class="property-input" 
                        placeholder="functionName()" 
                        value="${selectedElement.events[event] || ''}" 
                        onchange="updateElementEvent('${event}', this.value)">
                </div>
            `).join('')}
        </div>
    `;
}

// ========================================
// Update Functions
// ========================================

function updateElementProperty(prop, value) {
    if (!selectedElement) return;
    
    saveState();
    selectedElement[prop] = value;
    
    if (prop === 'x' || prop === 'y') {
        const wrapper = document.getElementById(`wrapper-${selectedElement.id}`);
        wrapper.style[prop === 'x' ? 'left' : 'top'] = value + 'px';
    } else if (prop === 'text') {
        const el = document.getElementById(selectedElement.id);
        el.textContent = value;
    } else if (prop === 'name') {
        updateObjectTree();
    }
}

function updateElementStyle(prop, value) {
    if (!selectedElement) return;
    
    saveState();
    selectedElement.style[prop] = value;
    const el = document.getElementById(selectedElement.id);
    el.style[prop] = value;
}

function updateElementEvent(event, value) {
    if (!selectedElement) return;
    saveState();
    selectedElement.events[event] = value;
}

// ========================================
// Object Tree
// ========================================

function updateObjectTree() {
    const tree = document.getElementById('objectTree');
    if (elements.length === 0) {
        tree.innerHTML = '<div style="color: #666; padding: 8px;">Нет элементов</div>';
        return;
    }
    
    tree.innerHTML = elements.map(el => {
        let icons = '📦';
        if (el.locked) icons = '🔒';
        if (el.hidden) icons = '👁';
        if (el.locked && el.hidden) icons = '🔒👁';
        
        return `
            <div class="tree-item ${selectedElement?.id === el.id ? 'selected' : ''}" 
                onclick="selectElement('${el.id}')"
                oncontextmenu="selectElement('${el.id}'); showContextMenu(event.clientX, event.clientY); event.preventDefault();">
                ${icons} ${el.name} (${el.type})
            </div>
        `;
    }).join('');
}

// ========================================
// Undo/Redo
// ========================================

function saveState() {
    undoStack.push(JSON.stringify(elements));
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
}

function undoAction() {
    if (undoStack.length === 0) {
        logMessage('Нечего отменять', 'warn');
        return;
    }
    
    redoStack.push(JSON.stringify(elements));
    const state = undoStack.pop();
    elements = JSON.parse(state);
    rebuildCanvas();
    logMessage('Действие отменено', 'info');
}

function redoAction() {
    if (redoStack.length === 0) {
        logMessage('Нечего повторять', 'warn');
        return;
    }
    
    undoStack.push(JSON.stringify(elements));
    const state = redoStack.pop();
    elements = JSON.parse(state);
    rebuildCanvas();
    logMessage('Действие повторено', 'info');
}

function rebuildCanvas() {
    const canvas = document.getElementById('designCanvas');
    canvas.innerHTML = '';
    elements.forEach(el => renderElement(el));
    deselectAll();
    updateObjectTree();
}

// ========================================
// Copy/Paste/Duplicate
// ========================================

function copyElement() {
    if (!selectedElement) {
        logMessage('Нет выбранного элемента для копирования', 'warn');
        return;
    }
    clipboard = JSON.parse(JSON.stringify(selectedElement));
    logMessage('Элемент скопирован', 'info');
}

function cutElement() {
    if (!selectedElement) {
        logMessage('Нет выбранного элемента для вырезания', 'warn');
        return;
    }
    copyElement();
    deleteSelected();
    logMessage('Элемент вырезан', 'info');
}

function pasteElement() {
    if (!clipboard) {
        logMessage('Буфер обмена пуст', 'warn');
        return;
    }
    
    saveState();
    elementCounter++;
    const newElement = JSON.parse(JSON.stringify(clipboard));
    newElement.id = `${newElement.type}${elementCounter}`;
    newElement.name = newElement.id;
    newElement.x += 20;
    newElement.y += 20;
    
    elements.push(newElement);
    renderElement(newElement);
    selectElement(newElement.id);
    updateObjectTree();
    logMessage('Элемент вставлен', 'info');
}

function duplicateElement() {
    if (!selectedElement) {
        logMessage('Нет выбранного элемента для дублирования', 'warn');
        return;
    }
    
    copyElement();
    pasteElement();
}

// ========================================
// Delete Selected
// ========================================

function deleteSelected() {
    if (!selectedElement) {
        logMessage('Нет выбранного элемента для удаления', 'warn');
        return;
    }
    
    saveState();
    const id = selectedElement.id;
    const wrapper = document.getElementById(`wrapper-${id}`);
    if (wrapper) wrapper.remove();
    
    elements = elements.filter(el => el.id !== id);
    selectedElement = null;
    updateObjectTree();
    deselectAll();
    logMessage(`Удален элемент: ${id}`, 'info');
}

// ========================================
// Tab Switching
// ========================================

function switchTab(tab) {
    currentTab = tab;
    closeAllMenus();
    
    // Hide all panels and deactivate tabs
    ['design', 'html', 'css', 'js', 'preview'].forEach(t => {
        const panel = document.getElementById(`${t}Panel`);
        const tabBtn = document.getElementById(`tab${capitalize(t)}`);
        if (panel) panel.classList.add('hidden');
        if (tabBtn) tabBtn.classList.remove('active');
    });
    
    // Show selected panel
    const activePanel = document.getElementById(`${tab}Panel`);
    const activeTab = document.getElementById(`tab${capitalize(tab)}`);
    if (activePanel) activePanel.classList.remove('hidden');
    if (activeTab) activeTab.classList.add('active');
    
    // Generate code when switching to code tabs
    if (tab === 'html') {
        generateHTML();
        setTimeout(() => { if (htmlEditor) htmlEditor.layout(); }, 100);
    }
    if (tab === 'css') {
        generateCSS();
        setTimeout(() => { if (cssEditor) cssEditor.layout(); }, 100);
    }
    if (tab === 'js') {
        setTimeout(() => { if (jsEditor) jsEditor.layout(); }, 100);
    }
    if (tab === 'preview') {
        updatePreview();
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// Code Generation
// ========================================

function generateHTML() {
    let html = '';
    elements.forEach(el => {
        const template = componentTemplates[el.type];
        let tag = template.tag;
        let attrs = [];
        
        attrs.push(`id="${el.id}"`);
        attrs.push(`class="${el.id}-style"`);
        
        if (el.attrs) {
            Object.entries(el.attrs).forEach(([key, value]) => {
                attrs.push(`${key}="${value}"`);
            });
        }
        
        // Events
        Object.entries(el.events).forEach(([event, handler]) => {
            if (handler) attrs.push(`${event}="${handler}"`);
        });
        
        if (['input', 'img', 'progress'].includes(tag)) {
            html += `<${tag} ${attrs.join(' ')}>\n`;
        } else {
            const content = el.innerHTML || el.text || '';
            html += `<${tag} ${attrs.join(' ')}>${content}</${tag}>\n`;
        }
    });
    
    if (htmlEditor) {
        htmlEditor.setValue(html || '<!-- Добавьте элементы на холст -->');
    }
}

function generateCSS() {
    let css = '';
    elements.forEach(el => {
        css += `.${el.id}-style {\n`;
        css += `  position: absolute;\n`;
        css += `  left: ${el.x}px;\n`;
        css += `  top: ${el.y}px;\n`;
        Object.entries(el.style).forEach(([prop, value]) => {
            const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `  ${cssProp}: ${value};\n`;
        });
        css += `}\n\n`;
    });
    
    if (cssEditor) {
        cssEditor.setValue(css || '/* Стили будут сгенерированы автоматически */');
    }
}

function getEditorValue(editorType) {
    switch (editorType) {
        case 'html': return htmlEditor ? htmlEditor.getValue() : '';
        case 'css': return cssEditor ? cssEditor.getValue() : '';
        case 'js': return jsEditor ? jsEditor.getValue() : '';
        default: return '';
    }
}

function setEditorValue(editorType, value) {
    switch (editorType) {
        case 'html': if (htmlEditor) htmlEditor.setValue(value); break;
        case 'css': if (cssEditor) cssEditor.setValue(value); break;
        case 'js': if (jsEditor) jsEditor.setValue(value); break;
    }
}

// ========================================
// Preview
// ========================================

function runPreview() {
    switchTab('preview');
}

function updatePreview() {
    // Use multi-page preview if there are multiple pages
    if (pages.length > 1) {
        updatePreviewMultiPage();
        return;
    }
    
    generateHTML();
    generateCSS();
    
    const html = getEditorValue('html');
    const css = getEditorValue('css');
    const js = getEditorValue('js');
    
    const pluginLinks = getPluginLinks();
    const canvasWidth = settings.canvasWidth || 800;
    const canvasHeight = settings.canvasHeight || 600;
    const canvasBgColor = settings.canvasBgColor || '#ffffff';
    
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${pluginLinks}
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            min-height: 100vh;
            background-color: #f0f0f0;
        }
        .preview-container {
            width: ${canvasWidth}px;
            min-height: ${canvasHeight}px;
            background-color: ${canvasBgColor};
            margin: 0 auto;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        ${css}
    </style>
</head>
<body>
    <div class="preview-container">
        ${html}
    </div>
    <script>
        // Navigation function for compatibility
        function navigateToPage(pageName) {
            console.log('Single page mode - cannot navigate to:', pageName);
            alert('Для навигации между страницами создайте несколько страниц в проекте');
        }
        
        try {
            ${js}
        } catch(e) {
            console.error('JS Error:', e);
        }
    <\/script>
</body>
</html>`;
    
    const frame = document.getElementById('previewFrame');
    frame.srcdoc = fullHTML;
    logMessage('Предпросмотр обновлен', 'info');
}

function runInNewWindow() {
    // Use multi-page version if there are multiple pages
    if (pages.length > 1) {
        runInNewWindowMultiPage();
        return;
    }
    
    generateHTML();
    generateCSS();
    
    const html = getEditorValue('html');
    const css = getEditorValue('css');
    const js = getEditorValue('js');
    
    const pluginLinks = getPluginLinks();
    const canvasWidth = settings.canvasWidth || 800;
    const canvasHeight = settings.canvasHeight || 600;
    const canvasBgColor = settings.canvasBgColor || '#ffffff';
    
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - Visual HTML Builder</title>
    ${pluginLinks}
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            min-height: 100vh;
            background-color: #f0f0f0;
        }
        .preview-container {
            width: ${canvasWidth}px;
            min-height: ${canvasHeight}px;
            background-color: ${canvasBgColor};
            margin: 0 auto;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        ${css}
    </style>
</head>
<body>
    <div class="preview-container">
        ${html}
    </div>
    <script>
        function navigateToPage(pageName) {
            alert('Для навигации между страницами создайте несколько страниц в проекте');
        }
        
        try {
            ${js}
        } catch(e) {
            console.error('JS Error:', e);
        }
    <\/script>
</body>
</html>`;
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(fullHTML);
    newWindow.document.close();
    logMessage('Открыто в новом окне', 'info');
}

function runInNewWindowMultiPage() {
    const allPages = generateAllPagesHTML();
    const currentPage = getCurrentPage();
    const pluginLinks = getPluginLinks();
    
    const pageNames = pages.map(p => `'${p.name}'`).join(',');
    
    // Combine all CSS
    let allCSS = '';
    Object.values(allPages).forEach(page => {
        allCSS += page.css;
    });
    
    // Combine all JS
    let allJS = '';
    Object.values(allPages).forEach(page => {
        allJS += page.js + '\n';
    });
    
    const canvasWidth = currentPage.settings?.canvasWidth || settings.canvasWidth || 800;
    const canvasHeight = currentPage.settings?.canvasHeight || settings.canvasHeight || 600;
    const canvasBgColor = currentPage.settings?.canvasBgColor || settings.canvasBgColor || '#ffffff';
    
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - Visual HTML Builder</title>
    ${pluginLinks}
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            min-height: 100vh;
            background-color: #f0f0f0;
        }
        .app-container {
            width: ${canvasWidth}px;
            min-height: ${canvasHeight}px;
            background-color: ${canvasBgColor};
            margin: 0 auto;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .page { display: none; position: relative; width: 100%; min-height: ${canvasHeight}px; }
        .page.active { display: block; }
        ${allCSS}
    </style>
</head>
<body>
    <div class="app-container">
        ${pages.map((p, i) => `
        <div class="page ${i === 0 ? 'active' : ''}" id="page-${p.name.replace('.html', '')}">
            ${allPages[p.name]?.html || ''}
        </div>
        `).join('')}
    </div>
    <script>
        const availablePages = [${pageNames}];
        let currentPageName = '${pages[0]?.name || 'index.html'}';
        
        function navigateToPage(pageName) {
            console.log('Navigating to:', pageName);
            
            document.querySelectorAll('.page').forEach(p => {
                p.classList.remove('active');
            });
            
            const pageId = 'page-' + pageName.replace('.html', '');
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
                currentPageName = pageName;
            } else {
                console.error('Page not found:', pageName);
            }
        }
        
        try {
            ${allJS}
        } catch(e) {
            console.error('JS Error:', e);
        }
    <\/script>
</body>
</html>`;
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(fullHTML);
    newWindow.document.close();
    logMessage('Открыто в новом окне (многостраничный)', 'info');
}

function getPluginLinks() {
    let links = '';
    
    // Built-in plugins
    if (plugins.bootstrap) {
        links += '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n';
        links += '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"><\/script>\n';
    }
    if (plugins.fontawesome) {
        links += '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">\n';
    }
    if (plugins.animate) {
        links += '<link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet">\n';
    }
    if (plugins.jquery) {
        links += '<script src="https://code.jquery.com/jquery-3.7.0.min.js"><\/script>\n';
    }
    
    // Custom plugins
    customPlugins.forEach(plugin => {
        if (plugin.css) {
            links += `<link href="${plugin.css}" rel="stylesheet">\n`;
        }
        if (plugin.js) {
            links += `<script src="${plugin.js}"><\/script>\n`;
        }
    });
    
    return links;
}

function getCanvasStyles() {
    const width = settings.canvasWidth || 800;
    const height = settings.canvasHeight || 600;
    const bgColor = settings.canvasBgColor || '#ffffff';
    
    return `
        width: ${width}px;
        min-height: ${height}px;
        background-color: ${bgColor};
    `;
}

// ========================================
// Export
// ========================================

function exportHTML() {
    generateHTML();
    generateCSS();
    
    const html = getEditorValue('html');
    const css = getEditorValue('css');
    const js = getEditorValue('js');
    
    const pluginLinks = getPluginLinks();
    const canvasWidth = settings.canvasWidth || 800;
    const canvasHeight = settings.canvasHeight || 600;
    const canvasBgColor = settings.canvasBgColor || '#ffffff';
    
    const fullHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Application</title>
    ${pluginLinks}
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            min-height: 100vh;
            background-color: #f0f0f0;
        }
        .app-container {
            width: ${canvasWidth}px;
            min-height: ${canvasHeight}px;
            background-color: ${canvasBgColor};
            margin: 0 auto;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
${css}
    </style>
</head>
<body>
    <div class="app-container">
${html}
    </div>
    <script>
${js}
    <\/script>
</body>
</html>`;
    
    downloadFile(fullHTML, 'application.html', 'text/html');
    logMessage('HTML файл экспортирован', 'info');
}

function exportCSS() {
    generateCSS();
    const css = getEditorValue('css');
    downloadFile(css, 'styles.css', 'text/css');
    logMessage('CSS файл экспортирован', 'info');
}

function exportJS() {
    const js = getEditorValue('js');
    downloadFile(js, 'script.js', 'text/javascript');
    logMessage('JavaScript файл экспортирован', 'info');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// Save/Load Project
// ========================================

function saveProject() {
    // Sync current page before saving
    syncPageWithState();
    
    const project = {
        version: '2.0',
        pages,
        currentPageId,
        plugins,
        customPlugins,
        globalSettings: settings
    };
    
    downloadFile(JSON.stringify(project, null, 2), 'project.vhb', 'application/json');
    logMessage('Проект сохранен', 'info');
}

function saveProjectAs() {
    const name = prompt('Введите имя проекта:', 'project');
    if (name) {
        syncPageWithState();
        
        const project = {
            version: '2.0',
            pages,
            currentPageId,
            plugins,
            customPlugins,
            globalSettings: settings
        };
        
        downloadFile(JSON.stringify(project, null, 2), `${name}.vhb`, 'application/json');
        logMessage(`Проект сохранен как: ${name}.vhb`, 'info');
    }
}

function loadProject() {
    // Check for autosaved project
    const autosaved = localStorage.getItem('vhb-autosave');
    if (autosaved) {
        openModal('Загрузить проект', `
            <div class="settings-group">
                <h4>Выберите источник</h4>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                    <button class="property-btn" onclick="loadProjectFromFile()" style="padding: 16px;">
                        📂 Загрузить из файла (.vhb)
                    </button>
                    <button class="property-btn" onclick="loadProjectFromAutosave()" style="padding: 16px;">
                        💾 Восстановить автосохранение
                    </button>
                </div>
            </div>
        `);
    } else {
        loadProjectFromFile();
    }
}

function loadProjectFromFile() {
    closeModal();
    document.getElementById('fileInput').click();
}

function loadProjectFromAutosave() {
    closeModal();
    const autosaved = localStorage.getItem('vhb-autosave');
    if (!autosaved) {
        logMessage('Нет автосохранённого проекта', 'warn');
        return;
    }
    
    try {
        const project = JSON.parse(autosaved);
        restoreProject(project);
        logMessage('Автосохранённый проект восстановлен', 'info');
    } catch (err) {
        logMessage('Ошибка восстановления: ' + err.message, 'error');
    }
}

function restoreProject(project) {
    // Clear canvas
    document.getElementById('designCanvas').innerHTML = '';
    elements = [];
    
    // Check if new multi-page format
    if (project.version === '2.0' && project.pages) {
        pages = project.pages;
        currentPageId = project.currentPageId || pages[0].id;
        pageCounter = Math.max(...pages.map(p => p.id));
        
        const currentPage = getCurrentPage();
        loadPageToState(currentPage);
        updatePagesTabs();
    } else {
        // Legacy single-page format
        pages = [{
            id: 0,
            name: 'index.html',
            elements: project.elements || [],
            html: project.html || '',
            css: project.css || '',
            js: project.js || '',
            settings: project.settings || {}
        }];
        currentPageId = 0;
        pageCounter = 0;
        
        loadPageToState(pages[0]);
        updatePagesTabs();
    }
    
    // Load plugins
    if (project.plugins) {
        plugins = project.plugins;
        updatePluginCheckboxes();
    }
    
    // Load custom plugins
    if (project.customPlugins) {
        customPlugins = project.customPlugins;
    }
    
    // Load global settings
    if (project.globalSettings) {
        settings = { ...settings, ...project.globalSettings };
        updateCanvasSettingsUI();
        
        // Apply theme
        if (settings.theme) {
            setTheme(settings.theme);
        }
    }
    
    updateObjectTree();
    deselectAll();
}

function setupFileInput() {
    document.getElementById('fileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const project = JSON.parse(event.target.result);
                restoreProject(project);
                logMessage('Проект загружен: ' + file.name, 'info');
            } catch (err) {
                logMessage('Ошибка загрузки проекта: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}

function newProject() {
    if (elements.length > 0 || pages.length > 1) {
        if (!confirm('Создать новый проект? Несохраненные изменения будут потеряны.')) return;
    }
    
    document.getElementById('designCanvas').innerHTML = '';
    elements = [];
    elementCounter = 0;
    undoStack = [];
    redoStack = [];
    
    // Reset pages
    pages = [{
        id: 0,
        name: 'index.html',
        elements: [],
        html: '',
        css: '',
        js: '',
        settings: {
            canvasWidth: 800,
            canvasHeight: 600,
            canvasBgColor: '#ffffff'
        }
    }];
    currentPageId = 0;
    pageCounter = 0;
    
    if (htmlEditor) htmlEditor.setValue(getDefaultHTML());
    if (cssEditor) cssEditor.setValue(getDefaultCSS());
    if (jsEditor) jsEditor.setValue(getDefaultJS());
    
    updatePagesTabs();
    updateObjectTree();
    deselectAll();
    updateCanvasSettingsUI();
    logMessage('Новый проект создан', 'info');
}

function clearProject() {
    if (confirm('Очистить все элементы проекта?')) {
        saveState();
        document.getElementById('designCanvas').innerHTML = '';
        elements = [];
        updateObjectTree();
        deselectAll();
        logMessage('Проект очищен', 'info');
    }
}

// ========================================
// View Functions
// ========================================

function togglePanel(panel) {
    closeAllMenus();
    const panelEl = document.getElementById(`panel${capitalize(panel)}`);
    if (panelEl) {
        panelEl.classList.toggle('hidden');
        logMessage(`Панель ${panel} ${panelEl.classList.contains('hidden') ? 'скрыта' : 'показана'}`, 'info');
    }
}

function toggleGrid() {
    closeAllMenus();
    showGrid = !showGrid;
    const canvas = document.getElementById('designCanvas');
    canvas.classList.toggle('show-grid', showGrid);
    logMessage(`Сетка ${showGrid ? 'включена' : 'выключена'}`, 'info');
}

function toggleSnapToGrid() {
    closeAllMenus();
    snapToGrid = !snapToGrid;
    logMessage(`Привязка к сетке ${snapToGrid ? 'включена' : 'выключена'}`, 'info');
}

function zoomIn() {
    closeAllMenus();
    canvasZoom = Math.min(2, canvasZoom + 0.1);
    applyZoom();
}

function zoomOut() {
    closeAllMenus();
    canvasZoom = Math.max(0.5, canvasZoom - 0.1);
    applyZoom();
}

function zoomReset() {
    closeAllMenus();
    canvasZoom = 1;
    applyZoom();
}

function applyZoom() {
    const canvas = document.getElementById('designCanvas');
    canvas.style.transform = `scale(${canvasZoom})`;
    canvas.style.transformOrigin = 'top left';
    logMessage(`Масштаб: ${Math.round(canvasZoom * 100)}%`, 'info');
}

// ========================================
// Project Menu Functions
// ========================================

function validateHTML() {
    closeAllMenus();
    generateHTML();
    const html = getEditorValue('html');
    
    const openTags = (html.match(/<[a-z][^>]*>/gi) || []).length;
    const closeTags = (html.match(/<\/[a-z]+>/gi) || []).length;
    
    if (openTags > 0) {
        logMessage(`HTML проверен: ${openTags} открывающих, ${closeTags} закрывающих тегов`, 'info');
    } else {
        logMessage('HTML пуст', 'warn');
    }
}

function validateCSS() {
    closeAllMenus();
    generateCSS();
    const css = getEditorValue('css');
    
    const rules = (css.match(/\{[^}]*\}/g) || []).length;
    logMessage(`CSS проверен: ${rules} правил`, 'info');
}

function validateJS() {
    closeAllMenus();
    const js = getEditorValue('js');
    
    try {
        new Function(js);
        logMessage('JavaScript синтаксис корректен', 'info');
    } catch (err) {
        logMessage('JavaScript ошибка: ' + err.message, 'error');
    }
}

function showProjectInfo() {
    closeAllMenus();
    openModal('Информация о проекте', `
        <div class="settings-group">
            <h4>Статистика</h4>
            <div class="settings-row">
                <span class="settings-label">Элементов:</span>
                <span>${elements.length}</span>
            </div>
            <div class="settings-row">
                <span class="settings-label">Размер холста:</span>
                <span>${settings.canvasWidth} × ${settings.canvasHeight}</span>
            </div>
            <div class="settings-row">
                <span class="settings-label">Масштаб:</span>
                <span>${Math.round(canvasZoom * 100)}%</span>
            </div>
        </div>
    `);
}

// ========================================
// Settings
// ========================================

function openSettings(section) {
    closeAllMenus();
    let content = '';
    
    switch (section) {
        case 'general':
            content = `
                <div class="settings-group">
                    <h4>Общие настройки</h4>
                    <div class="settings-row">
                        <span class="settings-label">Автосохранение:</span>
                        <input type="checkbox" class="settings-checkbox" ${settings.autoSave ? 'checked' : ''} 
                            onchange="settings.autoSave = this.checked">
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Интервал автосохранения:</span>
                        <select class="settings-select" onchange="setAutoSaveInterval(this.value)">
                            <option value="60000">1 минута</option>
                            <option value="300000">5 минут</option>
                            <option value="600000">10 минут</option>
                        </select>
                    </div>
                </div>
            `;
            break;
        case 'editor':
            content = `
                <div class="settings-group">
                    <h4>Настройки редактора кода</h4>
                    <div class="settings-row">
                        <span class="settings-label">Размер шрифта:</span>
                        <input type="number" class="settings-input" value="${settings.editor.fontSize}" min="10" max="32"
                            onchange="updateEditorSettings('fontSize', parseInt(this.value))">
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Семейство шрифта:</span>
                        <select class="settings-select" onchange="updateEditorSettings('fontFamily', this.value)">
                            <option value="'Cascadia Code', 'Fira Code', Consolas, monospace" ${settings.editor.fontFamily.includes('Cascadia') ? 'selected' : ''}>Cascadia Code</option>
                            <option value="'Fira Code', Consolas, monospace" ${settings.editor.fontFamily.includes('Fira') && !settings.editor.fontFamily.includes('Cascadia') ? 'selected' : ''}>Fira Code</option>
                            <option value="Consolas, monospace" ${settings.editor.fontFamily === 'Consolas, monospace' ? 'selected' : ''}>Consolas</option>
                            <option value="'JetBrains Mono', monospace" ${settings.editor.fontFamily.includes('JetBrains') ? 'selected' : ''}>JetBrains Mono</option>
                            <option value="'Source Code Pro', monospace" ${settings.editor.fontFamily.includes('Source Code') ? 'selected' : ''}>Source Code Pro</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Размер табуляции:</span>
                        <select class="settings-select" onchange="updateEditorSettings('tabSize', parseInt(this.value))">
                            <option value="2" ${settings.editor.tabSize === 2 ? 'selected' : ''}>2 пробела</option>
                            <option value="4" ${settings.editor.tabSize === 4 ? 'selected' : ''}>4 пробела</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Тема редактора:</span>
                        <select class="settings-select" onchange="updateEditorSettings('theme', this.value)">
                            <option value="vs-dark" ${settings.editor.theme === 'vs-dark' ? 'selected' : ''}>Dark (VS Code)</option>
                            <option value="vs" ${settings.editor.theme === 'vs' ? 'selected' : ''}>Light (VS Code)</option>
                            <option value="hc-black" ${settings.editor.theme === 'hc-black' ? 'selected' : ''}>High Contrast</option>
                            <option value="vhb-dark" ${settings.editor.theme === 'vhb-dark' ? 'selected' : ''}>VHB Dark</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Перенос строк:</span>
                        <select class="settings-select" onchange="updateEditorSettings('wordWrap', this.value)">
                            <option value="on" ${settings.editor.wordWrap === 'on' ? 'selected' : ''}>Включен</option>
                            <option value="off" ${settings.editor.wordWrap === 'off' ? 'selected' : ''}>Выключен</option>
                            <option value="wordWrapColumn" ${settings.editor.wordWrap === 'wordWrapColumn' ? 'selected' : ''}>По колонке</option>
                        </select>
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Мини-карта:</span>
                        <input type="checkbox" class="settings-checkbox" ${settings.editor.minimap ? 'checked' : ''} 
                            onchange="updateEditorSettings('minimap', this.checked)">
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Номера строк:</span>
                        <input type="checkbox" class="settings-checkbox" ${settings.editor.lineNumbers ? 'checked' : ''} 
                            onchange="updateEditorSettings('lineNumbers', this.checked)">
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Автозакрытие скобок:</span>
                        <input type="checkbox" class="settings-checkbox" ${settings.editor.autoCloseBrackets ? 'checked' : ''} 
                            onchange="updateEditorSettings('autoCloseBrackets', this.checked)">
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Форматировать при вставке:</span>
                        <input type="checkbox" class="settings-checkbox" ${settings.editor.formatOnPaste ? 'checked' : ''} 
                            onchange="updateEditorSettings('formatOnPaste', this.checked)">
                    </div>
                </div>
            `;
            break;
        case 'theme':
            content = `
                <div class="settings-group">
                    <h4>Тема оформления IDE</h4>
                    <p style="color: #888; margin-bottom: 16px;">Выберите цветовую схему интерфейса</p>
                    <div class="theme-cards">
                        <div class="theme-card ${settings.theme === 'dark' ? 'active' : ''}" onclick="setTheme('dark')">
                            <div class="theme-card-preview" style="background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);"></div>
                            <div class="theme-card-name">🌙 Тёмная</div>
                        </div>
                        <div class="theme-card ${settings.theme === 'light' ? 'active' : ''}" onclick="setTheme('light')">
                            <div class="theme-card-preview" style="background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%); border: 1px solid #ccc;"></div>
                            <div class="theme-card-name">☀️ Светлая</div>
                        </div>
                        <div class="theme-card ${settings.theme === 'blue' ? 'active' : ''}" onclick="setTheme('blue')">
                            <div class="theme-card-preview" style="background: linear-gradient(135deg, #0a1929 0%, #132f4c 100%);"></div>
                            <div class="theme-card-name">🌊 Синяя</div>
                        </div>
                        <div class="theme-card ${settings.theme === 'green' ? 'active' : ''}" onclick="setTheme('green')">
                            <div class="theme-card-preview" style="background: linear-gradient(135deg, #0a1f0a 0%, #153515 100%);"></div>
                            <div class="theme-card-name">🌲 Зелёная</div>
                        </div>
                    </div>
                </div>
                <div class="settings-group" style="margin-top: 24px;">
                    <h4>Дополнительно</h4>
                    <div class="settings-row">
                        <span class="settings-label">Акцентный цвет:</span>
                        <input type="color" value="#3b82f6" style="width: 50px; height: 30px; border: none; cursor: pointer;"
                            onchange="setAccentColor(this.value)">
                    </div>
                </div>
            `;
            break;
        case 'canvas':
            content = `
                <div class="settings-group">
                    <h4>Настройки холста</h4>
                    <div class="settings-row">
                        <span class="settings-label">Ширина (px):</span>
                        <input type="number" class="settings-input" value="${settings.canvasWidth}" 
                            onchange="updateCanvasSize('width', this.value)">
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Высота (px):</span>
                        <input type="number" class="settings-input" value="${settings.canvasHeight}" 
                            onchange="updateCanvasSize('height', this.value)">
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Размер сетки:</span>
                        <input type="number" class="settings-input" value="${settings.gridSize}" 
                            onchange="settings.gridSize = parseInt(this.value)">
                    </div>
                </div>
            `;
            break;
        case 'shortcuts':
            content = `
                <div class="settings-group">
                    <h4>Горячие клавиши</h4>
                    <div class="settings-row"><span>Ctrl+N</span><span>Новый проект</span></div>
                    <div class="settings-row"><span>Ctrl+O</span><span>Открыть проект</span></div>
                    <div class="settings-row"><span>Ctrl+S</span><span>Сохранить проект</span></div>
                    <div class="settings-row"><span>Ctrl+Z</span><span>Отменить</span></div>
                    <div class="settings-row"><span>Ctrl+Y</span><span>Повторить</span></div>
                    <div class="settings-row"><span>Ctrl+C</span><span>Копировать</span></div>
                    <div class="settings-row"><span>Ctrl+V</span><span>Вставить</span></div>
                    <div class="settings-row"><span>Ctrl+D</span><span>Дублировать</span></div>
                    <div class="settings-row"><span>Delete</span><span>Удалить</span></div>
                    <div class="settings-row"><span>F1-F4</span><span>Переключение вкладок</span></div>
                    <div class="settings-row"><span>F5</span><span>Запуск</span></div>
                </div>
            `;
            break;
        default:
            content = '<p>Настройки в разработке</p>';
    }
    
    openModal('Настройки', content);
}

// Update Editor Settings
function updateEditorSettings(property, value) {
    settings.editor[property] = value;
    
    // Apply to all editors
    const editors = [htmlEditor, cssEditor, jsEditor];
    
    editors.forEach(editor => {
        if (!editor) return;
        
        switch (property) {
            case 'fontSize':
                editor.updateOptions({ fontSize: value });
                break;
            case 'fontFamily':
                editor.updateOptions({ fontFamily: value });
                break;
            case 'tabSize':
                editor.getModel().updateOptions({ tabSize: value });
                break;
            case 'theme':
                monaco.editor.setTheme(value);
                break;
            case 'wordWrap':
                editor.updateOptions({ wordWrap: value });
                break;
            case 'minimap':
                editor.updateOptions({ minimap: { enabled: value } });
                break;
            case 'lineNumbers':
                editor.updateOptions({ lineNumbers: value ? 'on' : 'off' });
                break;
            case 'autoCloseBrackets':
                editor.updateOptions({ autoClosingBrackets: value ? 'always' : 'never' });
                break;
            case 'formatOnPaste':
                editor.updateOptions({ formatOnPaste: value });
                break;
        }
    });
    
    logMessage(`Настройка редактора обновлена: ${property} = ${value}`, 'info');
}

// Set Theme
function setTheme(theme) {
    settings.theme = theme;
    
    // Remove all theme classes
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-green');
    
    // Add selected theme class (dark is default, no class needed)
    if (theme !== 'dark') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Update Monaco editor theme based on app theme
    if (theme === 'light') {
        updateEditorSettings('theme', 'vs');
    } else {
        updateEditorSettings('theme', 'vs-dark');
    }
    
    // Update theme cards in modal if open
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    const activeCard = document.querySelector(`.theme-card[onclick="setTheme('${theme}')"]`);
    if (activeCard) activeCard.classList.add('active');
    
    logMessage(`Тема изменена: ${theme}`, 'info');
    
    // Save to localStorage
    localStorage.setItem('vhb-theme', theme);
}

// Set Accent Color
function setAccentColor(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    logMessage(`Акцентный цвет изменен: ${color}`, 'info');
}

// Auto-save interval
let autoSaveInterval = null;

function setAutoSaveInterval(interval) {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    if (settings.autoSave) {
        autoSaveInterval = setInterval(() => {
            saveProjectToLocalStorage();
        }, parseInt(interval));
    }
}

function saveProjectToLocalStorage() {
    syncPageWithState();
    const project = {
        version: '2.0',
        pages,
        currentPageId,
        plugins,
        customPlugins,
        globalSettings: settings
    };
    localStorage.setItem('vhb-autosave', JSON.stringify(project));
    logMessage('Проект автосохранён', 'info');
}

// Build Project (create ZIP)
async function buildProject() {
    closeAllMenus();
    
    if (typeof JSZip === 'undefined') {
        logMessage('Ошибка: JSZip не загружен', 'error');
        return;
    }
    
    openModal('Сборка проекта', `
        <div class="settings-group">
            <h4>📦 Сборка проекта в ZIP</h4>
            <p style="color: #888; margin-bottom: 16px;">
                Создание архива со всеми файлами проекта
            </p>
            
            <div class="settings-row">
                <span class="settings-label">Имя проекта:</span>
                <input type="text" class="settings-input" id="buildProjectName" value="my-project">
            </div>
            
            <div class="settings-group" style="margin-top: 16px;">
                <h4>Включить в сборку:</h4>
                <div class="settings-row">
                    <span class="settings-label">HTML файлы</span>
                    <input type="checkbox" class="settings-checkbox" id="buildIncludeHTML" checked>
                </div>
                <div class="settings-row">
                    <span class="settings-label">CSS файлы (отдельно)</span>
                    <input type="checkbox" class="settings-checkbox" id="buildIncludeCSS" checked>
                </div>
                <div class="settings-row">
                    <span class="settings-label">JavaScript файлы (отдельно)</span>
                    <input type="checkbox" class="settings-checkbox" id="buildIncludeJS" checked>
                </div>
                <div class="settings-row">
                    <span class="settings-label">Файл проекта (.vhb)</span>
                    <input type="checkbox" class="settings-checkbox" id="buildIncludeProject" checked>
                </div>
                <div class="settings-row">
                    <span class="settings-label">README.md</span>
                    <input type="checkbox" class="settings-checkbox" id="buildIncludeReadme" checked>
                </div>
            </div>
            
            <div class="settings-group" style="margin-top: 16px;">
                <h4>Структура файлов:</h4>
                <div class="settings-row">
                    <span class="settings-label">Структура папок:</span>
                    <select class="settings-select" id="buildStructure">
                        <option value="flat">Плоская (все в корне)</option>
                        <option value="organized" selected>Организованная (css/, js/, pages/)</option>
                    </select>
                </div>
                <div class="settings-row">
                    <span class="settings-label">Минифицировать код:</span>
                    <input type="checkbox" class="settings-checkbox" id="buildMinify">
                </div>
            </div>
            
            <div class="build-progress" id="buildProgress" style="display: none;">
                <div class="build-progress-bar">
                    <div class="build-progress-fill" id="buildProgressFill"></div>
                </div>
                <div class="build-log" id="buildLog"></div>
            </div>
        </div>
    `);
    
    document.getElementById('modalFooter').innerHTML = `
        <button class="modal-btn" onclick="closeModal()">Отмена</button>
        <button class="modal-btn modal-btn-primary" onclick="executeBuild()">📦 Собрать</button>
    `;
}

async function executeBuild() {
    const projectName = document.getElementById('buildProjectName').value || 'my-project';
    const includeHTML = document.getElementById('buildIncludeHTML').checked;
    const includeCSS = document.getElementById('buildIncludeCSS').checked;
    const includeJS = document.getElementById('buildIncludeJS').checked;
    const includeProject = document.getElementById('buildIncludeProject').checked;
    const includeReadme = document.getElementById('buildIncludeReadme').checked;
    const structure = document.getElementById('buildStructure').value;
    const minify = document.getElementById('buildMinify').checked;
    
    // Show progress
    document.getElementById('buildProgress').style.display = 'block';
    const progressFill = document.getElementById('buildProgressFill');
    const buildLog = document.getElementById('buildLog');
    
    const log = (msg, type = 'info') => {
        buildLog.innerHTML += `<div class="build-log-item ${type}">→ ${msg}</div>`;
        buildLog.scrollTop = buildLog.scrollHeight;
    };
    
    try {
        const zip = new JSZip();
        let progress = 0;
        const totalSteps = pages.length + 4;
        
        log('Начало сборки проекта...');
        
        // Sync current page
        syncPageWithState();
        
        // Create folders based on structure
        const cssFolder = structure === 'organized' ? 'css/' : '';
        const jsFolder = structure === 'organized' ? 'js/' : '';
        const pagesFolder = structure === 'organized' && pages.length > 1 ? 'pages/' : '';
        
        // Generate files for each page
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const isIndex = i === 0;
            const baseName = page.name.replace('.html', '');
            
            progress++;
            progressFill.style.width = `${(progress / totalSteps) * 100}%`;
            
            // Load page data
            const pageElements = page.elements || [];
            
            // Generate HTML for this page
            let pageHTML = '';
            pageElements.forEach(el => {
                const template = componentTemplates[el.type];
                if (!template) return;
                
                let tag = template.tag;
                let attrs = [`id="${el.id}"`, `class="${el.id}-style"`];
                
                if (el.attrs) {
                    Object.entries(el.attrs).forEach(([key, value]) => {
                        attrs.push(`${key}="${value}"`);
                    });
                }
                
                Object.entries(el.events || {}).forEach(([event, handler]) => {
                    if (handler) attrs.push(`${event}="${handler}"`);
                });
                
                if (['input', 'img', 'br', 'hr'].includes(tag)) {
                    pageHTML += `    <${tag} ${attrs.join(' ')}>\n`;
                } else {
                    const content = el.innerHTML || el.text || '';
                    pageHTML += `    <${tag} ${attrs.join(' ')}>${content}</${tag}>\n`;
                }
            });
            
            // Generate CSS for this page
            let pageCSS = `/* Styles for ${page.name} */\n\n`;
            pageCSS += `.app-container {\n`;
            pageCSS += `    width: ${page.settings?.canvasWidth || 800}px;\n`;
            pageCSS += `    min-height: ${page.settings?.canvasHeight || 600}px;\n`;
            pageCSS += `    background-color: ${page.settings?.canvasBgColor || '#ffffff'};\n`;
            pageCSS += `    margin: 0 auto;\n`;
            pageCSS += `    position: relative;\n`;
            pageCSS += `    box-shadow: 0 4px 20px rgba(0,0,0,0.15);\n`;
            pageCSS += `}\n\n`;
            
            pageElements.forEach(el => {
                pageCSS += `.${el.id}-style {\n`;
                pageCSS += `    position: absolute;\n`;
                pageCSS += `    left: ${el.x}px;\n`;
                pageCSS += `    top: ${el.y}px;\n`;
                Object.entries(el.style || {}).forEach(([prop, value]) => {
                    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                    pageCSS += `    ${cssProp}: ${value};\n`;
                });
                pageCSS += `}\n\n`;
            });
            
            // Add custom CSS from editor
            if (page.css) {
                pageCSS += `\n/* Custom CSS */\n${page.css}\n`;
            }
            
            // Get JS for this page
            let pageJS = page.js || getDefaultJS();
            
            // Minify if requested
            if (minify) {
                pageCSS = minifyCSS(pageCSS);
                pageJS = minifyJS(pageJS);
            }
            
            // Build full HTML file
            const cssLink = includeCSS ? 
                `<link rel="stylesheet" href="${cssFolder}${baseName}.css">` : 
                `<style>\n${pageCSS}\n    </style>`;
            
            const jsLink = includeJS ? 
                `<script src="${jsFolder}${baseName}.js"><\/script>` : 
                `<script>\n${pageJS}\n    <\/script>`;
            
            const fullHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${baseName}</title>
    ${getPluginLinks()}
    ${cssLink}
</head>
<body>
    <div class="app-container">
${pageHTML}
    </div>
    ${jsLink}
</body>
</html>`;
            
            // Add files to ZIP
            if (includeHTML) {
                const htmlPath = isIndex ? 'index.html' : `${pagesFolder}${page.name}`;
                zip.file(htmlPath, fullHTML);
                log(`Создан: ${htmlPath}`, 'success');
            }
            
            if (includeCSS) {
                zip.file(`${cssFolder}${baseName}.css`, pageCSS);
                log(`Создан: ${cssFolder}${baseName}.css`, 'success');
            }
            
            if (includeJS) {
                zip.file(`${jsFolder}${baseName}.js`, pageJS);
                log(`Создан: ${jsFolder}${baseName}.js`, 'success');
            }
        }
        
        // Add project file
        if (includeProject) {
            progress++;
            progressFill.style.width = `${(progress / totalSteps) * 100}%`;
            
            const projectData = {
                version: '2.0',
                pages,
                currentPageId,
                plugins,
                customPlugins,
                globalSettings: settings
            };
            zip.file(`${projectName}.vhb`, JSON.stringify(projectData, null, 2));
            log(`Создан: ${projectName}.vhb`, 'success');
        }
        
        // Add README
        if (includeReadme) {
            progress++;
            progressFill.style.width = `${(progress / totalSteps) * 100}%`;
            
            const readme = `# ${projectName}

Проект создан с помощью Visual HTML Builder.

## Структура проекта

${structure === 'organized' ? `
- \`index.html\` - главная страница
- \`css/\` - стили CSS
- \`js/\` - JavaScript файлы
${pages.length > 1 ? '- `pages/` - дополнительные страницы' : ''}
` : '- Все файлы в корневой папке'}

## Страницы

${pages.map((p, i) => `- ${i === 0 ? 'index.html' : p.name}`).join('\n')}

## Подключенные плагины

${Object.entries(plugins).filter(([_, v]) => v).map(([k]) => `- ${k}`).join('\n') || 'Нет'}

${customPlugins.length > 0 ? `
## Внешние библиотеки

${customPlugins.map(p => `- ${p.name}`).join('\n')}
` : ''}

---
Создано: ${new Date().toLocaleString('ru-RU')}
`;
            zip.file('README.md', readme);
            log('Создан: README.md', 'success');
        }
        
        // Generate ZIP
        progress++;
        progressFill.style.width = '100%';
        log('Генерация архива...');
        
        const blob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });
        
        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        
        log(`✅ Сборка завершена! Файл: ${projectName}.zip`, 'success');
        logMessage(`Проект собран: ${projectName}.zip`, 'info');
        
    } catch (error) {
        log(`❌ Ошибка: ${error.message}`, 'error');
        logMessage(`Ошибка сборки: ${error.message}`, 'error');
    }
}

// Simple minification functions
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around special chars
        .replace(/;}/g, '}') // Remove last semicolon
        .trim();
}

function minifyJS(js) {
    return js
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
}

function updateCanvasSize(dimension, value) {
    const canvas = document.getElementById('designCanvas');
    if (dimension === 'width') {
        settings.canvasWidth = parseInt(value);
        canvas.style.width = value + 'px';
    } else {
        settings.canvasHeight = parseInt(value);
        canvas.style.minHeight = value + 'px';
    }
}

function resetSettings() {
    closeAllMenus();
    if (confirm('Сбросить все настройки?')) {
        settings = {
            gridSize: 10,
            canvasWidth: 800,
            canvasHeight: 600,
            theme: 'dark',
            autoSave: false
        };
        showGrid = true;
        snapToGrid = true;
        canvasZoom = 1;
        applyZoom();
        logMessage('Настройки сброшены', 'info');
    }
}

// ========================================
// Plugins
// ========================================

function openPluginManager() {
    closeAllMenus();
    openModal('Менеджер плагинов', `
        <div class="settings-group">
            <h4>Доступные плагины</h4>
            <div class="settings-row">
                <span class="settings-label">Bootstrap 5</span>
                <input type="checkbox" class="settings-checkbox" ${plugins.bootstrap ? 'checked' : ''} 
                    onchange="plugins.bootstrap = this.checked; updatePluginCheckboxes()">
            </div>
            <div class="settings-row">
                <span class="settings-label">Font Awesome 6</span>
                <input type="checkbox" class="settings-checkbox" ${plugins.fontawesome ? 'checked' : ''} 
                    onchange="plugins.fontawesome = this.checked; updatePluginCheckboxes()">
            </div>
            <div class="settings-row">
                <span class="settings-label">Animate.css</span>
                <input type="checkbox" class="settings-checkbox" ${plugins.animate ? 'checked' : ''} 
                    onchange="plugins.animate = this.checked; updatePluginCheckboxes()">
            </div>
            <div class="settings-row">
                <span class="settings-label">jQuery 3.7</span>
                <input type="checkbox" class="settings-checkbox" ${plugins.jquery ? 'checked' : ''} 
                    onchange="plugins.jquery = this.checked; updatePluginCheckboxes()">
            </div>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 16px;">
            Плагины подключаются при предпросмотре и экспорте.
        </p>
    `);
}

function installPlugin() {
    closeAllMenus();
    openModal('Установка плагина', `
        <div class="settings-group">
            <h4>Добавить внешнюю библиотеку</h4>
            <p style="color: #888; font-size: 13px; margin-bottom: 16px;">
                Введите URL CDN библиотеки для подключения к проекту
            </p>
            
            <div class="property-group">
                <label class="property-label">Название плагина</label>
                <input type="text" class="property-input" id="customPluginName" placeholder="Например: My Library">
            </div>
            
            <div class="property-group">
                <label class="property-label">CSS URL (опционально)</label>
                <input type="text" class="property-input" id="customPluginCSS" 
                    placeholder="https://cdn.example.com/library.css">
            </div>
            
            <div class="property-group">
                <label class="property-label">JavaScript URL (опционально)</label>
                <input type="text" class="property-input" id="customPluginJS" 
                    placeholder="https://cdn.example.com/library.js">
            </div>
        </div>
        
        <div class="settings-group">
            <h4>Популярные библиотеки</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('tailwind')">Tailwind CSS</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('materialize')">Materialize</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('bulma')">Bulma</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('aos')">AOS</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('swiper')">Swiper</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('chartjs')">Chart.js</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('axios')">Axios</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('lodash')">Lodash</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('moment')">Moment.js</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('gsap')">GSAP</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('three')">Three.js</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('vue')">Vue.js</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('react')">React</button>
                <button class="property-btn" style="width: auto;" onclick="addQuickPlugin('alpinejs')">Alpine.js</button>
            </div>
        </div>
        
        <div class="settings-group" style="margin-top: 20px;">
            <h4>Установленные плагины</h4>
            <div id="installedPluginsList" style="margin-top: 12px;">
                ${getInstalledPluginsHTML()}
            </div>
        </div>
    `, true);
    
    // Override submit to add custom plugin
    document.getElementById('modalFooter').innerHTML = `
        <button class="modal-btn" onclick="closeModal()">Закрыть</button>
        <button class="modal-btn modal-btn-primary" onclick="addCustomPlugin()">Добавить плагин</button>
    `;
}

// Custom plugins storage
let customPlugins = [];

function getInstalledPluginsHTML() {
    if (customPlugins.length === 0) {
        return '<p style="color: #666; font-size: 13px;">Нет установленных плагинов</p>';
    }
    
    return customPlugins.map((plugin, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #3d3d3d; border-radius: 4px; margin-bottom: 8px;">
            <span>${plugin.name}</span>
            <button class="property-btn" style="width: auto; padding: 4px 8px; background: #ef4444;" 
                onclick="removeCustomPlugin(${index})">✕</button>
        </div>
    `).join('');
}

function addCustomPlugin() {
    const name = document.getElementById('customPluginName').value.trim();
    const cssUrl = document.getElementById('customPluginCSS').value.trim();
    const jsUrl = document.getElementById('customPluginJS').value.trim();
    
    if (!name) {
        logMessage('Введите название плагина', 'warn');
        return;
    }
    
    if (!cssUrl && !jsUrl) {
        logMessage('Введите хотя бы один URL (CSS или JS)', 'warn');
        return;
    }
    
    customPlugins.push({ name, css: cssUrl, js: jsUrl });
    logMessage(`Плагин "${name}" добавлен`, 'info');
    
    // Refresh the installed plugins list
    const listEl = document.getElementById('installedPluginsList');
    if (listEl) {
        listEl.innerHTML = getInstalledPluginsHTML();
    }
    
    // Clear inputs
    document.getElementById('customPluginName').value = '';
    document.getElementById('customPluginCSS').value = '';
    document.getElementById('customPluginJS').value = '';
}

function removeCustomPlugin(index) {
    const plugin = customPlugins[index];
    customPlugins.splice(index, 1);
    logMessage(`Плагин "${plugin.name}" удален`, 'info');
    
    const listEl = document.getElementById('installedPluginsList');
    if (listEl) {
        listEl.innerHTML = getInstalledPluginsHTML();
    }
}

function addQuickPlugin(type) {
    const quickPlugins = {
        tailwind: { name: 'Tailwind CSS', css: '', js: 'https://cdn.tailwindcss.com' },
        materialize: { name: 'Materialize', css: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css', js: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js' },
        bulma: { name: 'Bulma', css: 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css', js: '' },
        aos: { name: 'AOS', css: 'https://unpkg.com/aos@2.3.1/dist/aos.css', js: 'https://unpkg.com/aos@2.3.1/dist/aos.js' },
        swiper: { name: 'Swiper', css: 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css', js: 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js' },
        chartjs: { name: 'Chart.js', css: '', js: 'https://cdn.jsdelivr.net/npm/chart.js' },
        axios: { name: 'Axios', css: '', js: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js' },
        lodash: { name: 'Lodash', css: '', js: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js' },
        moment: { name: 'Moment.js', css: '', js: 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js' },
        gsap: { name: 'GSAP', css: '', js: 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js' },
        three: { name: 'Three.js', css: '', js: 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js' },
        vue: { name: 'Vue.js', css: '', js: 'https://unpkg.com/vue@3/dist/vue.global.js' },
        react: { name: 'React', css: '', js: 'https://unpkg.com/react@18/umd/react.production.min.js' },
        alpinejs: { name: 'Alpine.js', css: '', js: 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js' }
    };
    
    const plugin = quickPlugins[type];
    if (plugin) {
        // Check if already installed
        if (customPlugins.some(p => p.name === plugin.name)) {
            logMessage(`Плагин "${plugin.name}" уже установлен`, 'warn');
            return;
        }
        
        customPlugins.push(plugin);
        logMessage(`Плагин "${plugin.name}" добавлен`, 'info');
        
        const listEl = document.getElementById('installedPluginsList');
        if (listEl) {
            listEl.innerHTML = getInstalledPluginsHTML();
        }
    }
}

function togglePlugin(name) {
    plugins[name] = !plugins[name];
    updatePluginCheckboxes();
    logMessage(`Плагин ${name} ${plugins[name] ? 'включен' : 'выключен'}`, 'info');
}

function updatePluginCheckboxes() {
    Object.entries(plugins).forEach(([name, enabled]) => {
        const el = document.getElementById(`plugin${capitalize(name)}`);
        if (el) {
            el.textContent = enabled ? '☑' : '☐';
        }
    });
}

// ========================================
// Help & About
// ========================================

function showHelp() {
    closeAllMenus();
    openModal('Справка', `
        <div class="settings-group">
            <h4>Быстрый старт</h4>
            <p style="line-height: 1.6;">
                1. Перетащите компонент из левой панели на холст<br>
                2. Выберите элемент и настройте его свойства справа<br>
                3. Добавьте обработчики событий в панели "События"<br>
                4. Напишите JavaScript код на вкладке "JavaScript"<br>
                5. Нажмите "Запуск" для предпросмотра<br>
                6. Экспортируйте готовый HTML файл
            </p>
        </div>
        <div class="settings-group">
            <h4>Советы</h4>
            <p style="line-height: 1.6;">
                • Двойной клик на компоненте - добавление на холст<br>
                • Двойной клик на элементе - редактирование текста<br>
                • Используйте горячие клавиши для быстрой работы
            </p>
        </div>
    `);
}

function showShortcuts() {
    closeAllMenus();
    openSettings('shortcuts');
}

function showAbout() {
    closeAllMenus();
    openModal('О программе', `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎨</div>
            <h2 style="margin-bottom: 8px;">Visual HTML Builder</h2>
            <p style="color: #888; margin-bottom: 24px;">Версия 1.0.0</p>
            <p style="line-height: 1.6;">
                Визуальный редактор HTML страниц<br>
                в стиле Lazarus IDE
            </p>
        </div>
    `);
}

function printProject() {
    closeAllMenus();
    generateHTML();
    generateCSS();
    
    const html = getEditorValue('html');
    const css = getEditorValue('css');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Project</title>
            <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; position: relative; }
                ${css}
            </style>
        </head>
        <body>
            ${html}
            <script>window.print();<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ========================================
// Modal Functions
// ========================================

function openModal(title, content, hasSubmit = false) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    
    if (hasSubmit) {
        document.getElementById('modalFooter').innerHTML = `
            <button class="modal-btn" onclick="closeModal()">Отмена</button>
            <button class="modal-btn modal-btn-primary" onclick="submitModal()">OK</button>
        `;
    } else {
        document.getElementById('modalFooter').innerHTML = `
            <button class="modal-btn" onclick="closeModal()">Закрыть</button>
        `;
    }
    
    document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
}

function submitModal() {
    closeModal();
}

// ========================================
// Auto-Sync Settings
// ========================================

let autoSyncHTML = true;
let autoSyncCSS = true;
let htmlSyncTimeout = null;
let cssSyncTimeout = null;

function toggleAutoSync(type, enabled) {
    if (type === 'html') {
        autoSyncHTML = enabled;
        logMessage(`HTML авто-синхронизация ${enabled ? 'включена' : 'выключена'}`, 'info');
    } else if (type === 'css') {
        autoSyncCSS = enabled;
        logMessage(`CSS авто-синхронизация ${enabled ? 'включена' : 'выключена'}`, 'info');
    }
}

function setupEditorSync() {
    if (htmlEditor) {
        htmlEditor.onDidChangeModelContent(() => {
            if (autoSyncHTML) {
                clearTimeout(htmlSyncTimeout);
                htmlSyncTimeout = setTimeout(() => {
                    applyHTMLChanges();
                }, 1000); // Debounce 1 second
            }
        });
    }
    
    if (cssEditor) {
        cssEditor.onDidChangeModelContent(() => {
            if (autoSyncCSS) {
                clearTimeout(cssSyncTimeout);
                cssSyncTimeout = setTimeout(() => {
                    applyCSSChanges();
                }, 500); // Debounce 0.5 second
            }
        });
    }
}

// ========================================
// Apply HTML Changes to Canvas
// ========================================

function applyHTMLChanges() {
    const html = getEditorValue('html');
    if (!html.trim()) {
        logMessage('HTML пуст', 'warn');
        return;
    }
    
    try {
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const container = doc.body.firstChild;
        
        // Update existing elements or add new ones
        const processedIds = new Set();
        
        container.querySelectorAll('[id]').forEach(el => {
            const id = el.id;
            processedIds.add(id);
            
            const existingElement = elements.find(e => e.id === id);
            
            if (existingElement) {
                // Update existing element
                updateElementFromHTML(existingElement, el);
            } else {
                // Try to create new element from HTML
                createElementFromHTML(el);
            }
        });
        
        // Rebuild canvas to reflect changes
        rebuildCanvas();
        logMessage('HTML изменения применены', 'info');
    } catch (err) {
        logMessage('Ошибка применения HTML: ' + err.message, 'error');
    }
}

function updateElementFromHTML(elementData, htmlElement) {
    // Update text content
    if (htmlElement.childNodes.length === 1 && htmlElement.childNodes[0].nodeType === 3) {
        elementData.text = htmlElement.textContent;
    } else if (htmlElement.innerHTML && htmlElement.children.length > 0) {
        elementData.innerHTML = htmlElement.innerHTML;
    }
    
    // Update attributes
    Array.from(htmlElement.attributes).forEach(attr => {
        if (attr.name !== 'id' && attr.name !== 'class' && attr.name !== 'style') {
            if (attr.name.startsWith('on')) {
                elementData.events[attr.name] = attr.value;
            } else {
                if (!elementData.attrs) elementData.attrs = {};
                elementData.attrs[attr.name] = attr.value;
            }
        }
    });
}

function createElementFromHTML(htmlElement) {
    const tag = htmlElement.tagName.toLowerCase();
    
    // Find component type by tag
    let componentType = null;
    for (const [type, template] of Object.entries(componentTemplates)) {
        if (template.tag === tag) {
            componentType = type;
            break;
        }
    }
    
    if (!componentType) {
        componentType = 'div'; // Default to div
    }
    
    const template = componentTemplates[componentType];
    elementCounter++;
    
    const elementData = {
        id: htmlElement.id || `${componentType}${elementCounter}`,
        type: componentType,
        name: htmlElement.id || `${componentType}${elementCounter}`,
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        style: { ...template.defaultStyle },
        attrs: {},
        text: '',
        innerHTML: null,
        events: {}
    };
    
    // Extract text or innerHTML
    if (htmlElement.childNodes.length === 1 && htmlElement.childNodes[0].nodeType === 3) {
        elementData.text = htmlElement.textContent.trim();
    } else if (htmlElement.innerHTML) {
        elementData.innerHTML = htmlElement.innerHTML;
    }
    
    // Extract attributes
    Array.from(htmlElement.attributes).forEach(attr => {
        if (attr.name !== 'id' && attr.name !== 'class') {
            if (attr.name === 'style') {
                // Parse inline styles
                parseInlineStyles(attr.value, elementData.style);
            } else if (attr.name.startsWith('on')) {
                elementData.events[attr.name] = attr.value;
            } else {
                elementData.attrs[attr.name] = attr.value;
            }
        }
    });
    
    elements.push(elementData);
}

function parseInlineStyles(styleString, targetStyle) {
    styleString.split(';').forEach(rule => {
        const [prop, value] = rule.split(':').map(s => s.trim());
        if (prop && value) {
            // Convert CSS property to camelCase
            const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            targetStyle[camelProp] = value;
        }
    });
}

// ========================================
// Apply CSS Changes to Canvas
// ========================================

function applyCSSChanges() {
    const css = getEditorValue('css');
    if (!css.trim()) {
        logMessage('CSS пуст', 'warn');
        return;
    }
    
    try {
        // Parse CSS rules
        const rules = parseCSS(css);
        
        // Apply rules to elements
        rules.forEach(rule => {
            const selector = rule.selector;
            
            // Match by class (e.g., .button1-style)
            const classMatch = selector.match(/^\.([a-zA-Z0-9_-]+)-style$/);
            if (classMatch) {
                const id = classMatch[1];
                const element = elements.find(e => e.id === id);
                if (element) {
                    // Apply style properties
                    Object.entries(rule.properties).forEach(([prop, value]) => {
                        // Handle position properties separately
                        if (prop === 'left') {
                            element.x = parseInt(value) || 0;
                        } else if (prop === 'top') {
                            element.y = parseInt(value) || 0;
                        } else if (prop !== 'position') {
                            // Convert CSS property to camelCase
                            const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                            element.style[camelProp] = value;
                        }
                    });
                }
            }
            
            // Match by ID (e.g., #button1)
            const idMatch = selector.match(/^#([a-zA-Z0-9_-]+)$/);
            if (idMatch) {
                const id = idMatch[1];
                const element = elements.find(e => e.id === id);
                if (element) {
                    Object.entries(rule.properties).forEach(([prop, value]) => {
                        if (prop === 'left') {
                            element.x = parseInt(value) || 0;
                        } else if (prop === 'top') {
                            element.y = parseInt(value) || 0;
                        } else if (prop !== 'position') {
                            const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                            element.style[camelProp] = value;
                        }
                    });
                }
            }
        });
        
        // Rebuild canvas to reflect changes
        rebuildCanvas();
        
        // Re-select element if one was selected
        if (selectedElement) {
            const id = selectedElement.id;
            setTimeout(() => selectElement(id), 50);
        }
        
        logMessage('CSS изменения применены', 'info');
    } catch (err) {
        logMessage('Ошибка применения CSS: ' + err.message, 'error');
    }
}

function parseCSS(css) {
    const rules = [];
    
    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Match CSS rules
    const ruleRegex = /([^{]+)\{([^}]*)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(css)) !== null) {
        const selector = match[1].trim();
        const propertiesStr = match[2].trim();
        
        const properties = {};
        propertiesStr.split(';').forEach(prop => {
            const [name, value] = prop.split(':').map(s => s.trim());
            if (name && value) {
                properties[name] = value;
            }
        });
        
        rules.push({ selector, properties });
    }
    
    return rules;
}

// ========================================
// Format Code
// ========================================

function formatCode(type) {
    try {
        if (type === 'html' && htmlEditor) {
            const value = htmlEditor.getValue();
            const formatted = formatHTML(value);
            htmlEditor.setValue(formatted);
            logMessage('HTML отформатирован', 'info');
        } else if (type === 'css' && cssEditor) {
            const value = cssEditor.getValue();
            const formatted = formatCSSCode(value);
            cssEditor.setValue(formatted);
            logMessage('CSS отформатирован', 'info');
        } else if (type === 'js' && jsEditor) {
            const value = jsEditor.getValue();
            const formatted = formatJSCode(value);
            jsEditor.setValue(formatted);
            logMessage('JavaScript отформатирован', 'info');
        }
    } catch (err) {
        logMessage('Ошибка форматирования: ' + err.message, 'error');
    }
}

function formatHTML(html) {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    // Simple HTML formatter
    html = html.replace(/>\s*</g, '>\n<');
    const lines = html.split('\n');
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // Decrease indent for closing tags
        if (line.match(/^<\//) && indent > 0) {
            indent--;
        }
        
        formatted += tab.repeat(indent) + line + '\n';
        
        // Increase indent for opening tags (not self-closing)
        if (line.match(/^<[a-z][^>]*[^\/]>$/i) && !line.match(/^<(input|img|br|hr|meta|link)/i)) {
            indent++;
        }
    });
    
    return formatted.trim();
}

function formatCSSCode(css) {
    let formatted = '';
    
    // Remove extra whitespace
    css = css.replace(/\s+/g, ' ').trim();
    
    // Format rules
    css = css.replace(/\{/g, ' {\n  ');
    css = css.replace(/;/g, ';\n  ');
    css = css.replace(/\s*\}/g, '\n}\n\n');
    css = css.replace(/\n  \n/g, '\n');
    
    return css.trim();
}

function formatJSCode(js) {
    // Simple JS formatter - just fix indentation
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    const lines = js.split('\n');
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
            formatted += '\n';
            return;
        }
        
        // Decrease indent for closing braces
        if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
            indent = Math.max(0, indent - 1);
        }
        
        formatted += tab.repeat(indent) + trimmed + '\n';
        
        // Increase indent after opening braces
        if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
            indent++;
        }
    });
    
    return formatted.trim();
}

// ========================================
// Run JS Code
// ========================================

function runJSCode() {
    const js = getEditorValue('js');
    
    try {
        // Create a safe execution context
        const func = new Function(js);
        func();
        logMessage('JavaScript выполнен успешно', 'info');
    } catch (err) {
        logMessage('Ошибка выполнения JS: ' + err.message, 'error');
    }
}

// ========================================
// JS Editor Mode and Snippets
// ========================================

let jsEditorMode = 'code';

function setJSEditorMode(mode) {
    jsEditorMode = mode;
    
    // Update buttons
    document.getElementById('modeCode').classList.toggle('active', mode === 'code');
    document.getElementById('modeVisual').classList.toggle('active', mode === 'visual');
    
    // Show/hide snippets panel
    const snippetsPanel = document.getElementById('jsSnippetsPanel');
    snippetsPanel.classList.toggle('show', mode === 'visual');
    
    // Re-layout Monaco editor
    if (jsEditor) {
        setTimeout(() => jsEditor.layout(), 100);
    }
    
    logMessage(`Режим редактора: ${mode === 'visual' ? 'Визуальный' : 'Код'}`, 'info');
}

function toggleSnippetCategory(titleElement) {
    const category = titleElement.parentElement;
    category.classList.toggle('collapsed');
}

// Code Snippets Library
const codeSnippets = {
    // Events
    onClick: `// Обработчик клика по элементу
document.getElementById('elementId').addEventListener('click', function(e) {
    console.log('Элемент нажат!');
    // Ваш код здесь
});`,

    onHover: `// Обработчик наведения мыши
const element = document.getElementById('elementId');

element.addEventListener('mouseenter', function() {
    console.log('Мышь наведена');
    this.style.opacity = '0.8';
});

element.addEventListener('mouseleave', function() {
    console.log('Мышь ушла');
    this.style.opacity = '1';
});`,

    onInput: `// Обработчик ввода в поле
document.getElementById('inputId').addEventListener('input', function(e) {
    const value = e.target.value;
    console.log('Введено:', value);
    // Обновляем что-то в реальном времени
    document.getElementById('output').textContent = value;
});`,

    onSubmit: `// Обработчик отправки формы
document.getElementById('formId').addEventListener('submit', function(e) {
    e.preventDefault(); // Предотвращаем стандартную отправку
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    console.log('Данные формы:', data);
    // Отправка данных на сервер
});`,

    onKeyPress: `// Обработчик нажатия клавиши
document.addEventListener('keydown', function(e) {
    console.log('Клавиша:', e.key, 'Код:', e.code);
    
    if (e.key === 'Enter') {
        console.log('Нажат Enter');
    }
    
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        console.log('Ctrl+S нажаты');
    }
});`,

    onScroll: `// Обработчик прокрутки страницы
window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    console.log('Прокрутка:', scrollY);
    
    // Показать кнопку "Наверх" при прокрутке
    const backToTop = document.getElementById('backToTop');
    if (scrollY > 300) {
        backToTop.style.display = 'block';
    } else {
        backToTop.style.display = 'none';
    }
});`,

    onLoad: `// Код выполнится после полной загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена!');
    
    // Инициализация приложения
    init();
});

function init() {
    // Ваш код инициализации
}`,

    // DOM Manipulation
    getElement: `// Получить элемент по ID
const element = document.getElementById('elementId');

// Получить элемент по селектору
const element2 = document.querySelector('.className');
const element3 = document.querySelector('#id .child');`,

    getAllElements: `// Получить все элементы по селектору
const elements = document.querySelectorAll('.className');

// Перебор всех элементов
elements.forEach(function(el, index) {
    console.log('Элемент', index, el);
});`,

    createElement: `// Создать новый элемент
const newDiv = document.createElement('div');
newDiv.className = 'my-class';
newDiv.id = 'myId';
newDiv.textContent = 'Новый элемент';
newDiv.style.color = 'blue';

// Добавить в DOM
document.getElementById('container').appendChild(newDiv);`,

    removeElement: `// Удалить элемент
const element = document.getElementById('elementId');
element.remove();

// Или через родителя
const parent = document.getElementById('parent');
const child = document.getElementById('child');
parent.removeChild(child);`,

    changeText: `// Изменить текст элемента
document.getElementById('elementId').textContent = 'Новый текст';

// Или для форм
document.getElementById('inputId').value = 'Новое значение';`,

    changeHTML: `// Изменить HTML содержимое
document.getElementById('elementId').innerHTML = '<strong>Жирный текст</strong>';

// Добавить HTML в конец
document.getElementById('elementId').insertAdjacentHTML('beforeend', '<p>Новый параграф</p>');`,

    addClass: `// Добавить класс
document.getElementById('elementId').classList.add('new-class');

// Добавить несколько классов
document.getElementById('elementId').classList.add('class1', 'class2');`,

    removeClass: `// Удалить класс
document.getElementById('elementId').classList.remove('old-class');

// Удалить несколько классов
document.getElementById('elementId').classList.remove('class1', 'class2');`,

    toggleClass: `// Переключить класс (добавить если нет, убрать если есть)
document.getElementById('elementId').classList.toggle('active');

// С условием
const isActive = true;
document.getElementById('elementId').classList.toggle('active', isActive);`,

    changeStyle: `// Изменить стили элемента
const element = document.getElementById('elementId');

element.style.backgroundColor = '#3b82f6';
element.style.color = 'white';
element.style.padding = '10px 20px';
element.style.borderRadius = '8px';
element.style.display = 'flex';`,

    getAttribute: `// Получить атрибут
const src = document.getElementById('imageId').getAttribute('src');
const href = document.getElementById('linkId').getAttribute('href');
const dataValue = document.getElementById('elementId').getAttribute('data-value');

console.log('Значение:', dataValue);`,

    setAttribute: `// Установить атрибут
document.getElementById('imageId').setAttribute('src', 'новый-путь.jpg');
document.getElementById('linkId').setAttribute('href', 'https://example.com');
document.getElementById('elementId').setAttribute('data-value', '123');

// Или напрямую
document.getElementById('imageId').src = 'новый-путь.jpg';`,

    // Conditions and Loops
    ifElse: `// Условие if / else
const value = 10;

if (value > 10) {
    console.log('Больше 10');
} else if (value === 10) {
    console.log('Равно 10');
} else {
    console.log('Меньше 10');
}

// Тернарный оператор
const result = value > 5 ? 'Большое' : 'Маленькое';`,

    switch: `// Переключатель switch
const action = 'save';

switch (action) {
    case 'save':
        console.log('Сохранение...');
        break;
    case 'load':
        console.log('Загрузка...');
        break;
    case 'delete':
        console.log('Удаление...');
        break;
    default:
        console.log('Неизвестное действие');
}`,

    forLoop: `// Цикл for
for (let i = 0; i < 10; i++) {
    console.log('Итерация:', i);
}

// Перебор массива
const items = ['яблоко', 'банан', 'апельсин'];
for (let i = 0; i < items.length; i++) {
    console.log(items[i]);
}`,

    forEach: `// Цикл forEach для массива
const items = ['яблоко', 'банан', 'апельсин'];

items.forEach(function(item, index) {
    console.log(index + ':', item);
});

// Стрелочная функция
items.forEach((item, index) => {
    console.log(index + ':', item);
});`,

    whileLoop: `// Цикл while
let count = 0;

while (count < 5) {
    console.log('Счётчик:', count);
    count++;
}

// do...while (выполнится минимум 1 раз)
do {
    console.log('Выполняется');
} while (false);`,

    mapArray: `// Преобразовать массив (map)
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(function(num) {
    return num * 2;
});

console.log(doubled); // [2, 4, 6, 8, 10]

// Стрелочная функция
const tripled = numbers.map(num => num * 3);`,

    filterArray: `// Фильтровать массив
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evenNumbers = numbers.filter(function(num) {
    return num % 2 === 0;
});

console.log(evenNumbers); // [2, 4, 6, 8, 10]

// Стрелочная функция
const bigNumbers = numbers.filter(num => num > 5);`,

    // Functions
    function: `// Обычная функция
function greet(name) {
    return 'Привет, ' + name + '!';
}

// Вызов функции
const message = greet('Мир');
console.log(message);`,

    arrowFunction: `// Стрелочная функция
const greet = (name) => {
    return 'Привет, ' + name + '!';
};

// Короткая запись (для одного выражения)
const double = (x) => x * 2;
const add = (a, b) => a + b;

console.log(double(5)); // 10`,

    asyncFunction: `// Асинхронная функция
async function loadData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log('Данные:', data);
        return data;
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Вызов
loadData().then(data => {
    console.log('Получено:', data);
});`,

    iife: `// IIFE - немедленно вызываемая функция
(function() {
    // Приватная область видимости
    const privateVar = 'Приватная переменная';
    
    console.log('IIFE выполнена');
})();

// С параметрами
(function(name) {
    console.log('Привет,', name);
})('Мир');`,

    // AJAX / Fetch
    fetchGet: `// GET запрос
fetch('https://api.example.com/data')
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка сети');
        }
        return response.json();
    })
    .then(data => {
        console.log('Данные:', data);
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });`,

    fetchPost: `// POST запрос
fetch('https://api.example.com/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: 'Иван',
        email: 'ivan@example.com'
    })
})
.then(response => response.json())
.then(data => {
    console.log('Ответ:', data);
})
.catch(error => {
    console.error('Ошибка:', error);
});`,

    fetchJSON: `// Загрузить JSON файл
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        console.log('JSON данные:', data);
        // Обработка данных
        data.forEach(item => {
            console.log(item);
        });
    })
    .catch(error => {
        console.error('Ошибка загрузки:', error);
    });`,

    fetchAsync: `// Async/Await запрос
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        
        if (!response.ok) {
            throw new Error('HTTP ошибка: ' + response.status);
        }
        
        const data = await response.json();
        console.log('Данные:', data);
        return data;
        
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

// Вызов функции
fetchData();`,

    // Animations
    fadeIn: `// Плавное появление элемента
function fadeIn(element, duration = 500) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    let start = null;
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = Math.min(progress / duration, 1);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Использование
fadeIn(document.getElementById('elementId'));`,

    fadeOut: `// Плавное исчезновение элемента
function fadeOut(element, duration = 500) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = initialOpacity - (progress / duration) * initialOpacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Использование
fadeOut(document.getElementById('elementId'));`,

    slideToggle: `// Слайд toggle (показать/скрыть)
function slideToggle(element, duration = 300) {
    if (element.offsetHeight === 0) {
        // Показать
        element.style.height = 'auto';
        const height = element.offsetHeight + 'px';
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.transition = 'height ' + duration + 'ms ease';
        
        requestAnimationFrame(() => {
            element.style.height = height;
        });
    } else {
        // Скрыть
        element.style.height = element.offsetHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = 'height ' + duration + 'ms ease';
        
        requestAnimationFrame(() => {
            element.style.height = '0';
        });
    }
}

// Использование
slideToggle(document.getElementById('elementId'));`,

    animate: `// CSS анимация через JavaScript
const element = document.getElementById('elementId');

// Добавить анимацию
element.style.animation = 'bounce 1s ease infinite';

// Или через animate API
element.animate([
    { transform: 'translateY(0px)' },
    { transform: 'translateY(-20px)' },
    { transform: 'translateY(0px)' }
], {
    duration: 500,
    iterations: Infinity
});`,

    requestAnimation: `// Анимация через requestAnimationFrame
let position = 0;
const element = document.getElementById('elementId');

function animate() {
    position += 2;
    element.style.transform = 'translateX(' + position + 'px)';
    
    if (position < 200) {
        requestAnimationFrame(animate);
    }
}

// Запуск анимации
requestAnimationFrame(animate);`,

    // Storage
    localStorageSet: `// Сохранить данные в localStorage
// Простое значение
localStorage.setItem('username', 'Иван');

// Объект (нужно преобразовать в JSON)
const user = {
    name: 'Иван',
    age: 25,
    email: 'ivan@example.com'
};
localStorage.setItem('user', JSON.stringify(user));`,

    localStorageGet: `// Получить данные из localStorage
// Простое значение
const username = localStorage.getItem('username');
console.log('Имя:', username);

// Объект (нужно распарсить JSON)
const userJSON = localStorage.getItem('user');
if (userJSON) {
    const user = JSON.parse(userJSON);
    console.log('Пользователь:', user);
}`,

    localStorageRemove: `// Удалить данные из localStorage
// Удалить один элемент
localStorage.removeItem('username');

// Удалить все данные
localStorage.clear();`,

    sessionStorageSet: `// Сохранить в sessionStorage (до закрытия вкладки)
sessionStorage.setItem('tempData', 'Временные данные');

const data = { id: 1, value: 'test' };
sessionStorage.setItem('tempObject', JSON.stringify(data));`,

    cookieSet: `// Установить cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
}

// Использование
setCookie('username', 'Иван', 30); // на 30 дней`,

    cookieGet: `// Получить cookie
function getCookie(name) {
    const cookieName = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length);
        }
    }
    return null;
}

// Использование
const username = getCookie('username');
console.log('Cookie:', username);`,

    // Validation
    validateEmail: `// Проверка email
function validateEmail(email) {
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email);
}

// Использование
const email = 'test@example.com';
if (validateEmail(email)) {
    console.log('Email корректный');
} else {
    console.log('Email некорректный');
}`,

    validatePhone: `// Проверка телефона (российский формат)
function validatePhone(phone) {
    // Удаляем все кроме цифр
    const cleaned = phone.replace(/\\D/g, '');
    
    // Проверяем длину (10-11 цифр для России)
    const regex = /^[78]?\\d{10}$/;
    return regex.test(cleaned);
}

// Использование
console.log(validatePhone('+7 (999) 123-45-67')); // true`,

    validateRequired: `// Проверка обязательного поля
function validateRequired(value) {
    return value !== null && value !== undefined && value.trim() !== '';
}

// Использование
const input = document.getElementById('inputId');
if (!validateRequired(input.value)) {
    input.classList.add('error');
    alert('Поле обязательно для заполнения');
}`,

    validateLength: `// Проверка длины строки
function validateLength(value, min, max) {
    const length = value.length;
    return length >= min && length <= max;
}

// Использование
const password = document.getElementById('password').value;

if (!validateLength(password, 8, 20)) {
    alert('Пароль должен быть от 8 до 20 символов');
}`,

    validatePassword: `// Проверка надёжности пароля
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength 
        && hasUpperCase 
        && hasLowerCase 
        && hasNumbers 
        && hasSpecialChar;
}

// Использование
if (!validatePassword('MyPass123!')) {
    console.log('Пароль недостаточно надёжный');
}`,

    validateForm: `// Полная валидация формы
function validateForm(formId) {
    const form = document.getElementById(formId);
    const errors = [];
    
    // Проверка email
    const email = form.querySelector('[name="email"]');
    if (email && !validateEmail(email.value)) {
        errors.push('Некорректный email');
        email.classList.add('error');
    }
    
    // Проверка обязательных полей
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            errors.push('Поле "' + field.name + '" обязательно');
            field.classList.add('error');
        }
    });
    
    if (errors.length > 0) {
        alert(errors.join('\\n'));
        return false;
    }
    
    return true;
}`,

    // Timers
    setTimeout: `// Выполнить код через время
setTimeout(function() {
    console.log('Прошло 2 секунды');
    // Ваш код здесь
}, 2000); // 2000 мс = 2 секунды

// Со стрелочной функцией
setTimeout(() => {
    console.log('Выполнено!');
}, 1000);`,

    setInterval: `// Выполнять код каждые N миллисекунд
let counter = 0;

const intervalId = setInterval(function() {
    counter++;
    console.log('Секунд прошло:', counter);
    
    // Остановить после 10 секунд
    if (counter >= 10) {
        clearInterval(intervalId);
        console.log('Таймер остановлен');
    }
}, 1000);`,

    clearTimer: `// Остановить таймер
// Для setTimeout
const timeoutId = setTimeout(() => {
    console.log('Это не выполнится');
}, 5000);

clearTimeout(timeoutId); // Отменяем

// Для setInterval
const intervalId = setInterval(() => {
    console.log('Тик');
}, 1000);

// Остановить через 5 секунд
setTimeout(() => {
    clearInterval(intervalId);
}, 5000);`,

    debounce: `// Debounce - выполнить только после паузы
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Использование (например, для поиска)
const searchInput = document.getElementById('search');
const handleSearch = debounce(function(e) {
    console.log('Поиск:', e.target.value);
    // Выполнить поиск
}, 500);

searchInput.addEventListener('input', handleSearch);`,

    throttle: `// Throttle - выполнять не чаще чем раз в N мс
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Использование (например, для скролла)
const handleScroll = throttle(function() {
    console.log('Скролл:', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);`,

    // Dialogs
    alert: `// Уведомление (alert)
alert('Привет! Это уведомление.');

// С переменной
const message = 'Операция выполнена успешно!';
alert(message);`,

    confirm: `// Подтверждение (confirm)
const isConfirmed = confirm('Вы уверены, что хотите удалить?');

if (isConfirmed) {
    console.log('Пользователь подтвердил');
    // Выполнить удаление
} else {
    console.log('Пользователь отменил');
}`,

    prompt: `// Ввод данных (prompt)
const name = prompt('Введите ваше имя:', 'Гость');

if (name !== null && name !== '') {
    console.log('Привет, ' + name + '!');
} else {
    console.log('Имя не введено');
}`,

    customModal: `// Кастомное модальное окно
function showModal(title, content) {
    // Создаём overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;';
    
    // Создаём модальное окно
    overlay.innerHTML = \`
        <div style="background:white;padding:20px;border-radius:8px;max-width:400px;width:90%;">
            <h2 style="margin:0 0 15px 0;">\${title}</h2>
            <p style="margin:0 0 20px 0;">\${content}</p>
            <button onclick="this.closest('.modal-overlay').remove()" 
                    style="padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;">
                Закрыть
            </button>
        </div>
    \`;
    
    document.body.appendChild(overlay);
}

// Использование
showModal('Заголовок', 'Содержимое модального окна');`,

    toast: `// Toast уведомление
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    
    const colors = {
        info: '#3b82f6',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b'
    };
    
    toast.style.cssText = \`
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: \${colors[type]};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    \`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Использование
showToast('Успешно сохранено!', 'success');
showToast('Произошла ошибка', 'error');`,

    // Device
    detectMobile: `// Определить мобильное устройство
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent);
}

if (isMobile()) {
    console.log('Мобильное устройство');
    document.body.classList.add('mobile');
} else {
    console.log('Десктоп');
    document.body.classList.add('desktop');
}`,

    getScreenSize: `// Получить размер экрана
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

console.log('Ширина:', screenWidth);
console.log('Высота:', screenHeight);

// Определить тип устройства по ширине
if (screenWidth < 768) {
    console.log('Мобильный');
} else if (screenWidth < 1024) {
    console.log('Планшет');
} else {
    console.log('Десктоп');
}`,

    onResize: `// Отслеживать изменение размера окна
window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    console.log('Новый размер:', width, 'x', height);
    
    // Адаптивная логика
    if (width < 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
});`,

    copyToClipboard: `// Копировать текст в буфер обмена
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Скопировано в буфер!');
        alert('Скопировано!');
    } catch (err) {
        console.error('Ошибка копирования:', err);
    }
}

// Использование
copyToClipboard('Текст для копирования');

// Копировать содержимое элемента
const text = document.getElementById('elementId').textContent;
copyToClipboard(text);`,

    geolocation: `// Получить геолокацию пользователя
function getLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                console.log('Широта:', lat);
                console.log('Долгота:', lng);
                
                // Использовать координаты
            },
            function(error) {
                console.error('Ошибка геолокации:', error.message);
            }
        );
    } else {
        console.log('Геолокация не поддерживается');
    }
}

getLocation();`
};

function insertSnippet(snippetName) {
    const snippet = codeSnippets[snippetName];
    if (!snippet) {
        logMessage('Сниппет не найден: ' + snippetName, 'error');
        return;
    }
    
    if (jsEditor) {
        const position = jsEditor.getPosition();
        const range = new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
        );
        
        // Добавляем перенос строки перед и после сниппета
        const textToInsert = '\n' + snippet + '\n';
        
        jsEditor.executeEdits('snippet', [{
            range: range,
            text: textToInsert,
            forceMoveMarkers: true
        }]);
        
        // Фокус на редактор
        jsEditor.focus();
        
        logMessage('Сниппет добавлен: ' + snippetName, 'info');
    }
}

// ========================================
// Helper Functions
// ========================================

function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'none') return '#ffffff';
    if (rgb.startsWith('#')) return rgb;
    
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#ffffff';
    
    return '#' + [match[1], match[2], match[3]].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function updateStatus(text) {
    document.getElementById('statusText').textContent = text;
}

function logMessage(msg, type = 'info') {
    const panel = document.getElementById('messagesPanel');
    const time = new Date().toLocaleTimeString();
    const className = type === 'info' ? 'msg-info' : type === 'warn' ? 'msg-warn' : 'msg-error';
    panel.innerHTML += `<div class="${className}">[${time}] ${msg}</div>`;
    panel.scrollTop = panel.scrollHeight;
}

// ========================================
// Canvas Settings
// ========================================

function updateCanvasSettings() {
    const canvas = document.getElementById('designCanvas');
    
    // Get values from inputs
    const width = document.getElementById('canvasWidth').value;
    const height = document.getElementById('canvasHeight').value;
    const bgColor = document.getElementById('canvasBgColor').value;
    const bgColorText = document.getElementById('canvasBgColorText');
    const showGridCheck = document.getElementById('canvasShowGrid').checked;
    const gridSizeVal = document.getElementById('canvasGridSize').value;
    const snapCheck = document.getElementById('canvasSnapToGrid').checked;
    
    // Apply canvas size
    canvas.style.width = width + 'px';
    canvas.style.minHeight = height + 'px';
    settings.canvasWidth = parseInt(width);
    settings.canvasHeight = parseInt(height);
    
    // Apply background color
    canvas.style.backgroundColor = bgColor;
    bgColorText.value = bgColor;
    settings.canvasBgColor = bgColor;
    
    // Apply grid settings
    showGrid = showGridCheck;
    settings.gridSize = parseInt(gridSizeVal);
    snapToGrid = snapCheck;
    
    // Update grid display
    if (showGrid) {
        canvas.classList.add('show-grid');
        canvas.style.backgroundSize = `${settings.gridSize}px ${settings.gridSize}px`;
    } else {
        canvas.classList.remove('show-grid');
    }
    
    logMessage(`Холст обновлен: ${width}x${height}, фон: ${bgColor}`, 'info');
}

function setCanvasPreset(preset) {
    const widthInput = document.getElementById('canvasWidth');
    const heightInput = document.getElementById('canvasHeight');
    
    switch (preset) {
        case 'mobile':
            widthInput.value = 375;
            heightInput.value = 667;
            break;
        case 'tablet':
            widthInput.value = 768;
            heightInput.value = 1024;
            break;
        case 'desktop':
            widthInput.value = 1280;
            heightInput.value = 800;
            break;
        case 'fullhd':
            widthInput.value = 1920;
            heightInput.value = 1080;
            break;
    }
    
    updateCanvasSettings();
    logMessage(`Применен пресет: ${preset}`, 'info');
}

function updateCanvasSettingsUI() {
    const widthInput = document.getElementById('canvasWidth');
    const heightInput = document.getElementById('canvasHeight');
    const bgColorInput = document.getElementById('canvasBgColor');
    const bgColorText = document.getElementById('canvasBgColorText');
    const showGridCheck = document.getElementById('canvasShowGrid');
    const gridSizeInput = document.getElementById('canvasGridSize');
    const snapCheck = document.getElementById('canvasSnapToGrid');
    
    if (widthInput) widthInput.value = settings.canvasWidth || 800;
    if (heightInput) heightInput.value = settings.canvasHeight || 600;
    if (bgColorInput) bgColorInput.value = settings.canvasBgColor || '#ffffff';
    if (bgColorText) bgColorText.value = settings.canvasBgColor || '#ffffff';
    if (showGridCheck) showGridCheck.checked = showGrid;
    if (gridSizeInput) gridSizeInput.value = settings.gridSize || 10;
    if (snapCheck) snapCheck.checked = snapToGrid;
    
    // Apply to canvas
    const canvas = document.getElementById('designCanvas');
    if (canvas) {
        canvas.style.width = (settings.canvasWidth || 800) + 'px';
        canvas.style.minHeight = (settings.canvasHeight || 600) + 'px';
        canvas.style.backgroundColor = settings.canvasBgColor || '#ffffff';
        
        if (showGrid) {
            canvas.classList.add('show-grid');
            canvas.style.backgroundSize = `${settings.gridSize || 10}px ${settings.gridSize || 10}px`;
        } else {
            canvas.classList.remove('show-grid');
        }
    }
}

// ========================================
// Image Component Handler
// ========================================

function updateProperties() {
    if (!selectedElement) return;
    
    const panel = document.getElementById('propertiesPanel');
    const el = selectedElement;
    
    // Special properties for image
    let imageProps = '';
    if (el.type === 'image') {
        imageProps = `
            <div class="property-group">
                <label class="property-label">URL изображения</label>
                <input type="text" class="property-input" 
                    value="${el.attrs.src || ''}" 
                    onchange="updateElementAttr('src', this.value)">
            </div>
            <div class="property-group">
                <label class="property-label">Alt текст</label>
                <input type="text" class="property-input" 
                    value="${el.attrs.alt || ''}" 
                    onchange="updateElementAttr('alt', this.value)">
            </div>
            <div class="property-group">
                <button class="property-btn" onclick="selectImageFile()">📁 Выбрать файл...</button>
            </div>
        `;
    }
    
    // Special properties for link and buttons
    let linkProps = '';
    if (el.type === 'link' || el.type === 'buttonLink' || el.type === 'button') {
        const pagesOptions = pages.map(p => 
            `<option value="${p.name}" ${el.attrs.href === p.name ? 'selected' : ''}>${p.name}</option>`
        ).join('');
        
        linkProps = `
            <div class="property-group">
                <label class="property-label">Действие при клике</label>
                <select class="property-input" onchange="setLinkAction(this.value)">
                    <option value="none" ${!el.linkAction || el.linkAction === 'none' ? 'selected' : ''}>Нет действия</option>
                    <option value="page" ${el.linkAction === 'page' ? 'selected' : ''}>Перейти на страницу</option>
                    <option value="url" ${el.linkAction === 'url' ? 'selected' : ''}>Открыть URL</option>
                    <option value="function" ${el.linkAction === 'function' ? 'selected' : ''}>Вызвать функцию</option>
                </select>
            </div>
            ${el.linkAction === 'page' ? `
            <div class="property-group">
                <label class="property-label">Страница проекта</label>
                <select class="property-input" onchange="setTargetPage(this.value)">
                    <option value="">-- Выберите страницу --</option>
                    ${pagesOptions}
                </select>
            </div>
            ` : ''}
            ${el.linkAction === 'url' ? `
            <div class="property-group">
                <label class="property-label">URL ссылки</label>
                <input type="text" class="property-input" 
                    value="${el.attrs.href || '#'}" 
                    onchange="updateElementAttr('href', this.value)">
            </div>
            <div class="property-group">
                <label class="property-label">Открывать в</label>
                <select class="property-input" onchange="updateElementAttr('target', this.value)">
                    <option value="" ${!el.attrs.target ? 'selected' : ''}>Текущем окне</option>
                    <option value="_blank" ${el.attrs.target === '_blank' ? 'selected' : ''}>Новом окне</option>
                </select>
            </div>
            ` : ''}
            ${el.linkAction === 'function' ? `
            <div class="property-group">
                <label class="property-label">Имя функции</label>
                <input type="text" class="property-input" 
                    value="${el.events.onclick || ''}" 
                    placeholder="myFunction()"
                    onchange="updateElementEvent('onclick', this.value)">
            </div>
            ` : ''}
        `;
    }
    
    // Special properties for iframe
    let iframeProps = '';
    if (el.type === 'iframe') {
        iframeProps = `
            <div class="property-group">
                <label class="property-label">URL страницы</label>
                <input type="text" class="property-input" 
                    value="${el.attrs.src || ''}" 
                    onchange="updateElementAttr('src', this.value)">
            </div>
        `;
    }
    
    // Special properties for video
    let videoProps = '';
    if (el.type === 'video') {
        videoProps = `
            <div class="property-group">
                <label class="property-label">URL видео</label>
                <input type="text" class="property-input" 
                    value="${el.attrs.src || ''}" 
                    onchange="updateVideoSource(this.value)">
            </div>
            <div class="property-group">
                <label class="property-label">Постер</label>
                <input type="text" class="property-input" 
                    value="${el.attrs.poster || ''}" 
                    onchange="updateElementAttr('poster', this.value)">
            </div>
        `;
    }
    
    panel.innerHTML = `
        <div class="property-group">
            <label class="property-label">ID / Имя</label>
            <input type="text" class="property-input" 
                value="${el.name}" onchange="updateElementProperty('name', this.value)">
        </div>
        <div class="property-group">
            <label class="property-label">Тип: <strong>${el.type}</strong></label>
        </div>
        <div class="property-row">
            <div class="property-group">
                <label class="property-label">X</label>
                <input type="number" class="property-input" 
                    value="${Math.round(el.x)}" onchange="updateElementProperty('x', parseInt(this.value))">
            </div>
            <div class="property-group">
                <label class="property-label">Y</label>
                <input type="number" class="property-input" 
                    value="${Math.round(el.y)}" onchange="updateElementProperty('y', parseInt(this.value))">
            </div>
        </div>
        <div class="property-row">
            <div class="property-group">
                <label class="property-label">Ширина</label>
                <input type="text" class="property-input" 
                    value="${el.style.width || 'auto'}" onchange="updateElementStyle('width', this.value)">
            </div>
            <div class="property-group">
                <label class="property-label">Высота</label>
                <input type="text" class="property-input" 
                    value="${el.style.height || 'auto'}" onchange="updateElementStyle('height', this.value)">
            </div>
        </div>
        ${imageProps}
        ${linkProps}
        ${iframeProps}
        ${videoProps}
        ${el.text !== undefined && el.type !== 'image' ? `
        <div class="property-group">
            <label class="property-label">Текст</label>
            <input type="text" class="property-input" 
                value="${el.text}" onchange="updateElementProperty('text', this.value)">
        </div>
        ` : ''}
        <div class="property-group">
            <label class="property-label">Цвет фона</label>
            <div class="property-color-row">
                <input type="color" 
                    value="${rgbToHex(el.style.backgroundColor) || '#ffffff'}" 
                    onchange="updateElementStyle('backgroundColor', this.value)">
                <input type="text" class="property-input" 
                    value="${el.style.backgroundColor || ''}" 
                    onchange="updateElementStyle('backgroundColor', this.value)">
            </div>
        </div>
        <div class="property-group">
            <label class="property-label">Цвет текста</label>
            <div class="property-color-row">
                <input type="color" 
                    value="${rgbToHex(el.style.color) || '#000000'}" 
                    onchange="updateElementStyle('color', this.value)">
                <input type="text" class="property-input" 
                    value="${el.style.color || ''}" 
                    onchange="updateElementStyle('color', this.value)">
            </div>
        </div>
        <div class="property-group">
            <label class="property-label">Размер шрифта</label>
            <input type="text" class="property-input" 
                value="${el.style.fontSize || '14px'}" onchange="updateElementStyle('fontSize', this.value)">
        </div>
        <div class="property-group">
            <label class="property-label">Граница</label>
            <input type="text" class="property-input" 
                value="${el.style.border || 'none'}" onchange="updateElementStyle('border', this.value)">
        </div>
        <div class="property-group">
            <label class="property-label">Скругление</label>
            <input type="text" class="property-input" 
                value="${el.style.borderRadius || '0'}" onchange="updateElementStyle('borderRadius', this.value)">
        </div>
        <div class="property-group">
            <label class="property-label">Тень</label>
            <input type="text" class="property-input" 
                value="${el.style.boxShadow || 'none'}" onchange="updateElementStyle('boxShadow', this.value)">
        </div>
        <div class="property-group">
            <label class="property-label">Прозрачность</label>
            <input type="range" class="property-input" min="0" max="1" step="0.1"
                value="${el.style.opacity || '1'}" onchange="updateElementStyle('opacity', this.value)">
        </div>
    `;
}

function updateElementAttr(attr, value) {
    if (!selectedElement) return;
    
    saveState();
    if (!selectedElement.attrs) selectedElement.attrs = {};
    selectedElement.attrs[attr] = value;
    
    const el = document.getElementById(selectedElement.id);
    if (el) {
        el.setAttribute(attr, value);
    }
    
    logMessage(`Атрибут ${attr} обновлен`, 'info');
}

function updateVideoSource(url) {
    if (!selectedElement || selectedElement.type !== 'video') return;
    
    saveState();
    selectedElement.attrs.src = url;
    
    const el = document.getElementById(selectedElement.id);
    if (el) {
        const source = el.querySelector('source');
        if (source) {
            source.setAttribute('src', url);
        }
        el.load();
    }
}

function selectImageFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            updateElementAttr('src', dataUrl);
            updateProperties();
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

// ========================================
// Link/Button Actions for Page Navigation
// ========================================

function setLinkAction(action) {
    if (!selectedElement) return;
    
    saveState();
    selectedElement.linkAction = action;
    
    // Reset related attributes
    if (action === 'none') {
        selectedElement.attrs.href = '#';
        selectedElement.events.onclick = '';
    } else if (action === 'page') {
        selectedElement.attrs.href = '#';
    } else if (action === 'url') {
        selectedElement.attrs.href = selectedElement.attrs.href || 'https://';
    }
    
    updateProperties();
    logMessage(`Действие изменено: ${action}`, 'info');
}

function setTargetPage(pageName) {
    if (!selectedElement) return;
    
    saveState();
    selectedElement.targetPage = pageName;
    selectedElement.attrs.href = pageName;
    
    // Set onclick to navigate
    if (selectedElement.type === 'button') {
        selectedElement.events.onclick = `navigateToPage('${pageName}')`;
    }
    
    updateProperties();
    logMessage(`Целевая страница: ${pageName}`, 'info');
}

// ========================================
// Multi-Page Preview System
// ========================================

function generateAllPagesHTML() {
    // Save current page
    syncPageWithState();
    
    const allPages = {};
    
    pages.forEach(page => {
        const pageElements = page.elements || [];
        
        // Generate HTML for this page
        let pageHTML = '';
        pageElements.forEach(el => {
            const template = componentTemplates[el.type];
            if (!template) return;
            
            let tag = template.tag;
            let attrs = [`id="${el.id}"`, `class="${el.id}-style"`];
            
            if (el.attrs) {
                Object.entries(el.attrs).forEach(([key, value]) => {
                    // Convert page links to proper hrefs
                    if (key === 'href' && el.linkAction === 'page') {
                        attrs.push(`href="#" onclick="navigateToPage('${value}'); return false;"`);
                    } else {
                        attrs.push(`${key}="${value}"`);
                    }
                });
            }
            
            // Events (except onclick if it's a page navigation)
            Object.entries(el.events || {}).forEach(([event, handler]) => {
                if (handler && !(event === 'onclick' && el.linkAction === 'page')) {
                    attrs.push(`${event}="${handler}"`);
                }
            });
            
            if (['input', 'img', 'br', 'hr'].includes(tag)) {
                pageHTML += `    <${tag} ${attrs.join(' ')}>\n`;
            } else {
                const content = el.innerHTML || el.text || '';
                pageHTML += `    <${tag} ${attrs.join(' ')}>${content}</${tag}>\n`;
            }
        });
        
        // Generate CSS for this page
        let pageCSS = '';
        pageElements.forEach(el => {
            pageCSS += `.${el.id}-style {\n`;
            pageCSS += `  position: absolute;\n`;
            pageCSS += `  left: ${el.x}px;\n`;
            pageCSS += `  top: ${el.y}px;\n`;
            Object.entries(el.style || {}).forEach(([prop, value]) => {
                const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                pageCSS += `  ${cssProp}: ${value};\n`;
            });
            pageCSS += `}\n\n`;
        });
        
        allPages[page.name] = {
            html: pageHTML,
            css: pageCSS,
            js: page.js || '',
            settings: page.settings || {}
        };
    });
    
    return allPages;
}

function updatePreviewMultiPage() {
    const allPages = generateAllPagesHTML();
    const currentPage = getCurrentPage();
    const pluginLinks = getPluginLinks();
    
    // Build navigation script
    const pageNames = pages.map(p => `'${p.name}'`).join(',');
    
    // Combine all CSS
    let allCSS = '';
    Object.values(allPages).forEach(page => {
        allCSS += page.css;
    });
    
    // Build page contents object
    let pageContents = 'const pageContents = {\n';
    Object.entries(allPages).forEach(([name, page]) => {
        const escapedHTML = page.html.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        pageContents += `  '${name}': \`${escapedHTML}\`,\n`;
    });
    pageContents += '};\n';
    
    // Combine all JS
    let allJS = '';
    Object.values(allPages).forEach(page => {
        allJS += page.js + '\n';
    });
    
    const canvasWidth = currentPage.settings?.canvasWidth || settings.canvasWidth || 800;
    const canvasHeight = currentPage.settings?.canvasHeight || settings.canvasHeight || 600;
    const canvasBgColor = currentPage.settings?.canvasBgColor || settings.canvasBgColor || '#ffffff';
    
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${pluginLinks}
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            min-height: 100vh;
            background-color: #f0f0f0;
        }
        .app-container {
            width: ${canvasWidth}px;
            min-height: ${canvasHeight}px;
            background-color: ${canvasBgColor};
            margin: 0 auto;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .page { display: none; position: relative; width: 100%; min-height: ${canvasHeight}px; }
        .page.active { display: block; }
        ${allCSS}
    </style>
</head>
<body>
    <div class="app-container">
        ${pages.map((p, i) => `
        <div class="page ${i === 0 ? 'active' : ''}" id="page-${p.name.replace('.html', '')}">
            ${allPages[p.name]?.html || ''}
        </div>
        `).join('')}
    </div>
    <script>
        // Page navigation system
        const availablePages = [${pageNames}];
        let currentPageName = '${pages[0]?.name || 'index.html'}';
        
        ${pageContents}
        
        function navigateToPage(pageName) {
            console.log('Navigating to:', pageName);
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(p => {
                p.classList.remove('active');
            });
            
            // Show target page
            const pageId = 'page-' + pageName.replace('.html', '');
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
                currentPageName = pageName;
                console.log('Navigated to:', pageName);
            } else {
                console.error('Page not found:', pageName);
            }
        }
        
        // User JavaScript
        try {
            ${allJS}
        } catch(e) {
            console.error('JS Error:', e);
        }
    <\/script>
</body>
</html>`;
    
    const frame = document.getElementById('previewFrame');
    frame.srcdoc = fullHTML;
    logMessage('Предпросмотр обновлен (многостраничный)', 'info');
}