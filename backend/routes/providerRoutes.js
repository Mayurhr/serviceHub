const r = require('express').Router();
const c = require('../controllers/providerController');
const { protect, adminOnly, providerOnly } = require('../middleware/auth');

r.get('/cities', c.getAllowedCities);
r.get('/', c.getProviders);                                // public, supports ?serviceId=
r.get('/dashboard', protect, providerOnly, c.getProviderDashboard); // provider only
r.get('/:id', c.getProvider);
r.post('/smart-match', protect, c.smartMatch);
r.post('/', protect, adminOnly, c.createProvider);
r.put('/:id', protect, adminOnly, c.updateProvider);
r.put('/:id/availability', protect, c.updateAvailability);
r.delete('/:id', protect, adminOnly, c.deleteProvider);

module.exports = r;
