import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Booking, User, JournalEntry, CommissionModel } from '@/types';
import { CommissionCalculationType } from '@/types';
import { CurrencyTomanIcon } from '@/components/icons/CurrencyTomanIcon';
import { TicketIcon } from '@/components/icons/TicketIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { ChartBarIcon } from '@/components/icons/ChartBarIcon';

declare var Chart: any;

interface DashboardStatsProps {
    bookings: Booking[];
    users: User[];
    journalEntries: JournalEntry[];
    commissionModels: CommissionModel[];
    adminStats?: {
        totalUsers: number;
        totalBookings: number;
        totalRevenue: number;
        totalIncome: number;
        netProfit: number;
        totalExpenses: number;
        upcomingFlights: number;
        activeFlights: number;
        pendingTickets: number;
    };
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-lg shadow border flex items-center">
        <div className={`text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
        </div>
        <div className="mr-4">
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode; filter?: React.ReactNode }> = ({ title, children, filter }) => (
    <div className="bg-white p-5 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {filter}
        </div>
        {children}
    </div>
);

const TimeRangeButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
     <button onClick={onClick} className={`px-3 py-1 text-xs font-medium rounded-full ${isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
        {label}
    </button>
)

export const DashboardStats: React.FC<DashboardStatsProps> = ({ bookings, users, journalEntries, commissionModels, adminStats }) => {
    const [timeRange, setTimeRange] = useState('30d');

    const profitableRoutesChartRef = useRef<HTMLCanvasElement>(null);
    const popularRoutesChartRef = useRef<HTMLCanvasElement>(null);
    const airlineRevenueChartRef = useRef<HTMLCanvasElement>(null);
    const userGrowthChartRef = useRef<HTMLCanvasElement>(null);

    // Add null checks
    const safeBookings = bookings || [];
    const safeUsers = users || [];
    const safeJournalEntries = journalEntries || [];
    const safeCommissionModels = commissionModels || [];

    const kpiData = useMemo(() => {
        // Use adminStats if available, otherwise calculate from local data
        if (adminStats) {
            return {
                totalRevenue: adminStats.totalRevenue,
                totalIncome: adminStats.totalIncome,
                netProfit: adminStats.netProfit,
                totalExpenses: adminStats.totalExpenses,
                totalBookingsCount: adminStats.totalBookings,
                totalUsers: adminStats.totalUsers,
                avgBookingValue: adminStats.totalBookings > 0 ? adminStats.totalRevenue / adminStats.totalBookings : 0
            };
        }
        
        // Fallback to local calculation
        const confirmedBookings = safeBookings.filter(b => b.status === 'CONFIRMED');
        const totalRevenue = confirmedBookings.reduce((sum, booking) => {
            // Safe check for passengers
            const passengers = booking.passengers || { adults: [], children: [], infants: [] };
            const totalPassengers = (passengers.adults?.length || 0) + (passengers.children?.length || 0) + (passengers.infants?.length || 0);
            const flight = booking.flight || { price: 0, taxes: 0 };
            const flightPrice = (flight.price || 0) + (flight.taxes || 0);
            return sum + (flightPrice * totalPassengers);
        }, 0);
        
        const netProfit = safeJournalEntries.reduce((sum, entry) => {
            const transactions = entry.transactions || [];
            const profitTx = transactions.find(t => t.accountId === '4012'); // Web Service Commission Revenue
            return sum + (profitTx ? (profitTx.credit || 0) - (profitTx.debit || 0) : 0);
        }, 0);

        const totalBookingsCount = confirmedBookings.length;
        const avgBookingValue = totalBookingsCount > 0 ? totalRevenue / totalBookingsCount : 0;

        return { 
            totalRevenue, 
            totalIncome: totalRevenue, // Fallback
            netProfit, 
            totalExpenses: totalRevenue - netProfit, // Fallback
            totalBookingsCount, 
            totalUsers: users.length,
            avgBookingValue 
        };
    }, [safeBookings, safeJournalEntries, users, adminStats]);

    const routePerformance = useMemo(() => {
        const routeProfit: Record<string, number> = {};
        const routePopularity: Record<string, number> = {};
        
        const confirmedBookings = safeBookings.filter(b => b.status === 'CONFIRMED');
        confirmedBookings.forEach(booking => {
            const flight = booking.flight || { departure: { city: 'Unknown' }, arrival: { city: 'Unknown' }, price: 0 };
            const route = `${flight.departure?.city || 'Unknown'} - ${flight.arrival?.city || 'Unknown'}`;
            const passengers = booking.passengers || { adults: [], children: [], infants: [] };
            const totalPassengers = (passengers.adults?.length || 0) + (passengers.children?.length || 0) + (passengers.infants?.length || 0);
            const basePriceTotal = (flight.price || 0) * totalPassengers;
            
            let profit = 0;
            const model = safeCommissionModels.find(m => m.id === flight.commissionModelId);
            if (model) {
                if (model.calculationType === CommissionCalculationType.Percentage) {
                    profit = basePriceTotal * (model.webServiceCommission / 100);
                } else if (model.calculationType === CommissionCalculationType.FixedAmount) {
                    profit = model.webServiceCommission * totalPassengers;
                }
            }

            routeProfit[route] = (routeProfit[route] || 0) + profit;
            routePopularity[route] = (routePopularity[route] || 0) + totalPassengers;
        });

        const sortedProfitableRoutes = Object.entries(routeProfit)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const sortedPopularRoutes = Object.entries(routePopularity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return { sortedProfitableRoutes, sortedPopularRoutes };
    }, [safeBookings, safeCommissionModels]);
    
    const airlineRevenue = useMemo(() => {
        const revenueByAirline: Record<string, number> = {};
        const confirmedBookings = safeBookings.filter(b => b.status === 'CONFIRMED');

        confirmedBookings.forEach(booking => {
            const passengers = booking.passengers || { adults: [], children: [], infants: [] };
            const totalPassengers = (passengers.adults?.length || 0) + (passengers.children?.length || 0) + (passengers.infants?.length || 0);
            const flight = booking.flight || { price: 0, taxes: 0, airline: 'Unknown' };
            const revenue = ((flight.price || 0) + (flight.taxes || 0)) * totalPassengers;
            const airline = flight.airline || 'Unknown';
            revenueByAirline[airline] = (revenueByAirline[airline] || 0) + revenue;
        });

        return Object.entries(revenueByAirline).sort(([, a], [, b]) => b - a).slice(0, 5);
    }, [safeBookings]);

    const userGrowth = useMemo(() => {
        const now = new Date();
        const dates: string[] = [];
        const counts: number[] = [];

        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
            dates.push(dateStr);
            
            const usersUpToDate = safeUsers.filter(u => u.createdAt && new Date(u.createdAt) <= d).length;
            counts.push(usersUpToDate);
        }
        return { dates, counts };
    }, [safeUsers]);

    useEffect(() => {
        const charts: any[] = [];
        if (typeof Chart === 'undefined') return;

        const createChart = (ref: React.RefObject<HTMLCanvasElement>, config: any) => {
            if (ref.current) {
                const chart = new Chart(ref.current, config);
                charts.push(chart);
            }
        };
        
        if (userGrowthChartRef.current) {
            createChart(userGrowthChartRef, {
                type: 'line',
                data: {
                    labels: userGrowth.dates,
                    datasets: [{
                        label: 'تعداد کل کاربران',
                        data: userGrowth.counts,
                        borderColor: '#336699',
                        tension: 0.1,
                        fill: true,
                        backgroundColor: 'rgba(51, 102, 153, 0.2)',
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        if (profitableRoutesChartRef.current) {
             createChart(profitableRoutesChartRef, {
                type: 'bar',
                data: {
                    labels: routePerformance.sortedProfitableRoutes.map(([route]) => route),
                    datasets: [{
                        label: 'سود خالص (تومان)',
                        data: routePerformance.sortedProfitableRoutes.map(([, profit]) => profit),
                        backgroundColor: 'rgba(0, 51, 102, 0.6)',
                        borderColor: '#003366',
                        borderWidth: 1
                    }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
            });
        }
        
        if (popularRoutesChartRef.current) {
             createChart(popularRoutesChartRef, {
                type: 'bar',
                data: {
                    labels: routePerformance.sortedPopularRoutes.map(([route]) => route),
                    datasets: [{
                        label: 'تعداد مسافران',
                        data: routePerformance.sortedPopularRoutes.map(([, count]) => count),
                        backgroundColor: 'rgba(51, 102, 153, 0.6)',
                        borderColor: '#336699',
                        borderWidth: 1
                    }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
            });
        }
        
        if (airlineRevenueChartRef.current) {
            createChart(airlineRevenueChartRef, {
                type: 'doughnut',
                data: {
                    labels: airlineRevenue.map(([name]) => name),
                    datasets: [{
                        label: 'درآمد',
                        data: airlineRevenue.map(([, revenue]) => revenue),
                        backgroundColor: ['#003366', '#336699', '#8FA9C9', '#B0B8D8', '#29527A'],
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        return () => {
            charts.forEach(chart => chart.destroy());
        };
    }, [routePerformance, userGrowth, airlineRevenue, timeRange]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="مجموع درآمد" 
                    value={`${kpiData.totalIncome.toLocaleString('fa-IR')} تومان`} 
                    icon={<CurrencyTomanIcon className="w-6 h-6" />}
                    color="bg-green-500"
                />
                <StatCard 
                    title="سود خالص" 
                    value={`${kpiData.netProfit.toLocaleString('fa-IR')} تومان`} 
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    color="bg-blue-500"
                />
                <StatCard 
                    title="مجموع هزینه‌ها" 
                    value={`${kpiData.totalExpenses.toLocaleString('fa-IR')} تومان`} 
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    color="bg-red-500"
                />
                <StatCard 
                    title="تعداد رزروها" 
                    value={kpiData.totalBookingsCount.toLocaleString('fa-IR')} 
                    icon={<TicketIcon className="w-6 h-6" />}
                    color="bg-sky-500"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="تعداد کاربران" 
                    value={kpiData.totalUsers.toLocaleString('fa-IR')} 
                    icon={<UsersIcon className="w-6 h-6" />}
                    color="bg-amber-500"
                />
                <StatCard 
                    title="میانگین ارزش رزرو" 
                    value={`${kpiData.avgBookingValue.toLocaleString('fa-IR')} تومان`} 
                    icon={<CurrencyTomanIcon className="w-6 h-6" />}
                    color="bg-purple-500"
                />
                <StatCard 
                    title="درآمد از رزروها" 
                    value={`${kpiData.totalRevenue.toLocaleString('fa-IR')} تومان`} 
                    icon={<CurrencyTomanIcon className="w-6 h-6" />}
                    color="bg-emerald-500"
                />
                <StatCard 
                    title="نرخ سودآوری" 
                    value={`${kpiData.totalIncome > 0 ? ((kpiData.netProfit / kpiData.totalIncome) * 100).toFixed(1) : 0}%`} 
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    color="bg-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="مسیرهای سودآور">
                    <div className="h-80"><canvas ref={profitableRoutesChartRef}></canvas></div>
                </ChartContainer>
                <ChartContainer title="مسیرهای محبوب">
                    <div className="h-80"><canvas ref={popularRoutesChartRef}></canvas></div>
                </ChartContainer>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartContainer title="رشد کاربران (30 روز گذشته)">
                        <div className="h-80"><canvas ref={userGrowthChartRef}></canvas></div>
                    </ChartContainer>
                </div>
                <ChartContainer title="سهم درآمدی ایرلاین‌ها">
                    <div className="h-80"><canvas ref={airlineRevenueChartRef}></canvas></div>
                </ChartContainer>
            </div>
        </div>
    );
};