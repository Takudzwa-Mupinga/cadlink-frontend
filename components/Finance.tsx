
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, Download, CreditCard, TrendingUp, Filter, Wallet, PieChart, Activity, Building2 } from 'lucide-react';
import { Transaction } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', description: 'Payment for Job: HVAC Design', amount: 850.00, date: 'Oct 24, 2023', status: 'Completed', type: 'Credit' },
    { id: 't2', description: 'Withdrawal to PayPal', amount: -1200.00, date: 'Oct 20, 2023', status: 'Completed', type: 'Debit' },
    { id: 't3', description: 'Payment for Service: 3D Render', amount: 150.00, date: 'Oct 18, 2023', status: 'Processing', type: 'Credit' },
    { id: 't4', description: 'Software Subscription (Revit)', amount: -245.00, date: 'Oct 01, 2023', status: 'Completed', type: 'Debit' },
    { id: 't5', description: 'Payment: Tesla Chassis Consult', amount: 2400.00, date: 'Sep 28, 2023', status: 'Completed', type: 'Credit' },
    { id: 't6', description: 'Server Costs (Cloud Drive)', amount: -15.00, date: 'Sep 25, 2023', status: 'Completed', type: 'Debit' },
];

const DATA_WEEKLY = [
    { label: 'Mon', income: 450, expense: 120 },
    { label: 'Tue', income: 620, expense: 80 },
    { label: 'Wed', income: 550, expense: 450 },
    { label: 'Thu', income: 880, expense: 150 },
    { label: 'Fri', income: 720, expense: 200 },
    { label: 'Sat', income: 1050, expense: 90 },
    { label: 'Sun', income: 1200, expense: 120 },
];

const DATA_MONTHLY = [
    { label: 'Week 1', income: 2400, expense: 800 },
    { label: 'Week 2', income: 1850, expense: 1200 },
    { label: 'Week 3', income: 3200, expense: 600 },
    { label: 'Week 4', income: 4500, expense: 950 },
];

const DATA_YEARLY = [
    { label: 'Jan', income: 12000, expense: 4000 },
    { label: 'Feb', income: 15000, expense: 3500 },
    { label: 'Mar', income: 11000, expense: 5000 },
    { label: 'Apr', income: 18000, expense: 4200 },
    { label: 'May', income: 22000, expense: 6000 },
    { label: 'Jun', income: 25000, expense: 5500 },
    { label: 'Jul', income: 24000, expense: 8000 },
    { label: 'Aug', income: 28000, expense: 7500 },
    { label: 'Sep', income: 26000, expense: 6200 },
    { label: 'Oct', income: 32000, expense: 8000 },
    { label: 'Nov', income: 29000, expense: 7000 },
    { label: 'Dec', income: 35000, expense: 9000 },
];

// --- SVG HELPERS ---

const getControlPoint = (current: number[], previous: number[] | undefined, next: number[] | undefined, reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const opp = (n[0] - p[0]) * smoothing;
    const adj = (n[1] - p[1]) * smoothing;
    return [
        current[0] + (reverse ? -opp : opp),
        current[1] + (reverse ? -adj : adj),
    ];
};

const generatePath = (points: number[][]) => {
    return points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point[0]},${point[1]}`;
        const [cpsX, cpsY] = getControlPoint(a[i - 1], a[i - 2], point);
        const [cpeX, cpeY] = getControlPoint(point, a[i - 1], a[i + 1], true);
        return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    }, '');
};

// --- SUB-COMPONENTS ---

const FinancialChart = () => {
    const { format, symbol } = useCurrency();
    const [timeRange, setTimeRange] = useState<'1W' | '1M' | '1Y'>('1Y');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => { setIsVisible(true); }, []);

    const activeData = useMemo(() => {
        switch(timeRange) {
            case '1W': return DATA_WEEKLY;
            case '1M': return DATA_MONTHLY;
            case '1Y': return DATA_YEARLY;
            default: return DATA_YEARLY;
        }
    }, [timeRange]);

    const chartMetrics = useMemo(() => {
        const width = 800;
        const height = 320;
        const paddingX = 60;
        const paddingY = 40;
        const graphWidth = width - paddingX * 2;
        const graphHeight = height - paddingY * 2;

        if (activeData.length === 0) return null;

        const maxVal = Math.max(...activeData.map(d => Math.max(d.income, d.expense))) * 1.1;
        const xStep = activeData.length > 1 ? graphWidth / (activeData.length - 1) : graphWidth;

        const incomePoints = activeData.map((d, i) => [paddingX + i * xStep, height - paddingY - (d.income / maxVal) * graphHeight]);
        const expensePoints = activeData.map((d, i) => [paddingX + i * xStep, height - paddingY - (d.expense / maxVal) * graphHeight]);

        const incomePath = generatePath(incomePoints);
        const expensePath = generatePath(expensePoints);

        const incomeFill = `${incomePath} L ${incomePoints[incomePoints.length-1][0]},${height - paddingY} L ${incomePoints[0][0]},${height - paddingY} Z`;
        const expenseFill = `${expensePath} L ${expensePoints[expensePoints.length-1][0]},${height - paddingY} L ${expensePoints[0][0]},${height - paddingY} Z`;

        return { width, height, paddingY, maxVal, xStep, incomePoints, expensePoints, incomePath, expensePath, incomeFill, expenseFill };
    }, [activeData]);

    if (!chartMetrics) return null;
    const { width, height, paddingY, maxVal, xStep, incomePoints, expensePoints, incomePath, expensePath, incomeFill, expenseFill } = chartMetrics;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const svgX = (e.clientX - rect.left) * (width / rect.width);
        
        let closest = 0;
        let minDiff = Infinity;
        incomePoints.forEach((p, i) => {
            const diff = Math.abs(p[0] - svgX);
            if (diff < minDiff) { minDiff = diff; closest = i; }
        });
        setHoveredIndex(closest);
    };

    return (
        <div className="glass-panel rounded-2xl border border-cad-border p-6 overflow-hidden relative shadow-premium group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-cad-text flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cad-accent" /> Financial Performance
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-cad-success"><div className="w-2 h-2 rounded-full bg-cad-success"></div> Income</span>
                        <span className="flex items-center gap-1.5 text-red-400"><div className="w-2 h-2 rounded-full bg-red-400"></div> Expense</span>
                    </div>
                </div>
                <div className="flex bg-cad-surface p-1 rounded-xl border border-cad-border">
                    {['1W', '1M', '1Y'].map(r => (
                        <button 
                            key={r} 
                            onClick={() => { setTimeRange(r as any); setHoveredIndex(null); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === r ? 'bg-cad-accent text-cad-dark shadow-sm' : 'text-cad-muted hover:text-cad-text'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full overflow-hidden">
                <svg 
                    ref={svgRef}
                    viewBox={`0 0 ${width} ${height}`} 
                    className="w-full h-auto cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <defs>
                        <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f87171" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                        const y = height - paddingY - t * (height - paddingY * 2);
                        return (
                            <g key={t}>
                                <line x1={50} y1={y} x2={width} y2={y} stroke="currentColor" className="text-cad-border opacity-30" strokeDasharray="4 4" />
                                <text x={40} y={y + 4} textAnchor="end" className="fill-cad-muted text-[10px] font-mono">{symbol}{Math.round(t * maxVal / 1000)}k</text>
                            </g>
                        )
                    })}

                    {/* Fills */}
                    <path d={incomeFill} fill="url(#gradIncome)" className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
                    <path d={expenseFill} fill="url(#gradExpense)" className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Lines */}
                    <path d={incomePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" className="drop-shadow-lg" />
                    <path d={expensePath} fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" className="opacity-80" />

                    {/* Interactive Elements */}
                    {hoveredIndex !== null && (
                        <g>
                            <line 
                                x1={incomePoints[hoveredIndex][0]} 
                                y1={paddingY} 
                                x2={incomePoints[hoveredIndex][0]} 
                                y2={height - paddingY} 
                                stroke="currentColor" 
                                className="text-cad-text opacity-20"
                                strokeWidth="1"
                            />
                            {/* Income Point */}
                            <circle cx={incomePoints[hoveredIndex][0]} cy={incomePoints[hoveredIndex][1]} r="6" fill="#09090b" stroke="#10b981" strokeWidth="3" />
                            {/* Expense Point */}
                            <circle cx={expensePoints[hoveredIndex][0]} cy={expensePoints[hoveredIndex][1]} r="5" fill="#09090b" stroke="#f87171" strokeWidth="2" />
                            
                            {/* Tooltip Card */}
                            <foreignObject x={Math.min(width - 200, incomePoints[hoveredIndex][0] + 20)} y={paddingY} width="180" height="120">
                                <div className="bg-cad-panel/95 backdrop-blur-xl border border-cad-border p-4 rounded-xl shadow-2xl text-xs space-y-2">
                                    <p className="text-cad-muted font-bold uppercase tracking-wider mb-2">{activeData[hoveredIndex].label}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-cad-success font-bold">Income</span>
                                        <span className="text-cad-text font-mono">{format(activeData[hoveredIndex].income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-red-400 font-bold">Expense</span>
                                        <span className="text-cad-text font-mono">{format(activeData[hoveredIndex].expense)}</span>
                                    </div>
                                    <div className="border-t border-cad-border pt-2 flex justify-between items-center font-bold">
                                        <span className="text-cad-text">Net Profit</span>
                                        <span className={(activeData[hoveredIndex].income - activeData[hoveredIndex].expense) >= 0 ? 'text-cad-accent' : 'text-red-500'}>
                                            {format(activeData[hoveredIndex].income - activeData[hoveredIndex].expense)}
                                        </span>
                                    </div>
                                </div>
                            </foreignObject>
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
};

const SparklineCard = ({ title, value, subtext, data, colorClass, icon: Icon }: any) => {
    const points = data.map((d: number, i: number) => {
        const x = (i / (data.length - 1)) * 100;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const y = 100 - ((d - min) / (max - min)) * 80 - 10; // Normalize to 10-90% height
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-cad-muted text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-cad-text tracking-tight">{value}</h3>
                    <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${subtext.includes('+') ? 'text-cad-success' : 'text-cad-muted'}`}>
                        {subtext}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            
            {/* Sparkline SVG */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <polyline 
                        points={points} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        className={colorClass.text} 
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon 
                        points={`0,100 ${points} 100,100`} 
                        className={colorClass.text} 
                        fill="currentColor" 
                        fillOpacity="0.1" 
                    />
                </svg>
            </div>
        </div>
    );
};

export default function Finance() {
    const { format } = useCurrency();
    const [filterType, setFilterType] = useState<'All' | 'Credit' | 'Debit'>('All');

    const filteredTransactions = useMemo(() => {
        return MOCK_TRANSACTIONS.filter(tx => filterType === 'All' || tx.type === filterType);
    }, [filterType]);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 h-full overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
             {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-cad-text tracking-tight">Finance Dashboard</h2>
                    <p className="text-cad-muted mt-1">Track your income, expenses, and net profit in real-time.</p>
                </div>
                <button className="bg-cad-accent text-cad-dark px-6 py-2.5 rounded-xl font-bold hover:bg-sky-400 transition-all flex items-center gap-2 shadow-lg shadow-cad-accent/20 active:scale-95">
                    <Download className="w-5 h-5" /> Export Report
                </button>
            </div>

            {/* Smart Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SparklineCard
                    title="Total Balance"
                    value={format(42750)}
                    subtext="+12% from last month"
                    data={[12000, 12500, 11800, 13200, 14250]}
                    colorClass={{ bg: 'bg-green-500/10', text: 'text-green-500' }}
                    icon={Wallet}
                />
                <SparklineCard
                    title="Monthly Expenses"
                    value={format(7350)}
                    subtext="Software & Assets"
                    data={[800, 1200, 900, 2450]}
                    colorClass={{ bg: 'bg-red-500/10', text: 'text-red-500' }}
                    icon={CreditCard}
                />
                <SparklineCard
                    title="Pending Clearance"
                    value={format(2550)}
                    subtext="Available in 3 days"
                    data={[500, 800, 650, 850]}
                    colorClass={{ bg: 'bg-yellow-500/10', text: 'text-yellow-500' }}
                    icon={Clock}
                />
            </div>

            {/* Main Chart */}
            <FinancialChart />

            {/* Transactions & Recent Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction History */}
                <div className="lg:col-span-2 glass-panel rounded-2xl border border-cad-border overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-cad-border flex justify-between items-center bg-cad-surface/30">
                        <h3 className="text-lg font-bold text-cad-text">Recent Transactions</h3>
                        <div className="flex items-center gap-2 bg-cad-surface border border-cad-border rounded-lg px-2 py-1">
                            <Filter className="w-3.5 h-3.5 text-cad-muted" />
                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="bg-transparent text-xs font-bold text-cad-text outline-none cursor-pointer"
                            >
                                <option value="All">All</option>
                                <option value="Credit">Income</option>
                                <option value="Debit">Expense</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-cad-surface/50 text-[10px] uppercase text-cad-muted font-bold">
                                <tr>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cad-border">
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-cad-surface/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${tx.type === 'Credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {tx.type === 'Credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </div>
                                                <span className="text-cad-text font-bold text-sm">{tx.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-cad-muted text-xs font-mono">{tx.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                tx.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold font-mono text-sm ${tx.type === 'Credit' ? 'text-cad-success' : 'text-cad-text'}`}>
                                            {tx.type === 'Credit' ? '+' : ''}{format(Math.abs(tx.amount))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Expense Breakdown / Quick Actions */}
                <div className="space-y-6">
                    <div className="glass-panel rounded-2xl p-6 border border-cad-border relative overflow-hidden">
                        <h3 className="font-bold text-cad-text mb-6 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-cad-accent" /> Expense Breakdown
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-cad-muted mb-1">
                                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-purple-500"/> Platform Fees (CADLink)</span>
                                    <span>25%</span>
                                </div>
                                <div className="w-full h-2 bg-cad-surface rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[25%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-cad-muted mb-1">
                                    <span>Software Subscriptions</span>
                                    <span>45%</span>
                                </div>
                                <div className="w-full h-2 bg-cad-surface rounded-full overflow-hidden">
                                    <div className="h-full bg-cad-accent w-[45%] rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-cad-muted mb-1">
                                    <span>Asset Purchases</span>
                                    <span>30%</span>
                                </div>
                                <div className="w-full h-2 bg-cad-surface rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[30%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 border border-cad-border bg-gradient-to-br from-cad-panel to-cad-surface">
                        <h3 className="font-bold text-cad-text mb-4 text-sm uppercase tracking-wider">Quick Transfer</h3>
                        <div className="flex items-center gap-3 mb-6">
                            <img src="https://picsum.photos/200/200?random=99" className="w-10 h-10 rounded-full border border-cad-border" alt="Me" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-cad-text">Takudzwa Mupinga</p>
                                <p className="text-[10px] text-cad-muted">**** 4242</p>
                            </div>
                            <div className="text-right">
                                <p className="text-cad-success font-bold">R7,350</p>
                                <p className="text-[10px] text-cad-muted">Available</p>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-cad-text text-cad-dark rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm shadow-lg">
                            <DollarSign className="w-4 h-4" /> Transfer to Bank
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
