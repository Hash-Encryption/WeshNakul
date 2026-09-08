-- Add coordinate columns to rooms table
alter table rooms add column if not exists latitude double precision;
alter table rooms add column if not exists longitude double precision;

