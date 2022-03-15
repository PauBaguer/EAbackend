export interface envConf {
  dbUrl: string;
  port: number;
}

export const production: envConf = {
  dbUrl: "mongodb://localhost:27017/test",
  port: 3000,
};

export const development: envConf = {
  dbUrl: "mongodb://localhost:27017/test",
  port: 8080,
};
