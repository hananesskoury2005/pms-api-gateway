require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,

  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      prefix: '/api/auth',
    },
    housekeeping: {
      url: process.env.HOUSEKEEPING_SERVICE_URL || 'http://localhost:4002',
      prefix: '/api/housekeeping',
    },
    reservations: {
      url: process.env.RESERVATIONS_SERVICE_URL || 'http://localhost:4003',
      prefix: '/api/reservations',
    },
    tarification: {
      url: process.env.TARIFICATION_SERVICE_URL || 'http://localhost:4004',
      prefix: '/api/tarification',
    },
    frontOffice: {
      url: process.env.FRONT_OFFICE_SERVICE_URL || 'http://localhost:4005',
      prefix: '/api/front-office',
    },
    analytics: {
      url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4006',
      prefix: '/api/analytics',
    },
    nightAudit: {
      url: process.env.NIGHT_AUDIT_SERVICE_URL || 'http://localhost:4007',
      prefix: '/api/night-audit',
    },
  },
};
