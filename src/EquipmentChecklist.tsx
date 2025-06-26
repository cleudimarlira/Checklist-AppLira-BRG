import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const EquipmentChecklist = () => {
  // --- Estados básicos ---
  const [equipmentId, setEquipmentId] = useState('');
  const [power, setPower] = useState('');
  const [clientName, setClientName] = useState(''); // campo cliente adicionado
  const [currentHourMeter, setCurrentHourMeter] = useState('');
  const [lastOilChangeHour, setLastOilChangeHour] = useState('');

  // --- Estados do checklist com categorias ---
  const [checks, setChecks] = useState({
    geral: {
      nivelOleo: '',
      nivelAgua: '',
      vazamentos: '',
      limpeza: '',
      ultimaTrocaOleo: '',
      horasRestantes: ''
    },
    motor: {
      correias: '',
      filtrosAr: ''
    },
    eletrico: {
      painel: '',
      batteryStatus: '',
      alternadorPrincipal: '',
      alternadorAuxiliar: '',
      conectores: '',
      botaoPartida: ''
    }
  });

  // --- Observações e fotos ---
  const [observations, setObservations] = useState('');
  const [photos, setPhotos] = useState<FileList | null>(null);

  // --- Atualiza os checks dentro da categoria específica ---
  const handleCheckChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    category: string
  ) => {
    setChecks(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [e.target.name]: e.target.value
      }
    }));
  };

  // --- Calcula horas restantes para próxima troca de óleo ---
  const calculateRemainingHours = () => {
    const current = parseInt(currentHourMeter);
    const last = parseInt(lastOilChangeHour);
    if (isNaN(current) || isNaN(last)) return '';
    const used = current - last;
    const remaining = 250 - used;
    return remaining >= 0 ? remaining.toString() : '0';
  };

  // --- Converte arquivo de foto para DataURL (base64) ---
  const readFileAsDataURL = (file: File): Promise<string | null> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // --- Gera o PDF com os dados do checklist ---
  const exportPDF = async () => {
    const doc = new jsPDF();

    // Cabeçalho do PDF
    doc.setFontSize(16);
    doc.text('Checklist AppLira BRG', 20, 20);

    doc.setFontSize(12);
    doc.text(`Equipamento: ${equipmentId}`, 20, 30);
    doc.text(`Potência: ${power} kVA`, 20, 40);
    doc.text(`Cliente: ${clientName}`, 20, 50);
    doc.text(`Horímetro Atual: ${currentHourMeter}`, 20, 60);
    doc.text(`Última Troca de Óleo: ${lastOilChangeHour}`, 20, 70);
    doc.text(`Horas Restantes: ${calculateRemainingHours()}`, 20, 80);

    let currentY = 100;

    // Função auxiliar para adicionar seção de tabela no PDF
    const addSection = (title: string, data: { [key: string]: string }) => {
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
          .replace(/^./, str => str.toUpperCase()),
        value || '-'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Item', 'Status']],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200] },
        margin: { left: 20, right: 20 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    };

    // Adiciona as seções com os dados do checklist
    addSection('GERAL', {
      'Nível de Óleo': checks.geral.nivelOleo,
      'Nível de Água': checks.geral.nivelAgua,
      Vazamentos: checks.geral.vazamentos,
      Limpeza: checks.geral.limpeza,
      'Última Troca de Óleo': lastOilChangeHour,
      'Horas Restantes': calculateRemainingHours()
    });
    addSection('MOTOR', checks.motor as { [key: string]: string });
    addSection('ELÉTRICO', checks.eletrico as { [key: string]: string });

    // Observações no PDF
    if (currentY + 20 > 280) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.text('Observações:', 20, currentY);
    doc.setFontSize(10);
    const splitObs = doc.splitTextToSize(observations || '-', 170);
    doc.text(splitObs, 20, currentY + 6);
    currentY += splitObs.length * 6 + 10;

    // Adiciona fotos ao PDF (tentando encaixar)
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        if (currentY + 50 > 280) {
          doc.addPage();
          currentY = 20;
        }
        const file = photos[i];
        const imgData = await readFileAsDataURL(file);
        if (imgData) {
          const isJpeg = imgData.startsWith('data:image/jpeg');
          const isPng = imgData.startsWith('data:image/png');
          if (isJpeg || isPng) {
            const format = isJpeg ? 'JPEG' : 'PNG';
            try {
              doc.addImage(imgData, format, 20, currentY, 60, 45);
            } catch (error) {
              console.error('Erro ao adicionar imagem no PDF:', error);
            }
            currentY += 50;
          }
        }
      }
    }

    // Salva o PDF
    doc.save('checklist_gerador.pdf');
  };

  // --- Mapeamento das cores para os selects ---
  const colorMap: { [key: string]: { [opt: string]: string } } = {
    painel: { ok: 'green', danificado: 'red' },
    batteryStatus: { bom: 'green', danificadas: 'red', faltantes: 'orange', verificar: 'blue' },
    nivelOleo: { ok: 'green', completar: 'orange' },
    nivelAgua: { ok: 'green', completar: 'orange', trocar: 'red' },
    vazamentos: { sim: 'red', nao: 'green', lavar: 'orange' },
    limpeza: { ok: 'green', lavar: 'orange' },
    correias: { ok: 'green', faltantes: 'orange', danificadas: 'red' },
    filtrosAr: { verificar: 'orange', trocar: 'red' },
    alternadorPrincipal: { ok: 'green', verificar: 'orange', danificado: 'red' },
    alternadorAuxiliar: { ok: 'green', verificar: 'orange', danificado: 'red' },
    conectores: { ok: 'green', trocar: 'red', verificar: 'orange' },
    botaoPartida: { ok: 'green', verificar: 'orange', danificado: 'red' }
  };

  // --- Estilos básicos inline ---
  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    marginBottom: '1rem'
  };
  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '0.25rem'
  };

  return (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}
  >
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Checklist AppLira BRG
      </h1>
    
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Checklist AppLira BRG</h1>

      {/* Campos básicos */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Número do Equipamento:</label>
        <input type="text" value={equipmentId} onChange={e => setEquipmentId(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Potência (kVA):</label>
        <input type="text" value={power} onChange={e => setPower(e.target.value)} />
      </div>

      {/* Campo Cliente */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Cliente:</label>
        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Horímetro Atual:</label>
        <input type="text" value={currentHourMeter} onChange={e => setCurrentHourMeter(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Última Troca de Óleo (h):</label>
        <input type="text" value={lastOilChangeHour} onChange={e => setLastOilChangeHour(e.target.value)} />
      </div>

      {/* Seção GERAL */}
      <h2>GERAL</h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Nível de Óleo:</label>
        <select
          name="nivelOleo"
          value={checks.geral.nivelOleo}
          onChange={e => handleCheckChange(e, 'geral')}
          style={{ color: colorMap.nivelOleo[checks.geral.nivelOleo] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="completar">Completar</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Nível de Água:</label>
        <select
          name="nivelAgua"
          value={checks.geral.nivelAgua}
          onChange={e => handleCheckChange(e, 'geral')}
          style={{ color: colorMap.nivelAgua[checks.geral.nivelAgua] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="completar">Completar</option>
          <option value="trocar">Trocar</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Vazamentos:</label>
        <select
          name="vazamentos"
          value={checks.geral.vazamentos}
          onChange={e => handleCheckChange(e, 'geral')}
          style={{ color: colorMap.vazamentos[checks.geral.vazamentos] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
          <option value="lavar">Lavar</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Limpeza:</label>
        <select
          name="limpeza"
          value={checks.geral.limpeza}
          onChange={e => handleCheckChange(e, 'geral')}
          style={{ color: colorMap.limpeza[checks.geral.limpeza] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="lavar">Lavar</option>
        </select>
      </div>

      {/* Seção MOTOR */}
      <h2>MOTOR</h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Correias:</label>
        <select
          name="correias"
          value={checks.motor.correias}
          onChange={e => handleCheckChange(e, 'motor')}
          style={{ color: colorMap.correias[checks.motor.correias] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="faltantes">Faltantes</option>
          <option value="danificadas">Danificadas</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Filtros de Ar:</label>
        <select
          name="filtrosAr"
          value={checks.motor.filtrosAr}
          onChange={e => handleCheckChange(e, 'motor')}
          style={{ color: colorMap.filtrosAr[checks.motor.filtrosAr] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="verificar">Verificar</option>
          <option value="trocar">Trocar</option>
        </select>
      </div>

      {/* Seção ELÉTRICO */}
      <h2>ELÉTRICO</h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Painel:</label>
        <select
          name="painel"
          value={checks.eletrico.painel}
          onChange={e => handleCheckChange(e, 'eletrico')}
          style={{ color: colorMap.painel[checks.eletrico.painel] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="danificado">Danificado</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Estado da Bateria:</label>
        <select
          name="batteryStatus"
          value={checks.eletrico.batteryStatus}
          onChange={e => handleCheckChange(e, 'eletrico')}
          style={{ color: colorMap.batteryStatus[checks.eletrico.batteryStatus] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="bom">Bom</option>
          <option value="danificadas">Danificadas</option>
          <option value="faltantes">Faltantes</option>
          <option value="verificar">Verificar</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Alternador Principal:</label>
        <select
          name="alternadorPrincipal"
          value={checks.eletrico.alternadorPrincipal}
          onChange={e => handleCheckChange(e, 'eletrico')}
          style={{ color: colorMap.alternadorPrincipal[checks.eletrico.alternadorPrincipal] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="verificar">Verificar</option>
          <option value="danificado">Danificado</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Alternador Auxiliar:</label>
        <select
          name="alternadorAuxiliar"
          value={checks.eletrico.alternadorAuxiliar}
          onChange={e => handleCheckChange(e, 'eletrico')}
          style={{ color: colorMap.alternadorAuxiliar[checks.eletrico.alternadorAuxiliar] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="verificar">Verificar</option>
          <option value="danificado">Danificado</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Conectores:</label>
        <select
          name="conectores"
          value={checks.eletrico.conectores}
          onChange={e => handleCheckChange(e, 'eletrico')}
          style={{ color: colorMap.conectores[checks.eletrico.conectores] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="trocar">Trocar</option>
          <option value="verificar">Verificar</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Botão de Partida:</label>
        <select
          name="botaoPartida"
          value={checks.eletrico.botaoPartida}
          onChange={e => handleCheckChange(e, 'eletrico')}
          style={{ color: colorMap.botaoPartida[checks.eletrico.botaoPartida] || 'black', width: '100%' }}
        >
          <option value="">Selecione</option>
          <option value="ok">Ok</option>
          <option value="verificar">Verificar</option>
          <option value="danificado">Danificado</option>
        </select>
      </div>
<Card className="p-4 my-4">
  <h3 className="text-lg font-semibold mb-2">Carenagem</h3>
  <div className="space-y-2">
    <div>
      <label className="block font-medium">Portas</label>
      <select className="w-full border rounded p-2">
        <option value="ok">Ok</option>
        <option value="danificada">Danificada</option>
      </select>
    </div>
    <div>
      <label className="block font-medium">Travessas</label>
      <select className="w-full border rounded p-2">
        <option value="ok">Ok</option>
        <option value="danificadas">Danificadas</option>
      </select>
    </div>
    <div>
      <label className="block font-medium">Chassis</label>
      <select className="w-full border rounded p-2">
        <option value="ok">Ok</option>
        <option value="danificado">Danificado</option>
      </select>
    </div>
    <div>
      <label className="block font-medium">Lã</label>
      <select className="w-full border rounded p-2">
        <option value="ok">Ok</option>
        <option value="danificadas">Danificadas</option>
      </select>
    </div>
    <div>
      <label className="block font-medium">Pintura</label>
      <select className="w-full border rounded p-2">
        <option value="ok">Ok</option>
        <option value="danificada">Danificada</option>
      </select>
    </div>
    <div>
      <label className="block font-medium">Latarias</label>
      <select className="w-full border rounded p-2">
        <option value="ok">Ok</option>
        <option value="danificada">Danificada</option>
      </select>
    </div>
  </div>
</Card>


      {/* Observações */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Observações:</label>
        <textarea
          rows={4}
          value={observations}
          onChange={e => setObservations(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Upload de fotos */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Fotos:</label>
        <input type="file" multiple accept="image/*" onChange={e => setPhotos(e.target.files)} />
      </div>

      {/* Botão para exportar PDF */}
      <button
        onClick={exportPDF}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem',
          width: '100%'
        }}
      >
        Exportar PDF
      </button>
    </div>
        </div>
      </div>
);
  ;
};

export default EquipmentChecklist;
