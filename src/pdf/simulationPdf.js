import { jsPDF } from 'jspdf';
import { simulationGroups } from '../data/simulationFields.js';
import { formatProfileValue } from '../data/formatProfileValue.js';
import { validateSimulation } from '../data/validateSimulation.js';

// Standard PDF fonts support these French accents; normalize punctuation to ASCII.
const printable = value => String(value).replace(/[’‘]/g, "'").replace(/[“”«»]/g, '"').replace(/[–—‑]/g, '-');
const colors = { brand: '#AE2449', ink: '#171F32', muted: '#536079', surface: '#F6F8FB', line: '#E3E7EE' };

export function createSimulationPdf({ prediction, profile, illustrative = false, exportedAt = new Date() }) {
  if ((prediction !== 0 && prediction !== 1) || !profile || !Number.isFinite(exportedAt.getTime())) {
    throw new Error('Simulation invalide pour un export PDF.');
  }
  if (!illustrative && Object.keys(validateSimulation(profile).errors).length) {
    throw new Error('Le profil de la simulation est incomplet ou invalide.');
  }
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({ title: 'CardioScope - Simulation', author: 'CardioScope', subject: 'Profil fictif - démonstrateur pédagogique' });
  doc.setCreationDate(exportedAt);
  let y = 0;
  const left = 17, width = 176, bottom = 275;
  function header() {
    doc.setFillColor(colors.brand);
    doc.rect(0, 0, 210, 3, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(17).setTextColor(colors.brand);
    doc.text('CARDIOSCOPE', left, 17);
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(colors.muted);
    doc.text('SIMULATION / EXPORT PDF', 193, 17, { align: 'right' });
    y = 30;
  }
  function ensure(height) {
    if (y + height > bottom) { doc.addPage(); header(); }
  }
  function text(value, { size = 10, color = colors.ink, bold = false, gap = 3 } = {}) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).setTextColor(color);
    const lines = doc.splitTextToSize(printable(value), width);
    const height = lines.length * size * .42;
    ensure(height + gap);
    doc.text(lines, left, y, { lineHeightFactor: 1.2 });
    y += height + gap;
  }
  header();
  text(illustrative ? 'Aperçu illustratif de simulation' : 'Résultat de la simulation', { size: 20, bold: true, gap: 4 });
  text(`Exporté le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(exportedAt)} UTC`, { size: 9, color: colors.muted });
  if (illustrative) text('RÉPONSE SIMULÉE - aucun modèle ni API appelé.', { bold: true, color: colors.brand });
  else text('Modèle : Random Forest - classification du profil fictif.', { color: colors.muted });
  y += 2;
  text(`Classe prédite ${prediction} : ${prediction === 0 ? 'absence' : 'présence'} selon les catégories du dataset.`, { size: 13, bold: true, color: colors.brand, gap: 5 });
  text('Profils fictifs uniquement. Ce résultat peut être erroné et ne constitue pas un diagnostic médical. Il ne prédit pas un risque à 5 ou 10 ans.', { size: 9, gap: 6 });

  for (const group of simulationGroups) {
    ensure(24);
    y += 2;
    text(group.title, { size: 11, bold: true, gap: 2 });
    for (const field of group.fields) {
      doc.setFont('helvetica', 'normal').setFontSize(9);
      const label = doc.splitTextToSize(printable(field.label), 88);
      const value = doc.splitTextToSize(printable(formatProfileValue(field, profile[field.name])).slice(0, 200), 76);
      const height = Math.max(label.length, value.length) * 4 + 5;
      ensure(height);
      doc.setFillColor(colors.surface).rect(left, y - 3.5, width, height, 'F');
      doc.setTextColor(colors.muted).text(label, left + 3, y, { lineHeightFactor: 1.25 });
      doc.setFont('helvetica', 'bold').setTextColor(colors.ink).text(value, left + 97, y, { lineHeightFactor: 1.25 });
      y += height + .7;
    }
    y += 3;
  }
  text('Le modèle ne se réentraîne pas automatiquement avec les simulations enregistrées.', { size: 9, color: colors.muted });
  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page).setDrawColor(colors.line).line(left, 282, 193, 282);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(colors.muted);
    doc.text(illustrative ? 'APERÇU ILLUSTRATIF - Usage pédagogique' : 'CardioScope - Usage pédagogique', left, 288);
    doc.text(`${page} / ${doc.getNumberOfPages()}`, 193, 288, { align: 'right' });
  }
  return { doc, filename: `cardioscope-${illustrative ? 'apercu' : 'simulation'}-${exportedAt.toISOString().replace(/[:.]/g, '-')}.pdf` };
}

export async function downloadSimulationPdf(simulation) {
  const { doc, filename } = createSimulationPdf(simulation);
  await doc.save(filename, { returnPromise: true });
}
