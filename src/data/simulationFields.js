// Codes et définitions Cleveland : https://archive.ics.uci.edu/dataset/45/heart+disease
// Les aides décrivent les entrées ; elles ne fixent pas de seuils diagnostiques.
const yesNo = [[0, 'Non'], [1, 'Oui']];
export const simulationGroups = [
  {
    id: 'profil', title: 'Profil et mesures au repos',
    fields: [
      { name: 'age', label: 'Âge', hint: 'Âge du profil fictif, en années entières.', placeholder: 'Années', step: '1' },
      { name: 'sex', label: 'Sexe', hint: 'Catégorie de sexe utilisée dans le dataset Cleveland.', options: [[0, 'Femme'], [1, 'Homme']] },
      { name: 'cp', label: 'Type de douleur thoracique', hint: '« Asymptomatique » signifie sans douleur thoracique déclarée.', options: [[1, 'Angine typique'], [2, 'Angine atypique'], [3, 'Douleur non angineuse'], [4, 'Asymptomatique']] },
      { name: 'trestbps', label: 'Tension au repos', hint: 'Tension artérielle mesurée au repos, en millimètres de mercure (mmHg).', placeholder: 'mmHg', step: 'any' },
      { name: 'chol', label: 'Cholestérol sérique', hint: 'Cholestérol mesuré dans le sang, en milligrammes par décilitre (mg/dL).', placeholder: 'mg/dL', step: 'any' },
    ],
  },
  {
    id: 'examens', title: 'Examens et effort',
    fields: [
      { name: 'fbs', label: 'Glycémie à jeun > 120 mg/dL', hint: 'Oui si la glycémie à jeun dépasse 120 mg/dL ; non si elle est inférieure ou égale.', options: yesNo },
      { name: 'restecg', label: 'ECG au repos', hint: 'Résultat de l’électrocardiogramme au repos, tel qu’indiqué dans le profil.', options: [[0, 'Normal'], [1, 'Anomalie ST-T'], [2, 'Hypertrophie ventriculaire gauche']] },
      { name: 'thalach', label: 'Fréquence cardiaque maximale', hint: 'Fréquence maximale atteinte pendant l’effort, en battements par minute (bpm).', placeholder: 'bpm', step: '1' },
      { name: 'exang', label: 'Angine induite par l’effort', hint: 'Indique si une douleur de type angine apparaît pendant l’effort.', options: yesNo },
      { name: 'oldpeak', label: 'Dépression du segment ST', hint: 'Abaissement du segment ST à l’effort par rapport au repos. Une valeur décimale est acceptée.', placeholder: 'Valeur du profil', step: 'any' },
    ],
  },
  {
    id: 'autres', title: 'Autres paramètres',
    fields: [
      { name: 'slope', label: 'Pente du segment ST', hint: 'Orientation du segment ST au maximum de l’effort : ascendante, plate ou descendante.', options: [[1, 'Ascendante'], [2, 'Plate'], [3, 'Descendante']] },
      { name: 'ca', label: 'Nombre de vaisseaux principaux', hint: 'Nombre de vaisseaux principaux visualisés par fluoroscopie, de 0 à 3.', options: [[0, '0'], [1, '1'], [2, '2'], [3, '3']] },
      { name: 'thal', label: 'Résultat du test au thallium', hint: 'Reprenez le résultat du test au thallium fourni dans le profil fictif.', options: [[3, 'Normal'], [6, 'Défaut fixe'], [7, 'Défaut réversible']] },
    ],
  },
];
