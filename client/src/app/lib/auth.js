import { sign, verify } from 'jsonwebtoken';

export const generateTokens = (user) => {
  const accessToken = sign(
    { 
      sub: user.username,
      roles: [user.role],
      userId: user.id 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = sign(
    { 
      sub: user.username,
      roles: [user.role],
      userId: user.id 
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  try {
    return verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};