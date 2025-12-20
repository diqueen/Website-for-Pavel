const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

// Путь к файлу с контактами
const contactsFilePath = path.join(__dirname, '../../data/contacts.json')

// Функция для загрузки контактов из файла
function loadContacts() {
  try {
    if (fs.existsSync(contactsFilePath)) {
      const data = fs.readFileSync(contactsFilePath, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Ошибка загрузки контактов:', error)
    return []
  }
}

// Функция для сохранения контактов в файл
function saveContacts(contacts) {
  try {
    const dataDir = path.dirname(contactsFilePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2))
    return true
  } catch (error) {
    console.error('Ошибка сохранения контактов:', error)
    return false
  }
}

// Получение всех контактов
router.get('/', (req, res) => {
  try {
    const contacts = loadContacts()
    res.json(contacts)
  } catch (error) {
    console.error('Ошибка получения контактов:', error)
    res.status(500).json({ error: 'Ошибка получения контактов' })
  }
})

// Получение контакта по ID
router.get('/:id', (req, res) => {
  try {
    const contacts = loadContacts()
    const contact = contacts.find(c => c.id === req.params.id)
    
    if (contact) {
      res.json(contact)
    } else {
      res.status(404).json({ error: 'Контакт не найден' })
    }
  } catch (error) {
    console.error('Ошибка получения контакта:', error)
    res.status(500).json({ error: 'Ошибка получения контакта' })
  }
})

// Создание нового контакта
router.post('/', (req, res) => {
  try {
    const contacts = loadContacts()
    const newContact = {
      id: `contact-${Date.now()}`,
      ...req.body,
      status: req.body.status || 'new',
      createdAt: new Date().toISOString(),
      assignedTo: req.body.assignedTo || null
    }
    
    contacts.push(newContact)
    
    if (saveContacts(contacts)) {
      res.status(201).json(newContact)
    } else {
      throw new Error('Ошибка сохранения')
    }
  } catch (error) {
    console.error('Ошибка создания контакта:', error)
    res.status(500).json({ error: 'Ошибка создания контакта' })
  }
})

// Обновление контакта
router.put('/:id', (req, res) => {
  try {
    const contacts = loadContacts()
    const index = contacts.findIndex(c => c.id === req.params.id)
    
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      }
      
      if (saveContacts(contacts)) {
        res.json(contacts[index])
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Контакт не найден' })
    }
  } catch (error) {
    console.error('Ошибка обновления контакта:', error)
    res.status(500).json({ error: 'Ошибка обновления контакта' })
  }
})

// Удаление контакта
router.delete('/:id', (req, res) => {
  try {
    const contacts = loadContacts()
    const filteredContacts = contacts.filter(c => c.id !== req.params.id)
    
    if (filteredContacts.length < contacts.length) {
      if (saveContacts(filteredContacts)) {
        res.json({ success: true, message: 'Контакт удален' })
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Контакт не найден' })
    }
  } catch (error) {
    console.error('Ошибка удаления контакта:', error)
    res.status(500).json({ error: 'Ошибка удаления контакта' })
  }
})

// Изменение статуса контакта
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body
    const contacts = loadContacts()
    const index = contacts.findIndex(c => c.id === req.params.id)
    
    if (index !== -1) {
      contacts[index].status = status
      contacts[index].updatedAt = new Date().toISOString()
      
      if (saveContacts(contacts)) {
        res.json({ 
          success: true, 
          status: contacts[index].status,
          message: `Статус изменен на ${status}`
        })
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Контакт не найден' })
    }
  } catch (error) {
    console.error('Ошибка изменения статуса:', error)
    res.status(500).json({ error: 'Ошибка изменения статуса' })
  }
})

// Назначение контакта сотруднику
router.patch('/:id/assign', (req, res) => {
  try {
    const { assignedTo } = req.body
    const contacts = loadContacts()
    const index = contacts.findIndex(c => c.id === req.params.id)
    
    if (index !== -1) {
      contacts[index].assignedTo = assignedTo
      contacts[index].updatedAt = new Date().toISOString()
      
      if (saveContacts(contacts)) {
        res.json({ 
          success: true, 
          assignedTo: contacts[index].assignedTo,
          message: `Контакт назначен ${assignedTo || 'не назначен'}`
        })
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Контакт не найден' })
    }
  } catch (error) {
    console.error('Ошибка назначения контакта:', error)
    res.status(500).json({ error: 'Ошибка назначения контакта' })
  }
})

// Получение статистики контактов
router.get('/stats/overview', (req, res) => {
  try {
    const contacts = loadContacts()
    const stats = {
      total: contacts.length,
      new: contacts.filter(c => c.status === 'new').length,
      inProgress: contacts.filter(c => c.status === 'inProgress').length,
      completed: contacts.filter(c => c.status === 'completed').length,
      cancelled: contacts.filter(c => c.status === 'cancelled').length,
      byType: {
        contact: contacts.filter(c => c.type === 'contact').length,
        quick: contacts.filter(c => c.type === 'quick').length,
        consultation: contacts.filter(c => c.type === 'consultation').length
      },
      byDate: {
        today: contacts.filter(c => {
          const today = new Date().toDateString()
          return new Date(c.createdAt).toDateString() === today
        }).length,
        thisWeek: contacts.filter(c => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(c.createdAt) >= weekAgo
        }).length,
        thisMonth: contacts.filter(c => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return new Date(c.createdAt) >= monthAgo
        }).length
      }
    }
    
    res.json(stats)
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    res.status(500).json({ error: 'Ошибка получения статистики' })
  }
})

// Поиск контактов
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params
    const contacts = loadContacts()
    const searchLower = query.toLowerCase()
    
    const searchResults = contacts.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.includes(query) ||
      c.message.toLowerCase().includes(searchLower)
    )
    
    res.json({
      query,
      results: searchResults,
      total: searchResults.length
    })
  } catch (error) {
    console.error('Ошибка поиска контактов:', error)
    res.status(500).json({ error: 'Ошибка поиска контактов' })
  }
})

// Фильтрация контактов
router.get('/filter/status/:status', (req, res) => {
  try {
    const { status } = req.params
    const contacts = loadContacts()
    
    if (status === 'all') {
      res.json(contacts)
    } else {
      const filteredContacts = contacts.filter(c => c.status === status)
      res.json(filteredContacts)
    }
  } catch (error) {
    console.error('Ошибка фильтрации контактов:', error)
    res.status(500).json({ error: 'Ошибка фильтрации контактов' })
  }
})

module.exports = router

