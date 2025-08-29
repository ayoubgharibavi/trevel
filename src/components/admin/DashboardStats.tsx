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

export const DashboardStats: React.FC<DashboardStatsProps> = ({ bookings, users, journalEntries, commissionModels }) => {
    const [timeRange, setTimeRange] = useState('30d');

    const profitableRoutesChartRef = useRef<HTMLCanvasElement>(null);
    const popularRoutesChartRef = useRef<HTMLCanvasElement>(null);
    const airlineRevenueChartRef = useRef<HTMLCanvasElement>(null);
    const userGrowthChartRef = useRef<HTMLCanvasElement>(null);

    const kpiData = useMemo(() => {
        const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
        const totalRevenue = confirmedBookings.reduce((sum, booking) => {
            const totalPassengers = booking.passengers.adults.length + booking.passengers.children.length + booking.passengers.infants.length;
            const flightPrice = booking.flight.price + booking.flight.taxes;
            return sum + (flightPrice * totalPassengers);
        }, 0);
        
        const netProfit = journalEntries.reduce((sum, entry) => {
            const profitTx = entry.transactions.find(t => t.accountId === '4012'); // Web Service Commission Revenue
            return sum + (profitTx ? profitTx.credit - profitTx.debit : 0);
        }, 0);

        const totalBookingsCount = confirmedBookings.length;
        const avgBookingValue = totalBookingsCount > 0 ? totalRevenue / totalBookingsCount : 0;

        return { totalRevenue, netProfit, totalBookingsCount, avgBookingValue };
    }, [bookings, journalEntries]);

    const routePerformance = useMemo(() => {
        const routeProfit: Record<string, number> = {};
        const routePopularity: Record<string, number> = {};
        
        const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
        confirmedBookings.forEach(booking => {
            const route = `${booking.flight.departure.city} - ${booking.flight.arrival.city}`;
            const totalPassengers = booking.passengers.adults.length + booking.passengers.children.length + booking.passengers.infants.length;
            const basePriceTotal = booking.flight.price * totalPassengers;
            
            let profit = 0;
            const model = commissionModels.find(m => m.id === booking.flight.commissionModelId);
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
    }, [bookings, commissionModels]);
    
    const airlineRevenue = useMemo(() => {
        const revenueByAirline: Record<string, number> = {};
        const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');

        confirmedBookings.forEach(booking => {
            const totalPassengers = booking.passengers.adults.length + booking.passengers.children.length + booking.passengers.infants.length;
            const revenue = (booking.flight.price + booking.flight.taxes) * totalPassengers;
            revenueByAirline[booking.flight.airline] = (revenueByAirline[booking.flight.airline] || 0) + revenue;
        });

        return Object.entries(revenueByAirline).sort(([, a], [, b]) => b - a).slice(0, 5);
    }, [bookings]);

    const userGrowth = useMemo(() => {
        const now = new Date();
        const dates: string[] = [];
        const counts: number[] = [];

        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
            dates.push(dateStr);
            
            const usersUpToDate = users.filter(u => new Date(u.createdAt) <= d).length;
            counts.push(usersUpToDate);
        }
        return { dates, counts };
    }, [users]);

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
                    value={`${kpiData.totalRevenue.toLocaleString('fa-IR')} تومان`} 
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
                    title="تعداد رزروها" 
                    value={kpiData.totalBookingsCount.toLocaleString('fa-IR')} 
                    icon={<TicketIcon className="w-6 h-6" />}
                    color="bg-sky-500"
                />
                <StatCard 
                    title="تعداد کاربران" 
                    value={users.length.toLocaleString('fa-IR')} 
                    icon={<UsersIcon className="w-6 h-6" />}
                    color="bg-amber-500"
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