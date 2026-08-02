/*
# Allow nullable user_id on templates for builtin templates
   Builtin templates are shared across all users, so user_id must be nullable.
*/
ALTER TABLE templates ALTER COLUMN user_id DROP NOT NULL;
