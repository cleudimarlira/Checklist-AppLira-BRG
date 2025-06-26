import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EquipmentChecklist = () => {
  // Estados básicos
  const [equipmentId, setEquipmentId] = useState('');
  const [power, setPower] = useState('');
  const [clientName, setClientName] = useState('');
  const [currentHourMeter, setCurrentHourMeter] = useState('');
  const [lastOilChangeHour, setLastOilChangeHour] = useState('');

  // Estados do checklist
  const [checks, setChecks] = useState({
    geral: {
      nivelOleo: '',
      nivelAgua: '',
      vazamentos: '',
      limpeza: '',
    },
    motor: {
      correias: '',
      filtrosAr: '',
    },
    eletrico: {
      painel: '',
      batteryStatus: '',
      alternadorPrincipal: '',
      alternadorAuxiliar: '',
      conectores: '',
      botaoPartida: '',
    },
    carenagem: {
      portas: '',
      travessas: '',
      chassis: '',
      la: '',
      pintura: '',
      latarias: '',
    },
  });

  const [observations, setObservations] = useState('');

  // Atualiza selects
  const handleCheckChange = (e, category) => {
    const { name, value } = e.target;
    setChecks((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: value,
      },
    }));
  };

  // Calcula horas restantes para troca óleo
  const calculateRemainingHours = () => {
    const current = parseInt(currentHourMeter);
    const last = parseInt(lastOilChangeHour);
    if (isNaN(current) || isNaN(last)) return '';
    const used = current - last;
    const remaining = 250 - used;
    return remaining >= 0 ? remaining.toString() : '0';
  };

  // Mapeamento cores para selects (opcional para estilos)
  const colorMap = {
    ok: 'green',
    completar: 'orange',
    trocar: 'red',
    sim: 'red',
    nao: 'green',
    lavar: 'orange',
    danificado: 'red',
    danificadas: 'red',
    faltantes: 'orange',
    verificar: 'blue',
    bom: 'green',
  };

  // Gera PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Checklist AppLira BRG', 20, 20);

    doc.setFontSize(12);
    doc.text(`Equipamento: ${equipmentId}`, 20, 30);
    doc.text(`Potência: ${power} kVA`, 20, 40);
    doc.text(`Cliente: ${clientName}`, 20, 50);
    doc.text(`Horímetro Atual: ${currentHourMeter}`, 20, 60);
    doc.text(`Última Troca de Óleo: ${lastOilChangeHour}`, 20, 70);
    doc.text(`Horas Restantes: ${calculateRemainingHours()}`, 20, 80);

    let currentY = 90;

    const addSection = (title, data) => {
      if (currentY + 10 > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(14);
      doc.text(title, 20, currentY);
      currentY += 6;

      const rows = Object.entries(data).map(([key, value]) => [
        key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase()),
        value || '-',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Item', 'Status']],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200] },
        margin: { left: 20, right: 20 },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    };

    addSection('GERAL', checks.geral);
    addSection('MOTOR', checks.motor);
    addSection('ELÉTRICO', checks.eletrico);
    addSection('CARENAGEM', checks.carenagem);

    if (currentY + 20 > 280) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.text('Observações:', 20, currentY);
    doc.setFontSize(10);
    const splitObs = doc.splitTextToSize(observations || '-', 170);
    doc.text(splitObs, 20, currentY + 6);

    doc.save('checklist_gerador.pdf');
  };

  const fieldStyle = { marginBottom: '1rem' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '0.25rem', display: 'block' };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Checklist AppLira BRG</h1>

      {/* Campos básicos */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Número do Equipamento:</label>
        <input type="text" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Potência (kVA):</label>
        <input type="text" value={power} onChange={(e) => setPower(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Cliente:</label>
        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Horímetro Atual:</label>
        <input type="text" value={currentHourMeter} onChange={(e) => setCurrentHourMeter(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Última Troca de Óleo (h):</label>
        <input type="text" value={lastOilChangeHour} onChange={(e) => setLastOilChangeHour(e.target.value)} />
      </div>

      {/* Seção GERAL */}
      <h2>GERAL</h2>
      {['nivelOleo', 'nivelAgua', 'vazamentos', 'limpeza'].map((field) => (
        <div style={fieldStyle} key={field}>
          <label style={labelStyle}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</label>
          <select
            name={field}
            value={checks.geral[field]}
            onChange={(e) => handleCheckChange(e, 'geral')}
            style={{ color: colorMap[checks.geral[field]] || 'black', width: '100%' }}
          >
            <option value="">Selecione</option>
            {field === 'nivelOleo' && (
              <>
                <option value="ok">Ok</option>
                <option value="completar">Completar</option>
              </>
            )}
            {field === 'nivelAgua' && (
              <>
                <option value="ok">Ok</option>
                <option value="completar">Completar</option>
                <option value="trocar">Trocar</option>
              </>
            )}
            {field === 'vazamentos' && (
              <>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
                <option value="lavar">Lavar</option>
              </>
            )}
            {field === 'limpeza' && (
              <>
                <option value="ok">Ok</option>
                <option value="lavar">Lavar</option>
              </>
            )}
          </select>
        </div>
      ))}

      {/* Seção MOTOR */}
      <h2>MOTOR</h2>
      {[
        { name: 'correias', options: ['ok', 'faltantes', 'danificadas'] },
        { name: 'filtrosAr', options: ['verificar', 'trocar'] },
      ].map(({ name, options }) => (
        <div style={fieldStyle} key={name}>
          <label style={labelStyle}>{name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</label>
          <select
            name={name}
            value={checks.motor[name]}
            onChange={(e) => handleCheckChange(e, 'motor')}
            style={{ color: colorMap
