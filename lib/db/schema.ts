import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('profiles', {
  id: text('id').primaryKey(), // This will reference auth.users.id
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userCredits = pgTable('user_credits', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  credits: integer('credits').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const shapeGenerations = pgTable('shape_generations', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  parameters: jsonb('parameters').notNull(), // Store shape parameters as JSON
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
  fileUrl: text('file_url'), // URL to the generated GLB/STL file
  creditsUsed: integer('credits_used').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  amount: integer('amount').notNull(), // Positive for purchases, negative for usage
  type: varchar('type', { length: 20 }).notNull(), // 'purchase', 'usage', 'bonus'
  description: text('description'),
  stripePaymentId: text('stripe_payment_id'),
  generationId: integer('generation_id').references(() => shapeGenerations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  credits: one(userCredits),
  generations: many(shapeGenerations),
  transactions: many(creditTransactions),
}));

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}));

export const shapeGenerationsRelations = relations(shapeGenerations, ({ one }) => ({
  user: one(users, {
    fields: [shapeGenerations.userId],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
  generation: one(shapeGenerations, {
    fields: [creditTransactions.generationId],
    references: [shapeGenerations.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserCredits = typeof userCredits.$inferSelect;
export type NewUserCredits = typeof userCredits.$inferInsert;
export type ShapeGeneration = typeof shapeGenerations.$inferSelect;
export type NewShapeGeneration = typeof shapeGenerations.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;

// Activity types for dashboard (keeping for compatibility)
export enum ActivityType {
  SIGN_UP = 'sign_up',
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  UPDATE_PASSWORD = 'update_password',
  DELETE_ACCOUNT = 'delete_account',
  UPDATE_ACCOUNT = 'update_account',
  CREATE_TEAM = 'create_team',
  REMOVE_TEAM_MEMBER = 'remove_team_member',
  INVITE_TEAM_MEMBER = 'invite_team_member',
  ACCEPT_INVITATION = 'accept_invitation',
}
