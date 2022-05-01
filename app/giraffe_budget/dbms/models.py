from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dataclasses import dataclass, field

from .rdb import db

@dataclass
class Account(db.Model):
    id: int = field(init=False)
    name: str
    notes: str
    hidden: bool = False
    credit_card: bool = False
    created_date: int
    reconciled_date: int

    id = db.Column(db.Integer, primary_key=True, auto_increment=True)
    name = db.Column(db.String(80), nullable=False)
    notes = db.Column(db.String(200))
    hidden = db.Column(db.Boolean)
    credit_card = db.Column(db.Boolean)
    created_date = db.Column(db.Integer, nullable=False)
    reconciled_date = db.Column(db.Integer, nullable=False)


@dataclass
class Payee(db.Model):
    id: int = field(init=False)
    name: str
    system_payee: bool = False

    id = db.Column(db.Integer, primary_key=True, auto_increment=True)
    name = db.Column(db.String(80), nullable=False)
    system_payee = db.Column(db.Boolean, nullable=False)


@dataclass
class Category(db.Model):
    id: int = field(init=False)
    name: str
    group: str
    credit_card: bool = False
    target_type: str
    target_amount: int
    target_date: int
    notes: str

    id = db.Column(db.Integer, primary_key=True, auto_increment=True)
    name = db.Column(db.String(80), nullable=False)
    group = db.Column(db.String(80), nullable=False)
    credit_card = db.Column(db.Boolean, nullable=False)
    target_type = db.Column(db.String(80))
    target_amount = db.Column(db.Integer)
    target_date = db.Column(db.Integer)
    notes = db.Column(db.String(200))


@dataclass
class Transaction(db.Model):
    id: int = field(init=False)
    account_id: int
    payee_id: int
    date: int
    memo: str
    reconciled: bool = False
    cleared: bool = False
    transfer_id: str

    id = db.Column(db.Integer, primary_key=True, auto_increment=True)
    account_id = db.Column(db.Integer, nullable=False)
    payee_id = db.Column(db.Integer)
    date = db.Column(db.Integer)
    memo = db.Column(db.String(120))
    reconciled = db.Column(db.Boolean, nullable=False)
    cleared = db.Column(db.Boolean, nullable=False)
    transfer_id = db.Column(db.String(32))


@dataclass
class TransactionCategory(db.Model):
    transaction_id: int
    category_id: int
    amount: int

    transaction_id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)


@dataclass
class CategoryAssignment(db.Model):
    transaction_id: int
    category_id: int
    date: int
    amount: int

    transaction_id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Integer, nullable=False)
