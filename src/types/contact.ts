export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "archived";
  createdAt: string;
};
