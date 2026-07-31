import bcrypt from "bcryptjs";

const candidatePassword = "x7Q@m#9Lp$2Bv&W"; // the password /api/seed reported
const storedHash = "$2b$12$Ob52O9PAC..lnwGecKUbROxa.pNlOkoGgZJv4Mo2meJfWN8kufCBS";

const isValid = await bcrypt.compare(candidatePassword, storedHash);
console.log("Password matches:", isValid);