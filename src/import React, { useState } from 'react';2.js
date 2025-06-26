import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EquipmentChecklist = () => {
  const [equipmentNumber, setEquipmentNumber] = useState('');
  const [power, setPower] = useState('');
  const [hourmeter, setHourmeter] = useState('');
  const [lastOilChange, setLastOilChange] = useState('');
  const [batteryState, setBatteryState] = useState('');
  const [observations, setObservations] = useState('');
  const [photos, setPhotos] = useState<FileList | null>(null);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Checklist - Equipamento ${equipmentNumber}`, 14, 20);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Campo', 'Valor']],
      body: [
        ['Número do Equipamento', equipmentNumber],
        ['Potência (kVA)', power],
        ['Horímetro', hourmeter],
        ['Última troca de óleo (h)', lastOilChange],
        ['Horas até próxima troca',
          lastOilChange && hourmeter
            ? `${250 - (parseFloat(hourmeter) - parseFloat(lastOilChange))} h`
            : '---'],
        ['Estado da bateria', batteryState],
        ['Observações', observations],
      ],
    });

    if (photos) {
      Array.from(photos).forEach((photo, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = e.target?.result;
          if (typeof img === 'string') {
            doc.addPage();
            doc.text(`Foto ${index + 1}`, 14, 20);
            doc.addImage(img, 'JPEG', 14, 30, 180, 135);
            if (index === photos.length - 1) doc.save(`Checklist_${equipmentNumber}.pdf`);
          }
        };
        reader.readAsDataURL(photo);
      });
    } else {
      doc.save(`Checklist_${equipmentNumber}.pdf`);
    }
  };

  const fieldStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1>Checklist de Equipamento</h1>

      <div style={fieldStyle}>
        <label style={labelStyle}>Número do Equipamento:</label>
        <input value={equipmentNumber} onChange={e => setEquipmentNumber(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Potência (kVA):</label>
        <input value={power} onChange={e => setPower(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Horímetro:</label>
        <input value={hourmeter} onChange={e => setHourmeter(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Última troca de óleo (h):</label>
        <input value={lastOilChange} onChange={e => setLastOilChange(e.target.value)} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Estado da bateria:</label>
        <select value={batteryState} onChange={e => setBatteryState(e.target.value)}>
          <option value="">Selecione</option>
          <option value="Boa">Boa</option>
          <option value="Fraca">Fraca</option>
          <option value="Ruim">Ruim</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Observações:</label>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          rows={4}
          style={{ width: '100%' }}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Fotos:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setPhotos(e.target.files)}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={exportPDF} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 'bold' }}>
          Exportar PDF
        </button>
      </div>
    </div>
  );
};

export default EquipmentChecklist;
