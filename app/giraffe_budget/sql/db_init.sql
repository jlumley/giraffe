INSERT INTO db_version (version) VALUES (1);

CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY,
  name text NOT NULL,
  notes text,
  hidden integer,
  account_type text,
  created_date integer,
  reconciled_date integer
);

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  category_type text,
  target_type text,
  target_amount integer,
  target_date integer,
  category_group text,
  notes text
);

CREATE TABLE IF NOT EXISTS payees (
  id text PIMARY KEY,
  name text NOT NULL,
  category_prediction integer,
  system_payee integer,
  FOREIGN KEY (category_prediction) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  payee_id text,
  date integer,
  memo text,
  reconciled integer,
  cleared integer,
  transfer_id text
);

CREATE TABLE IF NOT EXISTS transaction_categories (
  transaction_id text,
  category_id text,
  amount text,
  PRIMARY KEY (transaction_id, category_id),
  FOREIGN KEY (transaction_id) REFERENCES transactions (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS assignments (
  date integer,
  amount int,
  category_id text,
  transaction_id text,
  FOREIGN KEY (transaction_id) REFERENCES transactions (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);

INSERT INTO categories (name, category_type, category_group) VALUES ("To be Assigned", "system", NULL);

INSERT INTO categories (name, category_type, category_group) VALUES ("System", "system", NULL);
