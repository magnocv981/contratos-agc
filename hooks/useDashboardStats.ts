import { useMemo } from 'react';
import { Client, Contract, ContractStatus, AccountsReceivable, AccountsReceivableStatus } from '../types';

export const useDashboardStats = (clients: Client[], contracts: Contract[], receivables: AccountsReceivable[]) => {
    return useMemo(() => {
        const currentYear = new Date().getFullYear();

        // Core Metrics
        const activeContractsCount = contracts.filter(c => c.status === ContractStatus.ACTIVE).length;
        const pendingContractsCount = contracts.filter(c => c.status === ContractStatus.PENDING).length;
        const totalValue = contracts.reduce((acc, c) => acc + (c.value || 0), 0);

        const annualValue = contracts
            .filter(c => new Date(c.startDate).getFullYear() === currentYear)
            .reduce((acc, c) => acc + (c.value || 0), 0);

        const elevatorsInstalled = contracts.reduce((acc, c) => acc + (c.elevatorInstalled || 0), 0);
        const elevatorsContracted = contracts.reduce((acc, c) => acc + (c.elevatorContracted || 0), 0);

        const platformsInstalled = contracts.reduce((acc, c) => acc + (c.platformInstalled || 0), 0);
        const platformsContracted = contracts.reduce((acc, c) => acc + (c.platformContracted || 0), 0);

        const totalInstalled = platformsInstalled + elevatorsInstalled;
        const totalContracted = platformsContracted + elevatorsContracted;

        // Date Helpers
        const getDiffDays = (d1: string | undefined, d2: string | undefined) => {
            if (!d1 || !d2) return null;
            const date1 = new Date(d1);
            const date2 = new Date(d2);
            if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return null;
            return Math.ceil(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
        };

        // 1. Média de Duração de Contratos (Início -> Fim)
        const contractDurations = contracts
            .map(c => getDiffDays(c.startDate, c.endDate))
            .filter((d): d is number => d !== null);
        const avgContractDuration = contractDurations.length > 0
            ? Math.round(contractDurations.reduce((a, b) => a + b, 0) / contractDurations.length)
            : 0;

        // 2. Tempo Médio de Instalação (Lead Time: Início -> Conclusão)
        const installationTimes = contracts
            .filter(c => c.status === ContractStatus.COMPLETED && c.warranty?.completionDate)
            .map(c => getDiffDays(c.startDate, c.warranty?.completionDate))
            .filter((d): d is number => d !== null);
        const avgInstallationTime = installationTimes.length > 0
            ? Math.round(installationTimes.reduce((a, b) => a + b, 0) / installationTimes.length)
            : 0;

        // 3. Ciclo de Recebimento (Emissão NF -> Pagamento)
        const paymentCycles = (receivables || [])
            .filter(r => r.status === AccountsReceivableStatus.RECEIVED && r.issueDate && r.paymentDate)
            .map(r => getDiffDays(r.issueDate, r.paymentDate))
            .filter((d): d is number => d !== null);
        const avgPaymentCycle = paymentCycles.length > 0
            ? Math.round(paymentCycles.reduce((a, b) => a + b, 0) / paymentCycles.length)
            : 0;

        // 4. Índice de Recebimento (Saúde Financeira)
        const totalReceivables = (receivables || []).length;
        const receivedCount = (receivables || []).filter(r => r.status === AccountsReceivableStatus.RECEIVED).length;
        const financialHealthRate = totalReceivables > 0 ? (receivedCount / totalReceivables) * 100 : 0;

        // Existing Strategic Insights
        const installationRate = totalContracted > 0 ? (totalInstalled / totalContracted) * 100 : 0;

        const approachingDeadlines = contracts.filter(c => {
            if (c.status === ContractStatus.CLOSED || c.status === ContractStatus.COMPLETED) return false;
            if (!c.estimatedInstallationDate) return false;
            const deadline = new Date(c.estimatedInstallationDate);
            const today = new Date();
            const diffTime = deadline.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 15 && diffDays >= 0;
        });

        const criticalContracts = approachingDeadlines.length;
        const growthRate = totalValue > annualValue && annualValue > 0 ? ((totalValue - annualValue) / annualValue) * 100 : 0;

        const insights = [
            {
                title: 'Duração Média Contratos',
                value: `${avgContractDuration} dias`,
                description: 'Intervalo médio entre a assinatura e a validade final estipulada.',
                status: 'info',
                icon: '📅'
            },
            {
                title: 'Lead Time Instalação',
                value: `${avgInstallationTime} dias`,
                description: avgInstallationTime > 60 ? 'Tempo de entrega elevado. Analise a disponibilidade de estoque.' : 'Entrega ágil das unidades contratadas.',
                status: avgInstallationTime > 60 ? 'warning' : 'success',
                icon: '🏗️'
            },
            {
                title: 'Ciclo de Pagamento',
                value: `${avgPaymentCycle} dias`,
                description: 'Tempo médio entre faturar (NF) e o dinheiro entrar em conta.',
                status: avgPaymentCycle > 35 ? 'warning' : 'success',
                icon: '💸'
            },
            {
                title: 'Saúde Financeira',
                value: `${financialHealthRate.toFixed(1)}%`,
                description: 'Percentual de títulos já liquidados/recebidos.',
                status: financialHealthRate < 70 ? 'danger' : 'success',
                icon: '🏦'
            },
            {
                title: 'Eficiência de Entrega',
                value: `${installationRate.toFixed(1)}%`,
                description: installationRate < 50 ? 'Ritmo de instalação abaixo da meta. Considere reforçar a equipe técnica.' : 'Excelente ritmo de conclusão. Pipeline saudável.',
                status: installationRate < 50 ? 'warning' : 'success',
                icon: '⚙️'
            },
            {
                title: 'Risco Operacional',
                value: criticalContracts > 0 ? 'Atenção' : 'Baixo',
                description: criticalContracts > 0 ? `${criticalContracts} contratos com prazos críticos. Risco de multa contratual.` : 'Sem gargalos de prazo detectados para os próximos 15 dias.',
                status: criticalContracts > 0 ? 'danger' : 'success',
                icon: '🚨'
            }
        ];

        return {
            activeContractsCount,
            pendingContractsCount,
            totalValue,
            annualValue,
            elevatorsInstalled,
            elevatorsContracted,
            platformsInstalled,
            platformsContracted,
            totalInstalled,
            totalContracted,
            installationRate,
            approachingDeadlines,
            criticalContracts,
            growthRate,
            insights,
            currentYear
        };
    }, [clients, contracts, receivables]);
};
