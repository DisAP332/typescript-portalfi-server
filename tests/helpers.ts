import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import DBMethods from "../src/db";
import getUserModel from "../src/user/userModel";

// every login is looked up in the shared "Users" tenant db (see
// userController.ts), so seeded users always live there regardless of
// which tenant db the test itself is exercising.
export async function seedUser(username: string, password: string) {
  const User = getUserModel(DBMethods.getConnection("Users"));
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
}

// a fresh, unique tenant name per test file/case so parallel or repeated
// runs against the same in-memory mongod never see each other's data.
export function uniqueTenant(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}
