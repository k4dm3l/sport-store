import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import env from '@root/configs';
import { IUserDAL } from '@root/dal/user';
import { ObjectId } from 'mongodb';

export type JwtStrategyFactory = (usersDAL: IUserDAL) => JwtStrategy; 

export const jwtStrategyFactory: JwtStrategyFactory = (usersDAL) => {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET,
  } as StrategyOptionsWithoutRequest;

  return new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await usersDAL.getUserById(new ObjectId(payload._id));
      return user ? done(null, user) : done(null, false);
    } catch (error) {
      return done(null, false);
    }
  });
};