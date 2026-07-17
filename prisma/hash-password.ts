import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.log("Usage: npx tsx prisma/hash-password.ts yourpassword");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("Hash:", hash);
});
