import { useMemo } from 'react';
import { Client, Contract, ContractStatus } from '../types';

export const useDashboardStats = (clients: Client[], contracts: Contract[]) => {
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

        // Strategic Insights
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
            },
            {
                title: 'Potencial de Expansão',
                value: `${growthRate.toFixed(1)}%`,
                description: 'Crescimento do portfólio em relação ao faturamento base anual.',
                status: 'info',
                icon: '🚀'
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
    }, [clients, contracts]);
};
