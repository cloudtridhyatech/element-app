export const checkAuthorisation = (user, allowedRoles) => {
  if (!user) return false;
  if (!user.roles) return false;
  for (const role of allowedRoles) {
    if (user.roles.includes(role)) {
      return true;
    }
  }
  return false;
};
