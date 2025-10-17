create database bank;
use bank;

create table branches (
    cab char(5) not null,
    address varchar(255) not null,
    unique primary key(cab)
);
create table account_holders (
    id bigint unsigned not null auto_increment,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    date_of_birth date not null,
    birthplace varchar(255) not null,
    gender enum("m", "f") not null,
    address varchar(255) not null,
    document_type enum("identity_card", "drivers_licence", "passport") not null,
    document_id varchar(255) unique not null,
    cellphone varchar(15) not null,
    email varchar(255) not null,
    cf varchar(16) not null,
    primary key(id)
);

-- DEBUG: unable to represent joint accounts
create table accounts (
    id bigint unsigned not null auto_increment,
    iban char(27) unique not null,
    account_number char(12) unique not null,
    branch char(5) not null,
    account_holder bigint unsigned not null,
    balance decimal(15, 2) not null default 0,
    status enum("active", "closed", "suspended") not null default "active",
    primary key(id),
    foreign key(account_holder) references account_holder(id)
        -- if account holder's id is modified, accounts will be reassigned accordingly
        on update cascade
        -- can't delete an account holder if their account is still active
        on delete restrict,
    foreign key(branch) references branches(cab)
        -- if branch's cab is modified, accounts will be reassigned accordingly
        on update cascade
        -- can't delete a branch, if it still has active accounts
        on delete restrict
);

create table transaction (
    id bigint unsigned not null,
    -- not foreign keys because external money transfers should be allowed
    remitter_iban char(27),
    beneficiary_iban char(27),
    amount decimal(15, 2) not null,
    transaction_date datetime not null default current_timestamp(),
    status enum("fulfilled", "pending", "rejected") not null default "fulfilled",
    primary key(id) auto_increment,
    check (remitter_iban is not null or beneficiary_iban is not null)
);