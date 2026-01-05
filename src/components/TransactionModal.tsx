// src/components/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, Tag, AlertCircle } from 'lucide-react';
import { Button } from './ui';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
  mode?: 'create' | 'edit';
}

const CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Hogar',
  'Servicios',
  'Compras',
  'Viajes',
  'Salario',
  'Inversiones',
  'Otros',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  mode = 'create',
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Otros');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      if (transaction.synced_from_plaid) {
        setType(transaction.amount > 0 ? 'expense' : 'income');
      } else {
        setType(transaction.type || 'expense');
      }
      
      setAmount(Math.abs(transaction.amount).toString());
      setDescription(
        transaction.description || 
        transaction.merchant_name || 
        transaction.name || 
        ''
      );
      
      if (Array.isArray(transaction.category)) {
        setCategory(transaction.category[0] || 'Otros');
      } else {
        setCategory(transaction.category || 'Otros');
      }
      
      setDate(transaction.date || new Date().toISOString().split('T')[0]);
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('Otros');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No authenticated user');

      const transactionData = {
        userId,
        amount: parseFloat(amount),
        description,
        category,
        date,
        type,
        synced_from_plaid: transaction?.synced_from_plaid || false,
        plaid_transaction_id: transaction?.plaid_transaction_id || null,
        account_id: transaction?.account_id || null,
        merchant_name: transaction?.merchant_name || null,
        pending: transaction?.pending || false,
        created_at: transaction?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        manually_categorized: true,
      };

      if (mode === 'edit' && transaction?.id) {
        await updateDoc(doc(db, 'transactions', transaction.id), transactionData);
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('✅ Transacción actualizada', {
            body: `${description} - $${amount}`,
            icon: '/icon-192x192.png',
          });
        }
      } else {
        await addDoc(collection(db, 'transactions'), transactionData);
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(
            `💰 ${type === 'income' ? 'Nuevo ingreso' : 'Nuevo gasto'}`,
            {
              body: `${description} - $${amount}`,
              icon: '/icon-192x192.png',
            }
          );
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 191, 219, 0.1), rgba(8, 131, 149, 0.05))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(5, 191, 219, 0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'edit' ? 'Editar Transacción' : 'Nueva Transacción'}
            </h2>
            {transaction?.synced_from_plaid && (
              <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Sincronizada desde el banco
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-3 rounded-lg font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                💰 Ingreso
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-3 rounded-lg font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                💸 Gasto
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Monto
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-400"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-400"
              placeholder="¿Qué compraste?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? '⏳ Guardando...' : mode === 'edit' ? '✅ Actualizar' : '💾 Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;