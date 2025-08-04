// Admin Configuration
// Add email addresses here for users who should have admin access

export const ADMIN_EMAILS = [
  'admin@mrlifter.co.il',
  'coach@mrlifter.co.il', 
  'manager@mrlifter.co.il',
  'owner@mrlifter.co.il'
  // Add more admin emails here as needed
];

export const isAdminUser = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// You can also add role-based permissions here in the future
export const ADMIN_PERMISSIONS = {
  EDIT_PROGRAMS: true,
  MANAGE_VIDEOS: true,
  VIEW_ALL_USERS: true,
  EXPORT_DATA: true
};