import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export const hashPassword = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltOrRounds);
  } catch (error) {}
};
export const comparePassword = async (
  plainPassword: string,
  hashPassword: string,
) => {
  try {
    return await bcrypt.compare(plainPassword, hashPassword);
  } catch (error) {}
};
