const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = "davidetiano1985@gmail.com";
const SUPER_ADMIN_NAME = "Davide Tiano";
const SUPER_ADMIN_ROLE = "super_admin";
const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 12;

function readPassword() {
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!password) {
    throw new Error("SUPER_ADMIN_PASSWORD is required to seed the super admin.");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `SUPER_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters long.`
    );
  }

  return password;
}

async function passwordMatches(password, hash) {
  if (!hash) return false;

  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

async function main() {
  const password = readPassword();
  const existingUser = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  const shouldUpdatePassword = !(await passwordMatches(
    password,
    existingUser?.password
  ));

  const passwordData = shouldUpdatePassword
    ? { password: await bcrypt.hash(password, BCRYPT_ROUNDS) }
    : {};

  if (existingUser) {
    await prisma.user.update({
      where: { email: SUPER_ADMIN_EMAIL },
      data: {
        name: SUPER_ADMIN_NAME,
        role: SUPER_ADMIN_ROLE,
        suspended: false,
        ...passwordData,
      },
    });

    console.log(`Super admin updated: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: SUPER_ADMIN_EMAIL,
      name: SUPER_ADMIN_NAME,
      role: SUPER_ADMIN_ROLE,
      suspended: false,
      ...passwordData,
    },
  });

  console.log(`Super admin created: ${SUPER_ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
