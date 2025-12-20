const express = require('express');
const router = express.Router();

// Временные данные галереи
const galleryItems = [
  {
    id: 1,
    title: 'Модернизация рыболовного судна',
    description: 'Комплексная модернизация навигационного и рыбопоискового оборудования на судне длиной 45 метров.',
    category: 'ships',
    subcategory: 'fishing',
    year: '2023',
    location: 'Мурманск',
    client: 'ООО "Северный рыбак"',
    duration: '3 месяца',
    budget: '2,500,000 ₽',
    images: [
      '/uploads/gallery/fishing-ship-1.jpg',
      '/uploads/gallery/fishing-ship-2.jpg',
      '/uploads/gallery/fishing-ship-3.jpg'
    ],
    video: '/uploads/gallery/fishing-ship-video.mp4',
    features: [
      'Установка современной навигационной системы',
      'Модернизация рыбопоискового оборудования',
      'Обновление системы безопасности',
      'Интеграция новых электронных систем'
    ],
    results: [
      'Повышение эффективности рыболовства на 35%',
      'Снижение расхода топлива на 15%',
      'Улучшение безопасности экипажа',
      'Соответствие международным стандартам'
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-09-20')
  },
  {
    id: 2,
    title: 'Установка системы безопасности на круизном лайнере',
    description: 'Монтаж современной системы пожарной безопасности и контроля доступа на круизном лайнере.',
    category: 'safety',
    subcategory: 'cruise',
    year: '2023',
    location: 'Санкт-Петербург',
    client: 'Круизная компания "Балтика"',
    duration: '2 месяца',
    budget: '1,800,000 ₽',
    images: [
      '/uploads/gallery/cruise-safety-1.jpg',
      '/uploads/gallery/cruise-safety-2.jpg'
    ],
    video: null,
    features: [
      'Установка автоматической системы пожаротушения',
      'Монтаж системы оповещения и эвакуации',
      'Интеграция системы контроля доступа',
      'Настройка видеонаблюдения'
    ],
    results: [
      'Полное соответствие международным стандартам безопасности',
      'Автоматизация процессов контроля',
      'Повышение безопасности пассажиров',
      'Снижение страховых рисков'
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-06-15')
  },
  {
    id: 3,
    title: 'Автоматизация портового терминала',
    description: 'Внедрение автоматизированной системы управления грузопотоками в крупном портовом терминале.',
    category: 'automation',
    subcategory: 'port',
    year: '2022',
    location: 'Новороссийск',
    client: 'Порт "Новороссийск"',
    duration: '8 месяцев',
    budget: '15,000,000 ₽',
    images: [
      '/uploads/gallery/port-automation-1.jpg',
      '/uploads/gallery/port-automation-2.jpg',
      '/uploads/gallery/port-automation-3.jpg',
      '/uploads/gallery/port-automation-4.jpg'
    ],
    video: '/uploads/gallery/port-automation-video.mp4',
    features: [
      'Автоматизация погрузочно-разгрузочных работ',
      'Система управления складскими операциями',
      'Интеграция с таможенными системами',
      'Мониторинг в реальном времени'
    ],
    results: [
      'Увеличение пропускной способности на 40%',
      'Снижение времени обработки грузов на 30%',
      'Оптимизация логистических процессов',
      'Повышение точности учета'
    ],
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2022-03-01'),
    updatedAt: new Date('2022-11-30')
  },
  {
    id: 4,
    title: 'Техническое обслуживание флота',
    description: 'Плановое техническое обслуживание судового оборудования на 15 судах рыболовного флота.',
    category: 'maintenance',
    subcategory: 'fleet',
    year: '2023',
    location: 'Владивосток',
    client: 'Дальневосточная рыболовная компания',
    duration: '6 месяцев',
    budget: '8,500,000 ₽',
    images: [
      '/uploads/gallery/fleet-maintenance-1.jpg',
      '/uploads/gallery/fleet-maintenance-2.jpg'
    ],
    video: null,
    features: [
      'Диагностика всех систем судов',
      'Плановое техническое обслуживание',
      'Замена изношенных деталей',
      'Модернизация устаревшего оборудования'
    ],
    results: [
      'Продление срока службы оборудования на 5 лет',
      'Снижение аварийности на 60%',
      'Оптимизация расходов на обслуживание',
      'Повышение надежности флота'
    ],
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-07-15')
  },
  {
    id: 5,
    title: 'Поставка навигационного оборудования',
    description: 'Комплексная поставка и настройка навигационных систем для 8 судов различного назначения.',
    category: 'equipment',
    subcategory: 'navigation',
    year: '2022',
    location: 'Архангельск',
    client: 'Северное морское пароходство',
    duration: '4 месяца',
    budget: '6,200,000 ₽',
    images: [
      '/uploads/gallery/navigation-equipment-1.jpg',
      '/uploads/gallery/navigation-equipment-2.jpg',
      '/uploads/gallery/navigation-equipment-3.jpg'
    ],
    video: '/uploads/gallery/navigation-equipment-video.mp4',
    features: [
      'Поставка GPS навигационных систем',
      'Установка радаров и эхолотов',
      'Интеграция с существующими системами',
      'Обучение экипажа'
    ],
    results: [
      'Повышение точности навигации',
      'Улучшение безопасности мореплавания',
      'Снижение рисков навигационных ошибок',
      'Соответствие международным требованиям'
    ],
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2022-12-01')
  },
  {
    id: 6,
    title: 'Ремонт двигательной установки',
    description: 'Капитальный ремонт главного двигателя грузового судна с заменой критически важных узлов.',
    category: 'maintenance',
    subcategory: 'engine',
    year: '2023',
    location: 'Калининград',
    client: 'Балтийское морское пароходство',
    duration: '1 месяц',
    budget: '3,800,000 ₽',
    images: [
      '/uploads/gallery/engine-repair-1.jpg',
      '/uploads/gallery/engine-repair-2.jpg'
    ],
    video: null,
    features: [
      'Диагностика двигательной установки',
      'Капитальный ремонт главного двигателя',
      'Замена изношенных деталей',
      'Тестирование и настройка'
    ],
    results: [
      'Восстановление мощности двигателя на 95%',
      'Снижение расхода топлива на 20%',
      'Увеличение межремонтного периода',
      'Повышение надежности работы'
    ],
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-06-10')
  }
];

// Получить все проекты галереи
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      year, 
      location, 
      isFeatured, 
      isActive,
      page = 1,
      limit = 12
    } = req.query;
    
    let filteredItems = [...galleryItems];

    // Фильтрация по категории
    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    // Фильтрация по подкатегории
    if (subcategory) {
      filteredItems = filteredItems.filter(item => item.subcategory === subcategory);
    }

    // Фильтрация по году
    if (year) {
      filteredItems = filteredItems.filter(item => item.year === year);
    }

    // Фильтрация по локации
    if (location) {
      filteredItems = filteredItems.filter(item => 
        item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Фильтрация по избранным
    if (isFeatured !== undefined) {
      const isFeaturedBool = isFeatured === 'true';
      filteredItems = filteredItems.filter(item => item.isFeatured === isFeaturedBool);
    }

    // Фильтрация по активности
    if (isActive !== undefined) {
      const isActiveBool = isActive === 'true';
      filteredItems = filteredItems.filter(item => item.isActive === isActiveBool);
    }

    // Сортировка по дате создания (новые сначала)
    filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    res.json({
      projects: paginatedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredItems.length / limit),
        totalItems: filteredItems.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Получить проект по ID
router.get('/:id', async (req, res) => {
  try {
    const project = galleryItems.find(item => item.id === parseInt(req.params.id));
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching gallery project:', error);
    res.status(500).json({ error: 'Failed to fetch gallery project' });
  }
});

// Получить категории проектов
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      { id: 'ships', name: 'Судостроение', count: 1 },
      { id: 'safety', name: 'Безопасность', count: 1 },
      { id: 'automation', name: 'Автоматизация', count: 1 },
      { id: 'maintenance', name: 'Обслуживание', count: 2 },
      { id: 'equipment', name: 'Оборудование', count: 1 }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    res.status(500).json({ error: 'Failed to fetch gallery categories' });
  }
});

// Получить подкатегории
router.get('/categories/:category/subcategories', async (req, res) => {
  try {
    const { category } = req.params;
    
    const subcategories = {
      'ships': [
        { id: 'fishing', name: 'Рыболовные суда', count: 1 }
      ],
      'safety': [
        { id: 'cruise', name: 'Круизные суда', count: 1 }
      ],
      'automation': [
        { id: 'port', name: 'Портовые терминалы', count: 1 }
      ],
      'maintenance': [
        { id: 'fleet', name: 'Флот', count: 1 },
        { id: 'engine', name: 'Двигатели', count: 1 }
      ],
      'equipment': [
        { id: 'navigation', name: 'Навигация', count: 1 }
      ]
    };
    
    res.json(subcategories[category] || []);
  } catch (error) {
    console.error('Error fetching gallery subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch gallery subcategories' });
  }
});

// Получить избранные проекты
router.get('/featured/list', async (req, res) => {
  try {
    const featuredProjects = galleryItems
      .filter(item => item.isFeatured && item.isActive)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
    
    res.json(featuredProjects);
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({ error: 'Failed to fetch featured projects' });
  }
});

// Получить похожие проекты
router.get('/:id/similar', async (req, res) => {
  try {
    const project = galleryItems.find(item => item.id === parseInt(req.params.id));
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const similarProjects = galleryItems
      .filter(item => 
        item.id !== project.id && 
        (item.category === project.category || item.subcategory === project.subcategory)
      )
      .slice(0, 3);
    
    res.json(similarProjects);
  } catch (error) {
    console.error('Error fetching similar projects:', error);
    res.status(500).json({ error: 'Failed to fetch similar projects' });
  }
});

// Получить статистику проектов
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = {
      total: galleryItems.length,
      byCategory: {
        ships: galleryItems.filter(item => item.category === 'ships').length,
        safety: galleryItems.filter(item => item.category === 'safety').length,
        automation: galleryItems.filter(item => item.category === 'automation').length,
        maintenance: galleryItems.filter(item => item.category === 'maintenance').length,
        equipment: galleryItems.filter(item => item.category === 'equipment').length
      },
      byYear: {
        '2023': galleryItems.filter(item => item.year === '2023').length,
        '2022': galleryItems.filter(item => item.year === '2022').length
      },
      totalBudget: galleryItems.reduce((sum, item) => {
        const budget = parseInt(item.budget.replace(/[^\d]/g, ''));
        return sum + (isNaN(budget) ? 0 : budget);
      }, 0),
      featured: galleryItems.filter(item => item.isFeatured).length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching gallery stats:', error);
    res.status(500).json({ error: 'Failed to fetch gallery stats' });
  }
});

module.exports = router;
