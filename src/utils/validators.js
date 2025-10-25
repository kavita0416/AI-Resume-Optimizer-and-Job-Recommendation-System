

export const validateRegister = (data) => {
  if (!data.name || !data.email || !data.password) {
    return "All fields are required";
  }
  return null;
};
