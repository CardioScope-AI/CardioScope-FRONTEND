// Codes Cleveland originaux : contrat API encore à confirmer avec l’équipe.
const yesNo = [[0, 'Non'], [1, 'Oui']];
export const simulationGroups = [
  {
    id: 'profil', title: 'Profil et mesures au repos',
    fields: [
      { name: 'age', label: 'Âge', hint: 'En années', step: '1' },
      { name: 'sex', label: 'Sexe', options: [[0, 'Femme'], [1, 'Homme']] },
      { name: 'cp', label: 'Type de douleur thoracique', options: [[1, 'Angine typique'], [2, 'Angine atypique'], [3, 'Douleur non angineuse'], [4, 'Asymptomatique']] },
      { name: 'trestbps', label: 'Tension au repos', hint: 'En mmHg', step: 'any' },
      { name: 'chol', label: 'Cholestérol sérique', hint: 'En mg/dL', step: 'any' },
    ],
  },
  {
    id: 'examens', title: 'Examens et effort',
    fields: [
      { name: 'fbs', label: 'Glycémie à jeun > 120 mg/dL', options: yesNo },
      { name: 'restecg', label: 'ECG au repos', options: [[0, 'Normal'], [1, 'Anomalie ST-T'], [2, 'Hypertrophie ventriculaire gauche']] },
      { name: 'thalach', label: 'Fréquence cardiaque maximale', hint: 'En battements par minute', step: '1' },
      { name: 'exang', label: 'Angine induite par l’effort', options: yesNo },
      { name: 'oldpeak', label: 'Dépression du segment ST', hint: 'Valeur de oldpeak', step: 'any' },
    ],
  },
  {
    id: 'autres', title: 'Autres paramètres',
    fields: [
      { name: 'slope', label: 'Pente du segment ST', options: [[1, 'Ascendante'], [2, 'Plate'], [3, 'Descendante']] },
      { name: 'ca', label: 'Nombre de vaisseaux principaux', options: [[0, '0'], [1, '1'], [2, '2'], [3, '3']] },
      { name: 'thal', label: 'Résultat du test au thallium', options: [[3, 'Normal'], [6, 'Défaut fixe'], [7, 'Défaut réversible']] },
    ],
  },
];
