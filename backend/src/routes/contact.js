const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Конфигурация email транспорта
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Валидация контактной формы
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов'),
  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Введите корректный номер телефона'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Введите корректный email адрес'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Интересующие товары обязательны для заполнения (максимум 1000 символов)')
];

// Отправить контактную форму
router.post('/submit', contactValidation, async (req, res) => {
  try {
    // Проверка валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, phone, email, company, message, contactMethod } = req.body;

    // Создание объекта заявки
    const contactRequest = {
      id: Date.now(),
      name,
      phone,
      email: email || 'Не указан',
      company: company || 'Не указана',
      message: message || 'Не указано',
      contactMethod: contactMethod || 'phone',
      status: 'new',
      createdAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Сохранение заявки в файл (всегда сохраняем, даже если email не настроен)
    const contactsPath = path.join(__dirname, '../../data/contacts.json');
    let contacts = [];
    
    try {
      if (fs.existsSync(contactsPath)) {
        const data = fs.readFileSync(contactsPath, 'utf8');
        contacts = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading contacts file:', error);
      contacts = [];
    }
    
    // Добавляем новую заявку
    contacts.push(contactRequest);
    
    try {
      fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));
      console.log('Contact request saved:', contactRequest);
    } catch (error) {
      console.error('Error saving contact request:', error);
      return res.status(500).json({ 
        error: 'Failed to save contact request',
        message: 'Произошла ошибка при сохранении заявки. Попробуйте позже.'
      });
    }

    // Отправка email уведомления (опционально, только если настроены учетные данные)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
    const emailContent = `
      <h2>Новая заявка с сайта</h2>
      <p><strong>Имя:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email || 'Не указан'}</p>
      <p><strong>Компания:</strong> ${company || 'Не указана'}</p>
          <p><strong>Предпочтительный способ связи:</strong> ${contactMethod || 'phone'}</p>
      <p><strong>Сообщение:</strong></p>
      <p>${message || 'Сообщение не указано'}</p>
      <hr>
      <p><small>IP: ${req.ip}</small></p>
      <p><small>Время: ${new Date().toLocaleString('ru-RU')}</small></p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'admin@marine-company.ru',
      subject: `Новая заявка от ${name}`,
      html: emailContent
    };

        // Отправка email администратору
    await transporter.sendMail(mailOptions);
        console.log('Email notification sent to admin');

    // Отправка подтверждения клиенту (если указан email)
    if (email) {
      const confirmationContent = `
        <h2>Спасибо за обращение!</h2>
        <p>Уважаемый(ая) ${name},</p>
        <p>Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
        <p><strong>Детали заявки:</strong></p>
        <ul>
          <li>Имя: ${name}</li>
          <li>Телефон: ${phone}</li>
          <li>Компания: ${company || 'Не указана'}</li>
          <li>Сообщение: ${message || 'Не указано'}</li>
        </ul>
        <p>Ожидайте звонка в течение 30 минут.</p>
        <hr>
        <p><small>С уважением,<br>Команда Marine Company</small></p>
      `;

      const confirmationMail = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Ваша заявка получена - Marine Company',
        html: confirmationContent
      };

      await transporter.sendMail(confirmationMail);
          console.log('Confirmation email sent to client');
        }
      } catch (emailError) {
        // Логируем ошибку email, но не прерываем процесс
        console.error('Error sending email (request still saved):', emailError.message);
      }
    } else {
      console.log('Email credentials not configured, skipping email notification');
    }

    res.json({
      success: true,
      message: 'Заявка успешно отправлена',
      requestId: contactRequest.id
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ 
      error: 'Failed to submit contact form',
      message: 'Произошла ошибка при отправке заявки. Попробуйте позже.'
    });
  }
});

// Отправить быструю заявку (только имя и телефон)
router.post('/quick', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов'),
  body('phone')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Введите корректный номер телефона')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, phone } = req.body;

    const quickRequest = {
      id: Date.now(),
      name,
      phone,
      type: 'quick',
      status: 'new',
      createdAt: new Date(),
      ip: req.ip
    };

    // Отправка уведомления
    const emailContent = `
      <h2>Быстрая заявка</h2>
      <p><strong>Имя:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      <p><strong>Тип заявки:</strong> Быстрая заявка</p>
      <hr>
      <p><small>IP: ${req.ip}</small></p>
      <p><small>Время: ${new Date().toLocaleString('ru-RU')}</small></p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'admin@marine-company.ru',
      subject: `Быстрая заявка от ${name}`,
      html: emailContent
    };

    await transporter.sendMail(mailOptions);

    console.log('Quick request received:', quickRequest);

    res.json({
      success: true,
      message: 'Заявка отправлена. Мы перезвоним вам в течение 30 минут.',
      requestId: quickRequest.id
    });

  } catch (error) {
    console.error('Error submitting quick form:', error);
    res.status(500).json({ 
      error: 'Failed to submit quick form',
      message: 'Произошла ошибка при отправке заявки.'
    });
  }
});

// Получить статистику заявок (для админки)
router.get('/stats', async (req, res) => {
  try {
    // В реальном проекте здесь будет запрос к базе данных
    const stats = {
      total: 1250,
      today: 8,
      thisWeek: 45,
      thisMonth: 180,
      byStatus: {
        new: 15,
        inProgress: 8,
        completed: 1227
      },
      byType: {
        contact: 890,
        quick: 360
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ error: 'Failed to fetch contact stats' });
  }
});

// Получить список заявок (для админки)
router.get('/requests', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    // В реальном проекте здесь будет запрос к базе данных
    const mockRequests = [
      {
        id: 1,
        name: 'Иван Петров',
        phone: '+7 (999) 123-45-67',
        email: 'ivan@example.com',
        company: 'ООО "Морские технологии"',
        message: 'Интересует водонагреватель для судна',
        type: 'contact',
        status: 'new',
        createdAt: new Date('2023-12-01T10:30:00')
      },
      {
        id: 2,
        name: 'Мария Сидорова',
        phone: '+7 (999) 987-65-43',
        email: null,
        company: null,
        message: null,
        type: 'quick',
        status: 'completed',
        createdAt: new Date('2023-11-30T15:45:00')
      }
    ];

    res.json({
      requests: mockRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 1,
        totalItems: mockRequests.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    res.status(500).json({ error: 'Failed to fetch contact requests' });
  }
});

module.exports = router;
