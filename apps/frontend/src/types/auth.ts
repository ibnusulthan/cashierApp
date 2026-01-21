export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    role: 'ADMIN' | 'CASHIER';
  };
};
