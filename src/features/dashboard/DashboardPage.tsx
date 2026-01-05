{/* Summary Cards CON GLASSMORPHISM */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  {/* Net Worth - Glassmorphism */}
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
    <Card 
      className="relative p-6 border-none"
      style={{
        background: 'linear-gradient(135deg, rgba(5, 191, 219, 0.15), rgba(8, 131, 149, 0.1))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(5, 191, 219, 0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">
          Patrimonio Neto
        </p>
        <Wallet className="w-5 h-5 text-primary-400" />
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-white">
          ${netWorth.toFixed(2)}
        </p>
        <div className="flex items-center gap-1 text-sm">
          {netWorth >= 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">+0.00%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-red-400">-0.00%</span>
            </>
          )}
        </div>
      </div>
    </Card>
  </div>

  {/* Income - Glassmorphism */}
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
    <Card 
      className="relative p-6 border-none"
      style={{
        background: 'linear-gradient(135deg, rgba(8, 199, 146, 0.15), rgba(6, 150, 110, 0.1))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(8, 199, 146, 0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">
          Ingresos
        </p>
        <ArrowUpRight className="w-5 h-5 text-green-400" />
      </div>
      <p className="text-3xl font-bold text-green-400">
        ${totalIncome.toFixed(2)}
      </p>
    </Card>
  </div>

  {/* Expenses - Glassmorphism */}
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
    <Card 
      className="relative p-6 border-none"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.15), rgba(200, 65, 25, 0.1))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(255, 87, 34, 0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">
          Gastos
        </p>
        <ArrowDownRight className="w-5 h-5 text-red-400" />
      </div>
      <p className="text-3xl font-bold text-red-400">
        ${totalExpense.toFixed(2)}
      </p>
    </Card>
  </div>
</div>