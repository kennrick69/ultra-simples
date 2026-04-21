// ==================== PDF GENERATOR COM jsPDF ====================

// Importar jsPDF via CDN (já incluído no HTML)

// ==================== GERAR PDF DO PLANO DE TRATAMENTO ====================
function gerarPDFPlanoTratamento(plano, user) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // ===== HEADER =====
    doc.setFillColor(4, 120, 87); // Verde
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo (emoji)
    doc.setFontSize(30);
    doc.text('🦷', margin, 25);
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PLANO DE TRATAMENTO ODONTOLÓGICO', margin + 15, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(user.clinic, margin + 15, 25);
    doc.text(`${user.name} - CRO: ${user.cro}`, margin + 15, 30);
    
    yPos = 45;
    doc.setTextColor(0, 0, 0);
    
    // ===== INFORMAÇÕES DO DOCUMENTO =====
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    const numPlano = `PT-${Date.now()}`;
    doc.text(`Nº do Plano: ${numPlano}`, pageWidth - margin - 50, yPos);
    doc.text(`Data: ${dataHoje}`, pageWidth - margin - 50, yPos + 5);
    
    yPos += 15;
    
    // ===== DADOS DO PACIENTE =====
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPos, contentWidth, 25, 'F');
    
    yPos += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DADOS DO PACIENTE', margin + 3, yPos);
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${plano.paciente.nome}`, margin + 3, yPos);
    yPos += 5;
    doc.text(`CPF: ${plano.paciente.cpf}     Telefone: ${plano.paciente.telefone}`, margin + 3, yPos);
    
    yPos += 12;
    
    // ===== DIAGNÓSTICO =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNÓSTICO', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const diagnosticoLines = doc.splitTextToSize(plano.diagnostico, contentWidth);
    doc.text(diagnosticoLines, margin, yPos);
    yPos += diagnosticoLines.length * 5 + 5;
    
    // ===== OBJETIVO =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBJETIVO DO TRATAMENTO', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const objetivoLines = doc.splitTextToSize(plano.objetivo, contentWidth);
    doc.text(objetivoLines, margin, yPos);
    yPos += objetivoLines.length * 5 + 8;
    
    // Verificar se precisa de nova página
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }
    
    // ===== ETAPAS DO TRATAMENTO =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ETAPAS DO TRATAMENTO', margin, yPos);
    yPos += 8;
    
    // Tabela de etapas
    doc.autoTable({
        startY: yPos,
        head: [['Etapa', 'Procedimento', 'Elemento(s)', 'Previsão', 'Valor']],
        body: plano.etapas.map(e => [
            e.numero,
            e.procedimento,
            e.elemento || '-',
            e.dataPrevisao ? new Date(e.dataPrevisao).toLocaleDateString('pt-BR') : '-',
            formatCurrency(e.valor)
        ]),
        foot: [['', '', '', 'VALOR TOTAL:', formatCurrency(plano.valorTotal)]],
        theme: 'grid',
        headStyles: { fillColor: [4, 120, 87], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [249, 250, 251], textColor: 0, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // ===== FORMA DE PAGAMENTO =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMA DE PAGAMENTO', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const pagamentoTexto = plano.formaPagamento === 'vista' 
        ? 'À Vista' 
        : `Parcelado em ${plano.numParcelas}x de ${formatCurrency(plano.valorTotal / plano.numParcelas)}`;
    doc.text(pagamentoTexto, margin, yPos);
    yPos += 10;
    
    // ===== OBSERVAÇÕES =====
    if (plano.observacoes) {
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVAÇÕES', margin, yPos);
        yPos += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const obsLines = doc.splitTextToSize(plano.observacoes, contentWidth);
        doc.text(obsLines, margin, yPos);
        yPos += obsLines.length * 5 + 10;
    }
    
    // ===== ASSINATURAS =====
    if (yPos > 220) {
        doc.addPage();
        yPos = 20;
    }
    
    yPos = Math.max(yPos, 240); // Posicionar no final da página
    
    // Linha de assinatura - Dentista
    doc.line(margin, yPos, margin + 70, yPos);
    doc.setFontSize(9);
    doc.text(user.name, margin + 5, yPos + 5);
    doc.text('Cirurgião-Dentista', margin + 5, yPos + 9);
    doc.text(`CRO: ${user.cro}`, margin + 5, yPos + 13);
    
    // Linha de assinatura - Paciente
    doc.line(pageWidth - margin - 70, yPos, pageWidth - margin, yPos);
    doc.text(plano.paciente.nome, pageWidth - margin - 65, yPos + 5);
    doc.text('Paciente', pageWidth - margin - 65, yPos + 9);
    doc.text(`CPF: ${plano.paciente.cpf}`, pageWidth - margin - 65, yPos + 13);
    
    // ===== FOOTER =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Página ${i} de ${pageCount} | ${user.clinic} | ${dataHoje}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }
    
    // Salvar PDF
    const nomeArquivo = `Plano_Tratamento_${plano.paciente.nome.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    doc.save(nomeArquivo);
}

// ==================== GERAR PDF DE NOTA FISCAL ====================
function gerarPDFNotaFiscal(nota, user) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // ===== HEADER =====
    doc.setFillColor(4, 120, 87);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setFontSize(30);
    doc.text('📄', margin, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MODELO DE NOTA FISCAL', margin + 15, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(user.clinic, margin + 15, 25);
    doc.text(`${user.name} - CRO: ${user.cro}`, margin + 15, 30);
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);
    
    // ===== ALERTA IMPORTANTE =====
    doc.setFillColor(255, 243, 205);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 25, 'FD');
    
    yPos += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('⚠️ IMPORTANTE', margin + 3, yPos);
    
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text('Este é um MODELO para emissão da nota fiscal no sistema da sua prefeitura.', margin + 3, yPos);
    yPos += 4;
    doc.text('A descrição abaixo deve ser copiada EXATAMENTE como está para a nota fiscal oficial.', margin + 3, yPos);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    
    // ===== DESCRIÇÃO DO SERVIÇO =====
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(4, 120, 87);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 60, 'FD');
    
    yPos += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text('DESCRIÇÃO PARA A NOTA FISCAL:', margin + 3, yPos);
    
    yPos += 8;
    doc.setFillColor(255, 255, 255);
    doc.rect(margin + 3, yPos, pageWidth - (margin * 2) - 6, 40, 'F');
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const descricaoLines = doc.splitTextToSize(nota.descricao, pageWidth - (margin * 2) - 12);
    doc.text(descricaoLines, margin + 6, yPos);
    
    yPos += 50;
    
    // ===== DADOS DA NOTA =====
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA NOTA FISCAL', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const dados = [
        ['Data do Serviço:', new Date(nota.data).toLocaleDateString('pt-BR')],
        ['Valor do Serviço:', formatCurrency(nota.valor)],
        ['Procedimento:', nota.procedimento || 'Serviço Odontológico']
    ];
    
    dados.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 50, yPos);
        yPos += 6;
    });
    
    yPos += 10;
    
    // ===== INSTRUÇÕES =====
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 50, 'F');
    
    yPos += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('COMO EMITIR A NOTA FISCAL:', margin + 3, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const instrucoes = [
        '1. Acesse o sistema de NFSe da sua prefeitura',
        '2. Copie a DESCRIÇÃO acima (ctrl+C)',
        '3. Cole no campo "Descrição dos Serviços" da nota fiscal',
        '4. Preencha o valor e demais dados',
        '5. Emita a nota fiscal',
        '',
        '✅ A descrição detalhada é OBRIGATÓRIA para Equiparação Hospitalar!'
    ];
    
    instrucoes.forEach(texto => {
        doc.text(texto, margin + 5, yPos);
        yPos += 5;
    });
    
    // ===== FOOTER =====
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    doc.text(
        `Gerado por ${user.clinic} | ${dataHoje}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
    );
    
    // Salvar PDF
    const nomeArquivo = `Modelo_Nota_Fiscal_${Date.now()}.pdf`;
    doc.save(nomeArquivo);
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
