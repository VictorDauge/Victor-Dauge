import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('members', {
 id:text('id').primaryKey(), userId:text('user_id'), email:text('email'), name:text('name').notNull(),role:text('role').notNull(),unit:text('unit').notNull(),active:integer('active').notNull().default(1),createdAt:text('created_at').notNull()
},t=>[uniqueIndex('members_user_id').on(t.userId),uniqueIndex('members_email').on(t.email)]);
export const records=sqliteTable('records',{
 key:text('key').primaryKey(),kind:text('kind').notNull(),unit:text('unit').notNull(),payload:text('payload').notNull(),revision:integer('revision').notNull().default(1),uniqueKey:text('unique_key'),createdAt:text('created_at').notNull()
},t=>[index('records_unit_kind').on(t.unit,t.kind),uniqueIndex('records_unique_key').on(t.uniqueKey)]);
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),payload:text('payload').notNull()});
