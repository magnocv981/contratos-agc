import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Client, Contract, AccountsReceivable, AccountsReceivableStatus } from '../types';

export const ReportService = {
    /**
     * Generates a detailed PDF report for a specific client and their contracts.
     */
    generateClientFicha: (client: Client, contracts: Contract[]) => {
        try {
            const doc = new jsPDF();
            const clientContracts = (contracts || []).filter(c => c.clientId === client.id);
            const totalValue = clientContracts.reduce((acc, c) => acc + (c.value || 0), 0);

            // Header Branding
            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // indigo-600
            doc.text('Ficha Cadastral do Cliente', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(140);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
            doc.setDrawColor(226, 232, 240);
            doc.line(14, 35, 196, 35);

            // Client Data Section
            doc.setFontSize(14);
            doc.setTextColor(30);
            doc.text('Dados da Instituição/Órgão', 14, 45);

            const clientInfoRows = [
                ['Nome:', client.name || '-'],
                ['CNPJ:', client.cnpj || '-'],
                ['Contatos:', client.contactPerson || '-'],
                ['E-mail:', client.email || '-'],
                ['Telefone:', client.phone || '-'],
                ['WhatsApp:', client.whatsapp || '-'],
                ['Endereço:', `${client.address?.street || ''}, ${client.address?.number || ''} - ${client.address?.neighborhood || ''}`],
                ['Localidade:', `${client.address?.city || ''} / ${client.address?.state || ''} - CEP: ${client.address?.cep || ''}`],
            ];

            autoTable(doc, {
                startY: 50,
                body: clientInfoRows,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, textColor: [71, 85, 105] } }
            });

            // Contracts List
            const lastY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text('Histórico de Contratos', 14, lastY);

            const contractHeaders = [['Título do Contrato', 'Status', 'Início', 'Vencimento', 'Garantia', 'Valor (R$)']];
            const contractData = clientContracts.map(c => {
                let warrantyEnd = '-';
                if (c.warranty?.completionDate) {
                    const comp = new Date(c.warranty.completionDate);
                    const end = new Date(comp.getTime() + (c.warranty.warrantyDays * 24 * 60 * 60 * 1000));
                    warrantyEnd = end.toLocaleDateString('pt-BR');
                }

                return [
                    c.title || 'Contrato sem título',
                    c.status || 'N/D',
                    c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '-',
                    c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '-',
                    warrantyEnd,
                    (c.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                ];
            });

            autoTable(doc, {
                startY: lastY + 5,
                head: contractHeaders,
                body: contractData,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
                styles: { fontSize: 8 }, // Slightly smaller font to fit more columns
                columnStyles: {
                    0: { cellWidth: 60 }, // Contract title
                    1: { cellWidth: 30 }, // Status
                    2: { cellWidth: 22 }, // Start
                    3: { cellWidth: 22 }, // End
                    4: { cellWidth: 22 }, // Warranty
                    5: { halign: 'right' } // Value
                }
            });

            // Financial Summary
            const summaryY = (doc as any).lastAutoTable.finalY + 12;
            doc.setFontSize(12);
            doc.setTextColor(30);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total de Contratos Localizados: ${clientContracts.length}`, 14, summaryY);
            doc.text(`Investimento Global Acumulado: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, summaryY + 8);

            doc.save(`Ficha_${(client.name || 'Cliente').replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Falha na geração do PDF (Ficha):', error);
            alert('Não foi possível gerar a Ficha Cadastral. Verifique os dados do cliente.');
        }
    },

    /**
     * Generates a PDF report for sales volume by year.
     */
    generateSalesByYear: (contracts: Contract[]) => {
        try {
            const doc = new jsPDF();
            const stats: Record<string, { plat: number, elev: number, val: number }> = {};

            (contracts || []).forEach(c => {
                const year = c.startDate ? new Date(c.startDate).getFullYear().toString() : 'Indefinido';
                if (!stats[year]) stats[year] = { plat: 0, elev: 0, val: 0 };
                stats[year].plat += (c.platformContracted || 0);
                stats[year].elev += (c.elevatorContracted || 0);
                stats[year].val += (c.value || 0);
            });

            const years = Object.keys(stats).sort((a, b) => b.localeCompare(a));

            doc.setFontSize(20);
            doc.setTextColor(51, 65, 85);
            doc.text('Relatório Consolidado: Vendas por Ano', 14, 22);

            const tableData = years.map(yr => [
                yr,
                stats[yr].plat,
                stats[yr].elev,
                `R$ ${stats[yr].val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ]);

            autoTable(doc, {
                startY: 35,
                head: [['Exercício (Ano)', 'Plataformas', 'Elevadores', 'Volume Financeiro']],
                body: tableData,
                headStyles: { fillColor: [79, 70, 229] },
                alternateRowStyles: { fillColor: [248, 250, 252] }
            });

            doc.save('Relatorio_Vendas_Anual.pdf');
        } catch (error) {
            console.error('Erro (Vendas por Ano):', error);
            alert('Ocorreu um erro ao processar o relatório de vendas anual.');
        }
    },

    /**
     * Generates a PDF report for sales volume by Brazilian state.
     */
    generateSalesByState: (contracts: Contract[], clients: Client[]) => {
        try {
            const doc = new jsPDF();
            const stats: Record<string, { plat: number, elev: number }> = {};
            const safeClients = clients || [];

            (contracts || []).forEach(c => {
                const client = safeClients.find(cl => cl.id === c.clientId);
                const state = client?.address?.state || 'Não Informado';
                if (!stats[state]) stats[state] = { plat: 0, elev: 0 };
                stats[state].plat += (c.platformContracted || 0);
                stats[state].elev += (c.elevatorContracted || 0);
            });

            const statesSorted = Object.keys(stats).sort();

            doc.setFontSize(20);
            doc.text('Distribuição Regional de Vendas (Estados)', 14, 22);

            const tableData = statesSorted.map(st => [
                st,
                stats[st].plat,
                stats[st].elev,
                stats[st].plat + stats[st].elev
            ]);

            autoTable(doc, {
                startY: 35,
                head: [['Unidade Federativa (UF)', 'Plataformas', 'Elevadores', 'Total de Unidades']],
                body: tableData,
                headStyles: { fillColor: [16, 185, 129] }
            });

            doc.save('Relatorio_Vendas_Estados.pdf');
        } catch (error) {
            console.error('Erro (Vendas por Estado):', error);
            alert('Infelizmente não conseguimos gerar o relatório regional agora.');
        }
    },

    /**
     * Generates a PDF listing all contracts currently under equipment warranty.
     */
    generateWarrantyReport: (contracts: Contract[], clients: Client[]) => {
        try {
            const doc = new jsPDF();
            const now = new Date();
            const safeClients = clients || [];

            const activeWarranties = (contracts || []).filter(c => {
                if (!c.warranty?.completionDate) return false;
                const completion = new Date(c.warranty.completionDate);
                if (isNaN(completion.getTime())) return false;
                const expiry = new Date(completion);
                expiry.setDate(expiry.getDate() + (c.warranty.warrantyDays || 0));
                return expiry > now;
            });

            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // indigo-600
            doc.text('Relatório de Garantias Ativas', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(140);
            doc.text(`Posição em: ${now.toLocaleDateString('pt-BR')}`, 14, 30);
            doc.setDrawColor(226, 232, 240);
            doc.line(14, 35, 196, 35);

            const tableData = activeWarranties.map(c => {
                const client = safeClients.find(cl => cl.id === c.clientId);
                const completion = new Date(c.warranty!.completionDate);
                const expiry = new Date(completion);
                expiry.setDate(expiry.getDate() + (c.warranty!.warrantyDays || 0));
                const remaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                return [
                    client?.name || 'Cliente N/D',
                    c.title || 'Contrato s/ Título',
                    completion.toLocaleDateString('pt-BR'),
                    expiry.toLocaleDateString('pt-BR'),
                    `${remaining} dias`
                ];
            });

            autoTable(doc, {
                startY: 40,
                head: [['Cliente/Instituição', 'Contrato', 'Instalação', 'Vencimento', 'Saldo']],
                body: tableData,
                headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 55 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 25 },
                    4: { halign: 'center' }
                }
            });

            if (activeWarranties.length === 0) {
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text('Nenhum equipamento possui garantia ativa no momento.', 14, 50);
            }

            doc.save(`Garantias_Ativas_${now.toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Erro (Relatório Garantia):', error);
            alert('Erro ao gerar lista de garantias. Verifique os dados de instalação.');
        }
    },

    /**
     * Generates a PDF report for Accounts Receivable.
     */
    generateAccountsReceivableReport: (receivables: AccountsReceivable[], contracts: Contract[]) => {
        try {
            const doc = new jsPDF();
            const now = new Date();

            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // indigo-600
            doc.text('Relatório de Contas a Receber', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(140);
            doc.text(`Gerado em: ${now.toLocaleString('pt-BR')}`, 14, 30);
            doc.setDrawColor(226, 232, 240);
            doc.line(14, 35, 196, 35);

            // Grouping
            const received = receivables.filter(r => r.status === AccountsReceivableStatus.RECEIVED);
            const pending = receivables.filter(r => r.status === AccountsReceivableStatus.PENDING);

            const calculateTotal = (items: AccountsReceivable[]) => {
                return items.reduce((acc, current) => {
                    const contract = contracts.find(c => c.id === current.contractId);
                    return acc + (contract?.value || 0);
                }, 0);
            };

            const totalReceivedValue = calculateTotal(received);
            const totalPendingValue = calculateTotal(pending);

            // Pending Table
            doc.setFontSize(14);
            doc.setTextColor(30);
            doc.text('Contratos a Receber (Pendentes)', 14, 45);

            const pendingData = pending.map(r => {
                const contract = contracts.find(c => c.id === r.contractId);
                return [
                    r.clientName || 'N/D',
                    r.contractTitle || 'N/D',
                    r.invoiceNumber || '---',
                    r.dueDate ? new Date(r.dueDate).toLocaleDateString('pt-BR') : '---',
                    `R$ ${(contract?.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                ];
            });

            autoTable(doc, {
                startY: 50,
                head: [['Cliente', 'Contrato', 'NF', 'Vencimento', 'Valor']],
                body: pendingData,
                theme: 'striped',
                headStyles: { fillColor: [245, 158, 11] }, // amber-500
                styles: { fontSize: 8 },
                columnStyles: { 4: { halign: 'right' } }
            });

            let currentY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(11);
            doc.text(`Subtotal a Receber: R$ ${totalPendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 140, currentY, { align: 'right' });

            // Received Table
            currentY += 15;
            doc.setFontSize(14);
            doc.text('Contratos Recebidos', 14, currentY);

            const receivedData = received.map(r => {
                const contract = contracts.find(c => c.id === r.contractId);
                return [
                    r.clientName || 'N/D',
                    r.contractTitle || 'N/D',
                    r.invoiceNumber || '---',
                    r.issueDate ? new Date(r.issueDate).toLocaleDateString('pt-BR') : '---',
                    `R$ ${(contract?.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                ];
            });

            autoTable(doc, {
                startY: currentY + 5,
                head: [['Cliente', 'Contrato', 'NF', 'Emissão', 'Valor']],
                body: receivedData,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] }, // emerald-500
                styles: { fontSize: 8 },
                columnStyles: { 4: { halign: 'right' } }
            });

            currentY = (doc as any).lastAutoTable.finalY + 10;
            doc.text(`Subtotal Recebido: R$ ${totalReceivedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 140, currentY, { align: 'right' });

            // Summary
            currentY += 15;
            doc.setDrawColor(226, 232, 240);
            doc.line(14, currentY, 196, currentY);
            currentY += 10;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Geral Consolidado: R$ ${(totalReceivedValue + totalPendingValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 196, currentY, { align: 'right' });

            doc.save(`Relatorio_Contas_Receber_${now.toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Erro (Relatório AR):', error);
            alert('Erro ao gerar relatório de contas a receber.');
        }
    }
};
