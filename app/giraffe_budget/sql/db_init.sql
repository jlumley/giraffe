INSERT INTO db_version (version) VALUES (1);

CREATE TABLE IF NOT EXISTS accounts (
  id integer PRIMARY KEY,
  name text NOT NULL,
  notes text,
  hidden integer,
  account_type text,
  created_date integer,
  reconciled_date integer
);

CREATE TABLE IF NOT EXISTS categories (
  id integer PRIMARY KEY,
  name text NOT NULL,
  category_type text,
  target_type text,
  target_amount integer,
  target_date integer,
  category_group text,
  notes text
);

CREATE TABLE IF NOT EXISTS payees (
  id integer PRIMARY KEY,
  name text NOT NULL,
  category_prediction integer,
  system_payee integer,
  FOREIGN KEY (category_prediction) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id integer PRIMARY KEY,
  account_id integer NOT NULL,
  payee_id integer,
  date integer,
  memo text,
  reconciled integer,
  cleared integer,
  amount integer,
  transfer_id text,
  FOREIGN KEY (account_id) REFERENCES accounts (id),
  FOREIGN KEY (payee_id) REFERENCES payees (id)
);

CREATE TABLE IF NOT EXISTS transaction_categories (
  transaction_id integer,
  category_id integer,
  amount integer,
  PRIMARY KEY (transaction_id, category_id),
  FOREIGN KEY (transaction_id) REFERENCES transactions (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS assignments (
  date integer,
  amount int,
  category_id integer,
  transaction_id integer,
  FOREIGN KEY (transaction_id) REFERENCES transactions (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX IF NOT EXISTS transactions_categories_category_index
ON transaction_categories(category_id);

CREATE INDEX IF NOT EXISTS transactions_account_index
ON transactions(account_id);

CREATE INDEX IF NOT EXISTS transactions_payee_index
ON transactions(payee_id);

CREATE INDEX IF NOT EXISTS assignments_category_index
ON assignments(category_id);

INSERT INTO categories (name, category_group) VALUES ("To be Assigned", NULL);
