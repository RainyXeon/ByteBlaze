export type db_credentials_type = {
  JSON: { enable: boolean, path: string },
  MONGO_DB: { enable: boolean, uri: string },
  MYSQL: {
    enable: boolean,
    host: string,
    user: string
    password: string
    database: string
  }
}