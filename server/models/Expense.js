import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gmailId: { type: String, required: true },
    provider: { type: String, required: true },
    amount: { type: Number, required: true },
    merchant: String,
    transactionId: String,
    subject: String,
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, gmailId: 1 }, { unique: true });

export default mongoose.model('Expense', expenseSchema);
