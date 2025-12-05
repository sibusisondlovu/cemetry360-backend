const { AuditLog } = require('../models');

const auditLog = (entityType, operation) => {
  return async (req, res, next) => {
    const originalSend = res.json;
    res.json = function (data) {
      if (req.user && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
        const entityId = req.params.id || data?._id || data?.id || null;
        
        AuditLog.create({
          userId: req.user._id,
          username: req.user.username,
          entityType,
          entityId: entityId || null,
          operation,
          beforeValue: req.method === 'PUT' || req.method === 'DELETE' ? JSON.stringify(req.body) : null,
          afterValue: req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(data) : null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        }).catch(err => console.error('Audit log error:', err));
      }
      return originalSend.call(this, data);
    };
    next();
  };
};

module.exports = auditLog;

