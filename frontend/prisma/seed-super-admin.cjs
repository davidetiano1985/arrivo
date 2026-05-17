const fs = require("fs");
const path = require("path");
const { PrismaClient, Prisma } = require("@prisma/client");
const bcrypt = require("bcryptjs");

let prisma = null;

const SUPER_ADMIN_ROLE = "super_admin";
const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 12;

function readRequiredText(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to seed the super admin.`);
  }

  return value;
}

function readDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    throw new Error("DATABASE_URL is required to seed the super admin.");
  }

  try {
    new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid database connection URL.");
  }

  return value;
}

function readRequiredPassword() {
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

function readSeedInput() {
  return {
    email: readRequiredText("SUPER_ADMIN_EMAIL").toLowerCase(),
    name: readRequiredText("SUPER_ADMIN_NAME"),
    password: readRequiredPassword(),
  };
}

function fieldsFromPrismaDmmf() {
  const model = Prisma?.dmmf?.datamodel?.models?.find(
    (currentModel) => currentModel.name === "User"
  );

  if (!model?.fields?.length) return null;

  return new Set(model.fields.map((field) => field.name));
}

function fieldsFromRuntimeDataModel() {
  const fields = prisma?._runtimeDataModel?.models?.User?.fields;

  if (!fields) return null;

  if (Array.isArray(fields)) {
    return new Set(fields.map((field) => field.name));
  }

  return new Set(Object.keys(fields));
}

function fieldsFromSchemaFile() {
  const schemaPaths = [
    path.join(process.cwd(), "prisma", "schema.prisma"),
    path.join(__dirname, "schema.prisma"),
  ];
  const schemaPath = schemaPaths.find((currentPath) => fs.existsSync(currentPath));

  if (!schemaPath) return null;

  const schema = fs.readFileSync(schemaPath, "utf8");
  const modelMatch = schema.match(/model\s+User\s*\{([\s\S]*?)\n\}/);

  if (!modelMatch) return null;

  const fieldNames = modelMatch[1]
    .split(/\r?\n/)
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter((line) => line && !line.startsWith("@@"))
    .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+/)?.[1])
    .filter(Boolean);

  return new Set(fieldNames);
}

function getUserFields() {
  const fields =
    fieldsFromPrismaDmmf() ?? fieldsFromRuntimeDataModel() ?? fieldsFromSchemaFile();

  if (!fields) {
    throw new Error("Unable to read User fields from Prisma metadata or schema.");
  }

  for (const requiredField of ["id", "email", "role"]) {
    if (!fields.has(requiredField)) {
      throw new Error(`User.${requiredField} is required to seed a super admin.`);
    }
  }

  return fields;
}

async function createPrismaClient(databaseUrl) {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: databaseUrl });

  return new PrismaClient({ adapter });
}

async function passwordMatches(password, hash) {
  if (!hash) return false;

  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

async function passwordDataFor(userFields, password, existingUser) {
  if (!userFields.has("password")) {
    console.warn("User.password not found; password hash was not written.");
    return {};
  }

  const currentHash = existingUser?.password;

  if (await passwordMatches(password, currentHash)) {
    return {};
  }

  return { password: await bcrypt.hash(password, BCRYPT_ROUNDS) };
}

async function main() {
  const input = readSeedInput();
  const databaseUrl = readDatabaseUrl();
  prisma = await createPrismaClient(databaseUrl);
  const userFields = getUserFields();
  const existingUser = await prisma.user.findFirst({
    where: { email: input.email },
  });

  const userData = {
    email: input.email,
    role: SUPER_ADMIN_ROLE,
    ...(userFields.has("name") ? { name: input.name } : {}),
    ...(userFields.has("suspended") ? { suspended: false } : {}),
    ...(await passwordDataFor(userFields, input.password, existingUser)),
  };

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: userData,
    });

    console.log(`Super admin updated: ${input.email}`);
    return;
  }

  await prisma.user.create({
    data: userData,
  });

  console.log(`Super admin created: ${input.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
