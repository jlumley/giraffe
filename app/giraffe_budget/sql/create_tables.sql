CREATE TABLE IF NOT EXISTS accounts (
  id integer PRIMARY KEY,
  name text NOT NULL,
  notes text,
  hidden integer,
  created_date integer,
  reconciled_date integer,
  credit_account integer
);

CREATE TABLE IF NOT EXISTS categories (
  id integer PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS payees (
  id integer PRIMARY KEY,
  name text NOT NULL,
  category_prediction integer,
  FOREIGN KEY (category_prediction) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id integer PRIMARY KEY,
  account_id integer NOT NULL,
  category_id integer,
  payee_id integer,
  date integer,
  memo text,
  reconciled integer,
  cleared integer,
  amount real,
  FOREIGN KEY (account_id) REFERENCES accounts (id),
  FOREIGN KEY (category_id) REFERENCES category (id),
  FOREIGN KEY (payee_id) REFERENCES payee (id)
);
