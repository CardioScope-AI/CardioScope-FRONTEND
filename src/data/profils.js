// Trois profils fictifs représentatifs du jeu de données Cleveland pour la démonstration

export const profilsFictifs = [
  {
    id: 'profil-01',
    label: 'Profil 01 · Risque faible (Absence attendue)',
    description: 'Femme de 45 ans, bilan de repos normal, fréquence max élevée à l’effort, aucun antécédent.',
    values: {
      age: '45',
      sex: '0', // Femme
      cp: '2', // Angine atypique
      trestbps: '120',
      chol: '180',
      fbs: '0', // Glycémie normale
      restecg: '0', // ECG normal
      thalach: '165',
      exang: '0', // Pas d'angine d'effort
      oldpeak: '0.0',
      slope: '1', // Pente ascendante
      ca: '0', // 0 vaisseau coloré
      thal: '3', // Thallium normal
    },
  },
  {
    id: 'profil-02',
    label: 'Profil 02 · Risque élevé (Présence attendue)',
    description: 'Homme de 67 ans, hypertension, cholestérol élevé, angine induite par l’effort et anomalies ST.',
    values: {
      age: '67',
      sex: '1', // Homme
      cp: '4', // Asymptomatique (ischémie silencieuse)
      trestbps: '160',
      chol: '286',
      fbs: '0',
      restecg: '2', // Hypertrophie ventriculaire gauche
      thalach: '108',
      exang: '1', // Angine d'effort présente
      oldpeak: '1.5',
      slope: '2', // Pente plate
      ca: '3', // 3 vaisseaux touchés
      thal: '7', // Défaut réversible
    },
  },
  {
    id: 'profil-03',
    label: 'Profil 03 · Profil de référence (Cas modéré)',
    description: 'Homme de 54 ans, profil type de la maquette, tension modérée et test au thallium normal.',
    values: {
      age: '54',
      sex: '1', // Homme
      cp: '3', // Douleur non angineuse
      trestbps: '130',
      chol: '215',
      fbs: '0',
      restecg: '0', // ECG normal
      thalach: '155',
      exang: '0',
      oldpeak: '0.6',
      slope: '1',
      ca: '0',
      thal: '3',
    },
  },
];