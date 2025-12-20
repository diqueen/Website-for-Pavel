const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Валидация формы сотрудничества
const cooperationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов'),
  body('contact')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Способы связи должны содержать от 3 до 200 символов'),
  body('positions')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Описание позиций/услуг обязательно для заполнения (максимум 2000 символов)')
];

// Отправить заявку на сотрудничество
router.post('/submit', cooperationValidation, async (req, res) => {
  try {
    // Проверка валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, contact, positions } = req.body;

    // Создание объекта заявки
    const cooperationRequest = {
      id: Date.now(),
      name,
      contact,
      positions,
      status: 'new',
      createdAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Сохранение заявки в файл
    const cooperationPath = path.join(__dirname, '../../data/cooperation.json');
    let requests = [];
    
    try {
      if (fs.existsSync(cooperationPath)) {
        const data = fs.readFileSync(cooperationPath, 'utf8');
        requests = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading cooperation file:', error);
      requests = [];
    }
    
    // Добавляем новую заявку
    requests.push(cooperationRequest);
    
    try {
      fs.writeFileSync(cooperationPath, JSON.stringify(requests, null, 2));
      console.log('Cooperation request saved:', cooperationRequest);
    } catch (error) {
      console.error('Error saving cooperation request:', error);
      return res.status(500).json({ 
        error: 'Failed to save cooperation request',
        message: 'Произошла ошибка при сохранении заявки. Попробуйте позже.'
      });
    }

    res.json({
      success: true,
      message: 'Заявка успешно отправлена',
      requestId: cooperationRequest.id
    });

  } catch (error) {
    console.error('Error submitting cooperation form:', error);
    res.status(500).json({ 
      error: 'Failed to submit cooperation form',
      message: 'Произошла ошибка при отправке заявки. Попробуйте позже.'
    });
  }
});

module.exports = router;


