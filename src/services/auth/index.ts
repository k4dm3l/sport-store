import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '@root/configs';
import { IUserDAL } from '@root/dal/user';
import UnauthorizedError from '@root/shared/errors/unauthorized';

export interface IAuthService {
  signin: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<string>;
};

export const authServiceFactory = ({
  usersDAL,
}: {
  usersDAL: IUserDAL;
}): IAuthService => ({
  signin: async ({ email, password }) => {
    const user = await usersDAL.getUserByEmail(email.toLowerCase());

    if (!user) throw new UnauthorizedError('service: invalid credentials');

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) throw new UnauthorizedError('service: invalid credentials');

    const { _id, name } = user;

    const token = jwt.sign({ _id, name, email }, env.JWT_SECRET, { expiresIn: 86400 });
    return token;
  },
});