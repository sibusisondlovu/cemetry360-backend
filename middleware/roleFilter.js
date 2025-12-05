const roleFilter = (req, res, next) => {
  const userRole = req.user?.roleId?.name;

  // Add role-based filtering logic
  req.roleFilter = {
    role: userRole,
    canViewAll: ['Administrator', 'Cemetery Manager'].includes(userRole),
    canViewRevenue: ['Administrator', 'Finance User'].includes(userRole),
    canManageInfrastructure: ['Administrator', 'Cemetery Manager'].includes(userRole),
  };

  next();
};

module.exports = roleFilter;


