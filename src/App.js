import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Presentation, Users, BarChart3, Download, Loader2 } from 'lucide-react';

// --- COMPOSANTS DE BASE ---

// Couleurs utilisées pour les graphiques
const COLORS = {
  blue: '#2563eb',   
  red: '#dc2626',    
  yellow: '#eab308', 
  green: '#22c55e',  
  purple: '#a855f7'  
};

// Injection d'un script externe via CDN (utilisé pour l'export PPTX)
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Composant d'Arrière-plan partagé (pour l'affichage et l'export)
const Background = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-60 z-0">
    <div className="blob-1 absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[120px]"></div>
    <div className="blob-2 absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] bg-indigo-400 rounded-full blur-[100px]"></div>
    <svg className="absolute w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <line x1="-10%" y1="110%" x2="110%" y2="-10%" stroke="white" strokeWidth="4" />
      <line x1="-10%" y1="90%" x2="90%" y2="-10%" stroke="white" strokeWidth="2" />
    </svg>
  </div>
);

// Composant Graphique Secteur (Pie Chart) fait sur mesure en SVG
const PieChart = ({ data, showLegend = true, size = 200 }) => {
  let cumulativePercent = 0;

  const getCoordinates = (percent) => {
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return [Math.cos(angle), Math.sin(angle)];
  };

  return (
    <div className="flex items-center justify-center gap-4 flex-col sm:flex-row w-full">
      <div style={{ width: size, height: size }} className="relative drop-shadow-md transition-transform hover:scale-105 duration-300">
        <svg viewBox="-1.2 -1.2 2.4 2.4" width={size} height={size} className="w-full h-full overflow-visible">
          {data.map((slice, index) => {
            const value = Number(slice.value);
            if (value === 0) return null;
            if (value === 100) {
              return (
                <g key={index}>
                  <circle r="1" cx="0" cy="0" fill={slice.color} />
                  <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="0.2" fontWeight="bold">
                    {value}%
                  </text>
                </g>
              );
            }

            const [startX, startY] = getCoordinates(cumulativePercent);
            cumulativePercent += value / 100;
            const [endX, endY] = getCoordinates(cumulativePercent);
            const largeArcFlag = value > 50 ? 1 : 0;

            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            // Positionnement du texte
            const midPercent = cumulativePercent - (value / 100) / 2;
            const [textX, textY] = getCoordinates(midPercent);

            return (
              <g key={index} className="group cursor-pointer chart-slice">
                <path d={pathData} fill={slice.color} className="transition-all duration-300" stroke="white" strokeWidth="0.02" />
                {value >= 4 && ( 
                  <text 
                    x={textX * 0.65} 
                    y={textY * 0.65} 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    fill="white" 
                    fontSize="0.15" 
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {value}%
                  </text>
                )}
                <title>{slice.label}: {value}%</title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Légende Optionnelle */}
      {showLegend && (
        <div className="flex flex-col gap-2 text-xs font-medium text-gray-700 min-w-[120px]">
          {data.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: slice.color }}></div>
              <span>{slice.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- PAGES DE PRÉSENTATION ---

const Slide1 = ({ isExport = false }) => {
  const data1 = [{ label: 'Oui', value: 100, color: COLORS.blue }];
  const data2 = [
    { label: 'Homme', value: 59, color: COLORS.blue },
    { label: 'Femme', value: 41, color: COLORS.red }
  ];
  const data3 = [
    { label: 'Moins de 18 ans', value: 5, color: COLORS.blue },
    { label: '18-24 ans', value: 54.3, color: COLORS.red },
    { label: '25-30 ans', value: 37.1, color: COLORS.yellow },
    { label: '30 ans et plus', value: 3.6, color: COLORS.green }
  ];

  return (
    <div className={`flex flex-col lg:flex-row gap-8 lg:gap-12 pb-10 min-h-full ${isExport ? '' : 'animate-fade-in'}`}>
      <div className="flex-1 flex flex-col justify-center gap-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-950 mb-4 drop-shadow-sm">Profil de l'échantillon</h1>
        
        <div className="space-y-8">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> Taille globale
            </h2>
            <p className="text-gray-800 font-medium text-lg leading-relaxed">
              Une base solide de 105 répondants, tous identifiés comme supporters d'une équipe sportive
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> Répartition par genre
            </h2>
            <p className="text-gray-800 font-medium text-lg leading-relaxed">
              Une population composée majoritairement d'hommes (59%), avec une présence significative de femmes (41%)
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm transition-transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Tranche d'âge dominante
            </h2>
            <p className="text-gray-800 font-medium text-lg leading-relaxed">
              Un public très jeune, dominé par les 18-24 ans (54,3%).
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6 pt-4 lg:pt-0">
        {[ 
          { title: "1) Supportez vous une équipe sportive ?", data: data1 },
          { title: "Quel est votre genre ?", data: data2 },
          { title: "Quel est votre âge ?", data: data3 }
        ].map((chart, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-md border border-white flex flex-col">
            <p className="text-sm font-semibold text-gray-700 mb-1">{chart.title}</p>
            <p className="text-xs text-gray-500 mb-4">105 réponses</p>
            <div className="flex-1 flex items-center justify-center">
               <PieChart data={chart.data} size={150} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Slide2 = ({ isExport = false }) => {
  const data1 = [
    { label: 'Etudiant(e)', value: 59, color: COLORS.blue },
    { label: 'Salarié(e)', value: 30.5, color: COLORS.red },
    { label: 'Indépendant', value: 5.5, color: COLORS.yellow },
    { label: 'Sans emploi', value: 5, color: COLORS.green }
  ];
  const data2 = [
    { label: 'Lycée', value: 10, color: COLORS.blue },
    { label: 'Licence', value: 42.9, color: COLORS.yellow },
    { label: 'Master', value: 27.6, color: COLORS.green },
    { label: 'Bac +1 / Bac +2', value: 9.5, color: COLORS.red },
    { label: 'Bac +5', value: 10, color: COLORS.purple }
  ];
  const data3 = [
    { label: 'Tunis', value: 54.3, color: COLORS.blue },
    { label: 'Ariana', value: 20, color: COLORS.red },
    { label: 'Ben Arous', value: 10, color: COLORS.yellow },
    { label: 'Manouba', value: 10, color: COLORS.green },
    { label: 'Autres régions', value: 5.7, color: COLORS.purple }
  ];

  return (
    <div className={`flex flex-col lg:flex-row gap-8 lg:gap-12 pb-10 min-h-full ${isExport ? '' : 'animate-fade-in'}`}>
      <div className="flex-1 flex flex-col justify-center gap-10 mt-8 lg:mt-0">
        <div className="space-y-8">
          <div className="bg-indigo-100/80 backdrop-blur-md p-6 rounded-xl border-2 border-indigo-300 shadow-sm transition-transform hover:-translate-y-1">
            <h2 className="text-3xl font-bold text-center text-indigo-950 mb-3">
              Situation socioprofessionnelle
            </h2>
            <p className="text-gray-900 font-bold text-center text-lg">
              Une forte présence d'étudiants (59%),<br/>suivis par les salariés (30.5%).
            </p>
          </div>

          <div className="px-6 py-4">
            <h2 className="text-3xl font-bold text-center text-indigo-950 mb-3">
              Niveau d'études
            </h2>
            <p className="text-gray-900 font-bold text-center text-lg">
              Une population hautement instruite,<br/>dominée par les profils Licence<br/>(42.9%) et Master (27.6%).
            </p>
          </div>

          <div className="px-6 py-4">
             <h2 className="text-3xl font-bold text-center text-indigo-950 mb-3 flex justify-center items-center gap-2">
               Ancrage géographique
            </h2>
            <p className="text-gray-900 font-bold text-center text-lg">
              Une concentration principalement<br/>urbaine, avec 54.3% des répondants<br/>résidant à Tunis.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6 pt-4 lg:pt-0">
        {[ 
          { title: "Quelle est votre situation actuelle ?", data: data1 },
          { title: "Quel est votre niveau d'études ?", data: data2 },
          { title: "Où habitez-vous ?", data: data3 }
        ].map((chart, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-md border border-white flex flex-col">
            <p className="text-sm font-semibold text-gray-700 mb-1">{chart.title}</p>
            <p className="text-xs text-gray-500 mb-4">105 réponses</p>
            <div className="flex-1 flex items-center justify-center">
               <PieChart data={chart.data} size={150} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Slide3 = ({ isExport = false }) => {
  const commonLegend = [
    { label: "Pas du tout d'accord", color: COLORS.blue },
    { label: "Peu d'accord", color: COLORS.red },
    { label: "Neutre", color: COLORS.yellow },
    { label: "D'accord", color: COLORS.green },
    { label: "Tout à fait d'accord", color: COLORS.purple },
  ];

  const data1 = [
    { label: "Pas du tout d'accord", value: 4.8, color: COLORS.blue },
    { label: "Peu d'accord", value: 9.5, color: COLORS.red },
    { label: "Neutre", value: 15.2, color: COLORS.yellow },
    { label: "D'accord", value: 36.2, color: COLORS.green },
    { label: "Tout à fait d'accord", value: 34.3, color: COLORS.purple }
  ];
  const data2 = [
    { label: "Pas du tout d'accord", value: 4, color: COLORS.blue },
    { label: "Peu d'accord", value: 6, color: COLORS.red },
    { label: "Neutre", value: 9, color: COLORS.yellow },
    { label: "D'accord", value: 40, color: COLORS.green },
    { label: "Tout à fait d'accord", value: 41, color: COLORS.purple }
  ];
  const data3 = [
    { label: "Pas du tout d'accord", value: 3, color: COLORS.blue },
    { label: "Peu d'accord", value: 7.5, color: COLORS.red },
    { label: "Neutre", value: 22.9, color: COLORS.yellow },
    { label: "D'accord", value: 37.1, color: COLORS.green },
    { label: "Tout à fait d'accord", value: 29.5, color: COLORS.purple }
  ];

  return (
    <div className={`flex flex-col pb-10 min-h-full ${isExport ? '' : 'animate-fade-in'}`}>
      <div className="flex flex-col md:flex-row md:justify-between items-start mb-8 gap-4 shrink-0 z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-950 drop-shadow-sm mt-4">
          Résultats : Perception des Actions Marketing
        </h1>
        
        {/* Légende Globale */}
        <div className={`${isExport ? 'flex' : 'hidden md:flex'} flex-col gap-1.5 bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-sm border border-white shrink-0`}>
          {commonLegend.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <div className="w-4 h-3" style={{ backgroundColor: item.color }}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 shrink-0 mb-8 z-10">
        {/* Graphique 1 */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white flex flex-col relative">
          <h2 className="text-2xl font-bold text-indigo-950 mb-4 font-serif">Communication</h2>
          <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
            3) La communication de l'équipe (réseaux sociaux, médias, annonces) renforce mon intérêt pour cette équipe.
          </p>
          <p className="text-xs text-gray-500 mb-8">105 réponses</p>
          <div className="flex-1 flex justify-center items-center">
            <PieChart data={data1} showLegend={false} size={220} />
          </div>
          <div className="hidden lg:block absolute right-0 top-[20%] bottom-[20%] w-[2px] bg-gray-400">
             <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
             <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {/* Graphique 2 */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white flex flex-col relative">
           <h2 className="text-2xl font-bold text-transparent mb-4 hidden lg:block">Produits</h2>
          <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
            4) Les produits officiels de l'équipe (maillots, accessoires) sont attractifs et bien mis en valeur.
          </p>
          <p className="text-xs text-gray-500 mb-8">105 réponses</p>
          <div className="flex-1 flex justify-center items-center">
            <PieChart data={data2} showLegend={false} size={220} />
          </div>
           <div className="hidden lg:block absolute right-0 top-[20%] bottom-[20%] w-[2px] bg-gray-400">
             <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
             <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {/* Graphique 3 */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white flex flex-col">
          <h2 className="text-2xl font-bold text-transparent mb-4 hidden lg:block">Offres</h2>
          <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
            5) Les offres proposées par l'équipe (billetterie, promotions, packs) rendent l'achat plus attractif.
          </p>
          <p className="text-xs text-gray-500 mb-8">105 réponses</p>
          <div className="flex-1 flex justify-center items-center">
            <PieChart data={data3} showLegend={false} size={220} />
          </div>
        </div>
      </div>

      {/* Conclusion Générale */}
      <div className="bg-indigo-900/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-indigo-900/20 shadow-inner mt-auto shrink-0 transition-transform hover:-translate-y-1 z-10">
        <h3 className="text-2xl sm:text-3xl font-bold text-indigo-950 mb-4 flex items-center gap-3">
          <Presentation className="w-8 h-8 text-indigo-700" /> Conclusion sur les Actions Marketing
        </h3>
        <p className="text-gray-800 text-lg leading-relaxed font-medium">
          Dans l'ensemble, la perception des actions marketing de l'équipe par les supporters est <strong className="text-indigo-700">très positive</strong>. 
          Si la <strong>communication</strong> est jugée efficace, ce sont véritablement les <strong>produits officiels</strong> et les <strong>offres (billetterie, packs)</strong> qui génèrent la plus forte adhésion (plus de <strong className="text-green-600">70% d'avis favorables</strong> cumulés).<br/><br/>
          Il existe donc un potentiel de fidélisation majeur à travers la monétisation, particulièrement adapté à notre public majoritairement <strong>jeune (18-24 ans) et étudiant</strong>.
        </p>
      </div>
    </div>
  );
};


// --- APPLICATION PRINCIPALE ---

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const totalPages = 3; 

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    try {
      // 1. Chargement asynchrone des librairies nécessaires (html2canvas et pptxgenjs)
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");

      const pptx = new window.PptxGenJS();
      pptx.layout = 'LAYOUT_16x9'; // Format standard large pour présentation

      // 2. Boucler sur les 3 slides cachées rendues expressément pour l'exportation
      for (let i = 1; i <= 3; i++) {
        const slideElement = document.getElementById(`export-slide-${i}`);
        
        // Capture l'élément HTML en Image Haute Définition
        const canvas = await window.html2canvas(slideElement, { 
          scale: 2,           // Haute résolution
          useCORS: true, 
          logging: false 
        });
        
        const imgData = canvas.toDataURL("image/png");
        
        // Ajoute l'image dans une nouvelle diapositive PowerPoint
        let slide = pptx.addSlide();
        slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
      }

      // 3. Déclenche le téléchargement du fichier final
      pptx.writeFile({ fileName: "Presentation_Marketing.pptx" });
      
    } catch (error) {
      console.error("Erreur lors de l'export PPTX:", error);
      alert("Une erreur s'est produite lors de la génération du fichier PowerPoint.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#eff6ff] flex flex-col font-sans relative overflow-hidden">
      
      {/* Conteneur CACHÉ utilisé uniquement par html2canvas pour créer le .pptx parfait */}
      {/* Il génère les slides en 1280x720 (Standard HD 16:9) pour que la conversion soit exacte */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, zIndex: -999 }}>
        {[1, 2, 3].map((num) => (
          <div key={num} id={`export-slide-${num}`} className="w-[1280px] h-[720px] bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#eff6ff] flex flex-col p-8 relative overflow-hidden">
            <Background />
            <div className="bg-white/20 backdrop-blur-sm flex-1 p-8 rounded-3xl shadow-2xl border border-white/40 flex flex-col z-10">
              {num === 1 && <Slide1 isExport={true} />}
              {num === 2 && <Slide2 isExport={true} />}
              {num === 3 && <Slide3 isExport={true} />}
            </div>
          </div>
        ))}
      </div>

      <Background />

      {/* Conteneur principal 100% Plein Écran */}
      <div className="relative w-full h-full bg-white/20 backdrop-blur-sm flex flex-col z-10">
        
        {/* Contenu centré (pour ne pas être trop étiré sur de très grands écrans) */}
        <div className="w-full max-w-[1600px] mx-auto flex flex-col h-full p-4 sm:p-8 lg:p-10 overflow-hidden">
          
          {/* Entête (Simulateur) */}
          <div className="flex justify-between items-center mb-6 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-indigo-900 font-bold bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full text-sm shadow-sm border border-white/50">
                <Presentation className="w-5 h-5" /> Plateforme de Présentation
              </div>
              <button 
                onClick={handleExportPPTX}
                disabled={isExporting}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isExporting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Génération PPTX...</>
                ) : (
                  <><Download className="w-4 h-4" /> Exporter (.pptx)</>
                )}
              </button>
            </div>
            <div className="text-sm font-semibold text-indigo-900 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/50">
              Page {currentPage + 1} / {totalPages}
            </div>
          </div>

          {/* Zone d'affichage des slides scrollable */}
          <div className="flex-1 relative z-10 overflow-y-auto pr-4 pb-28 -mr-2">
            {currentPage === 0 && <Slide1 />}
            {currentPage === 1 && <Slide2 />}
            {currentPage === 2 && <Slide3 />}
          </div>
        </div>

        {/* Barre de navigation flottante positionnée en bas au centre de l'écran */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 z-50 bg-white/90 backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl border border-white/60">
          <button 
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${currentPage === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-700 hover:bg-indigo-100 hover:scale-105'}`}
          >
            <ChevronLeft className="w-6 h-6" /> Précédent
          </button>
          
          <div className="flex gap-3">
            {[...Array(totalPages)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentPage === i ? 'bg-indigo-600 scale-150' : 'bg-indigo-200'}`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${currentPage === totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-700 hover:bg-indigo-100 hover:scale-105'}`}
          >
            Suivant <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Styles globaux injectés (Animations et CSS Avancé) */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.4); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.7); }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(2%, 5%) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2%, -5%) scale(1.02); }
        }
        .blob-1 { animation: float1 12s ease-in-out infinite; }
        .blob-2 { animation: float2 15s ease-in-out infinite; }

        .chart-slice {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-origin: 0px 0px; 
        }
        .chart-slice:hover {
          transform: scale(1.08); 
          z-index: 10;
        }
        .chart-slice:hover path {
          filter: brightness(1.1); 
          stroke-width: 0.04;
          stroke: #ffffff;
        }
      `}} />
    </div>
  );
}