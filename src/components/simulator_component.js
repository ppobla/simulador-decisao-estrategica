import React, { useState, useEffect } from 'react';
import { ChevronRight, Users, Brain, BookOpen, BarChart3, Settings, Play, Save, Upload, MessageCircle, Target, TrendingUp, Award, Clock, Globe, Shield, Zap } from 'lucide-react';

const AdvancedStrategicSimulator = () => {
  const [activeTab, setActiveTab] = useState('simulator');
  const [gameMode, setGameMode] = useState('single');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [campaignProgress, setCampaignProgress] = useState({ round: 1, totalScore: 0, decisions: [] });
  const [userProfile, setUserProfile] = useState({ 
    name: '', 
    experience: 'beginner',
    specialization: 'general',
    preferences: {},
    statistics: { totalDecisions: 0, avgScore: 0, strongestArea: '', weakestArea: '' }
  });
  const [collaborativeSession, setCollaborativeSession] = useState({
    isActive: false,
    sessionId: '',
    participants: [],
    messages: [],
    currentVoter: null
  });
  const [customScenarios, setCustomScenarios] = useState([]);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');

  const simulationTypes = [
    { id: 'crisis', name: 'Gestão de Crise', emoji: '🚨', description: 'Situações de emergência que requerem resposta imediata', difficulty: 'high' },
    { id: 'diplomacy', name: 'Negociação Diplomática', emoji: '🤝', description: 'Resolução de conflitos através do diálogo', difficulty: 'medium' },
    { id: 'resource', name: 'Alocação de Recursos', emoji: '📊', description: 'Distribuição estratégica de recursos limitados', difficulty: 'medium' },
    { id: 'intelligence', name: 'Operações de Inteligência', emoji: '🕵️', description: 'Coleta e análise de informações estratégicas', difficulty: 'high' },
    { id: 'cyber', name: 'Segurança Cibernética', emoji: '💻', description: 'Proteção contra ameaças digitais', difficulty: 'high' },
    { id: 'humanitarian', name: 'Ajuda Humanitária', emoji: '❤️', description: 'Coordenação de operações de socorro', difficulty: 'low' },
    { id: 'continuity', name: 'Continuidade de Apoio', emoji: '📋', description: 'Decisões sobre manutenção de operações', difficulty: 'medium' },
    { id: 'coordination', name: 'Coordenação de Células', emoji: '🔗', description: 'Integração entre diferentes unidades operacionais', difficulty: 'high' },
    { id: 'disinformation', name: 'Desinformação', emoji: '🛡️', description: 'Gestão de campanhas de informação falsa', difficulty: 'high' },
    { id: 'deepfake', name: 'Detecção de Deepfake', emoji: '🔍', description: 'Identificação de conteúdo manipulado', difficulty: 'high' },
    { id: 'civil', name: 'Engajamento Civil', emoji: '🤝', description: 'Interação com populações pós-conflito', difficulty: 'medium' },
    { id: 'coastal', name: 'Engajamento Costeiro', emoji: '🏖️', description: 'Trabalho com comunidades marítimas', difficulty: 'medium' },
    { id: 'deterrence', name: 'Mensagens de Dissuasão', emoji: '📢', description: 'Desenvolvimento de comunicação estratégica', difficulty: 'medium' },
    { id: 'infrastructure', name: 'Priorização de Infraestrutura', emoji: '🏗️', description: 'Gestão de recursos críticos', difficulty: 'medium' },
    { id: 'transition', name: 'Transição de Autoridades', emoji: '🔄', description: 'Transferência para governo civil', difficulty: 'low' }
  ];

  const baseScenarios = {
    crisis: [
      {
        id: 'cyber_attack',
        title: 'Ataque Cibernético Massivo',
        description: 'Infraestrutura crítica nacional sob ataque coordenado. Sistemas bancários, energia e comunicações comprometidos.',
        context: 'Às 03:00, múltiplos sistemas críticos começaram a falhar simultaneamente. Evidências apontam para um ataque coordenado por atores estatais.',
        timeLimit: 180,
        stakeholders: ['Governo', 'Setor Privado', 'População Civil', 'Militares', 'Agências de Inteligência'],
        options: [
          {
            id: 'immediate_response',
            text: 'Ativação imediata do protocolo de emergência nacional',
            consequences: {
              short: 'Resposta rápida, mas possível pânico público',
              medium: 'Sistemas parcialmente restaurados, economia impactada',
              long: 'Fortalecimento da cibersegurança nacional'
            },
            scores: { political: 70, economic: 40, social: 50, military: 90, international: 60 }
          },
          {
            id: 'covert_response',
            text: 'Resposta silenciosa com contra-ataque cibernético',
            consequences: {
              short: 'Ataques continuam, mas preparação de resposta',
              medium: 'Contra-ataque efetivo, escalada internacional possível',
              long: 'Estabelecimento de nova doutrina cibernética'
            },
            scores: { political: 60, economic: 60, social: 40, military: 80, international: 30 }
          },
          {
            id: 'diplomatic_approach',
            text: 'Canais diplomáticos para cessar-fogo cibernético',
            consequences: {
              short: 'Ataques podem continuar durante negociações',
              medium: 'Possível acordo, mas vulnerabilidade demonstrada',
              long: 'Precedente para resolução pacífica de conflitos cibernéticos'
            },
            scores: { political: 50, economic: 70, social: 60, military: 30, international: 90 }
          }
        ]
      }
    ],
    diplomacy: [
      {
        id: 'border_dispute',
        title: 'Disputa Territorial Complexa',
        description: 'Tensão crescente em fronteira disputada com mobilização militar de ambos os lados.',
        context: 'Incidente fronteiriço escalou para confronto com baixas de ambos os lados. Comunidade internacional pressiona por solução.',
        timeLimit: 300,
        stakeholders: ['País Vizinho', 'ONU', 'População Local', 'Militares', 'Mídia Internacional'],
        options: [
          {
            id: 'mediation_request',
            text: 'Solicitar mediação internacional imediata',
            consequences: {
              short: 'Pausa nas hostilidades, perda de controle sobre processo',
              medium: 'Negociações longas, pressão internacional',
              long: 'Solução duradoura, mas possíveis concessões territoriais'
            },
            scores: { political: 60, economic: 50, social: 70, military: 40, international: 90 }
          },
          {
            id: 'bilateral_talks',
            text: 'Negociações bilaterais diretas',
            consequences: {
              short: 'Controle do processo, mas hostilidades podem continuar',
              medium: 'Progresso lento, flexibilidade nas soluções',
              long: 'Acordo bilateral forte ou escalada do conflito'
            },
            scores: { political: 80, economic: 60, social: 50, military: 60, international: 60 }
          },
          {
            id: 'show_of_force',
            text: 'Demonstração de força com reforços militares',
            consequences: {
              short: 'Escalada imediata, mas posição de força',
              medium: 'Possível recuo do adversário ou conflito maior',
              long: 'Vitória militar ou guerra prolongada'
            },
            scores: { political: 40, economic: 30, social: 40, military: 90, international: 20 }
          }
        ]
      }
    ],
    humanitarian: [
      {
        id: 'disaster_response',
        title: 'Resposta a Desastre Natural',
        description: 'Terremoto de magnitude 7.2 atingiu região densamente povoada. Milhares de desabrigados e infraestrutura destruída.',
        context: 'Primeiras 72 horas são críticas. Recursos limitados e múltiplas necessidades urgentes competindo por atenção.',
        timeLimit: 240,
        stakeholders: ['População Afetada', 'ONG Internacionais', 'Governo Local', 'Forças Armadas', 'Mídia'],
        options: [
          {
            id: 'search_rescue_priority',
            text: 'Priorizar operações de busca e salvamento',
            consequences: {
              short: 'Vidas salvas imediatamente, outras necessidades postergadas',
              medium: 'Moral elevado, mas problemas logísticos crescem',
              long: 'Redução da mortalidade, base sólida para reconstrução'
            },
            scores: { political: 80, economic: 50, social: 90, military: 70, international: 85 }
          },
          {
            id: 'logistics_infrastructure',
            text: 'Foco em restaurar infraestrutura e logística',
            consequences: {
              short: 'Progresso mais lento no salvamento, bases sólidas',
              medium: 'Operações mais eficientes, capacidade aumentada',
              long: 'Recuperação mais rápida e sustentável'
            },
            scores: { political: 60, economic: 85, social: 70, military: 80, international: 75 }
          },
          {
            id: 'medical_humanitarian',
            text: 'Priorizar assistência médica e humanitária',
            consequences: {
              short: 'Sofrimento reduzido, necessidades básicas atendidas',
              medium: 'Epidemias prevenidas, confiança da população',
              long: 'Comunidade mais resiliente e preparada'
            },
            scores: { political: 75, economic: 60, social: 95, military: 60, international: 90 }
          }
        ]
      }
    ]
  };

  const aiAnalyzer = {
    analyzeDecision: (decision, userHistory) => {
      const patterns = aiAnalyzer.identifyPatterns(userHistory);
      const insights = {
        decisionStyle: patterns.style,
        strengthAreas: patterns.strengths,
        improvementAreas: patterns.weaknesses,
        recommendation: aiAnalyzer.generateRecommendation(decision, patterns),
        riskAssessment: aiAnalyzer.assessRisk(decision),
        alternativeSuggestions: aiAnalyzer.suggestAlternatives(decision)
      };
      return insights;
    },

    identifyPatterns: (history) => {
      if (!history || history.length === 0) return { style: 'Novo Usuário', strengths: [], weaknesses: [] };
      
      const scores = history.map(d => d.scores);
      const avgScores = {
        political: scores.reduce((sum, s) => sum + s.political, 0) / scores.length,
        economic: scores.reduce((sum, s) => sum + s.economic, 0) / scores.length,
        social: scores.reduce((sum, s) => sum + s.social, 0) / scores.length,
        military: scores.reduce((sum, s) => sum + s.military, 0) / scores.length,
        international: scores.reduce((sum, s) => sum + s.international, 0) / scores.length
      };

      const style = avgScores.military > 70 ? 'Agressivo' : 
                   avgScores.international > 70 ? 'Diplomático' :
                   avgScores.economic > 70 ? 'Pragmático' : 'Equilibrado';

      return {
        style,
        strengths: Object.entries(avgScores).filter(([_, score]) => score > 70).map(([area, _]) => area),
        weaknesses: Object.entries(avgScores).filter(([_, score]) => score < 50).map(([area, _]) => area)
      };
    },

    generateRecommendation: (decision, patterns) => {
      const recommendations = {
        'Agressivo': "Considere abordagens mais diplomáticas para equilibrar suas decisões",
        'Diplomático': "Sua abordagem diplomática é forte, mas considere também aspectos militares",
        'Pragmático': "Excelente foco econômico, mas atenção aos impactos sociais",
        'Equilibrado': "Perfil equilibrado, continue desenvolvendo todas as áreas"
      };
      return recommendations[patterns.style] || "Continue desenvolvendo seu estilo de liderança";
    },

    assessRisk: (decision) => {
      const riskFactors = {
        high: ['immediate_response', 'show_of_force', 'covert_response'],
        medium: ['bilateral_talks', 'mediation_request', 'logistics_infrastructure'],
        low: ['diplomatic_approach', 'search_rescue_priority', 'medical_humanitarian']
      };
      
      if (riskFactors.high.includes(decision.id)) return 'Alto';
      if (riskFactors.medium.includes(decision.id)) return 'Médio';
      return 'Baixo';
    },

    suggestAlternatives: (decision) => {
      return [
        "Considere uma abordagem híbrida combinando elementos de diferentes estratégias",
        "Analise o timing - uma ação posterior pode ser mais efetiva",
        "Avalie o envolvimento de mais stakeholders na decisão"
      ];
    }
  };

  const collaborativeSystem = {
    createSession: (scenarioId) => {
      const sessionId = `session_${Date.now()}`;
      setCollaborativeSession({
        isActive: true,
        sessionId,
        participants: [
          { id: '1', name: userProfile.name || 'Você', role: 'Commander', vote: null },
          { id: '2', name: 'Ana Silva', role: 'Intelligence Analyst', vote: null },
          { id: '3', name: 'Carlos Santos', role: 'Political Advisor', vote: null }
        ],
        messages: [
          { id: '1', user: 'Sistema', message: 'Sessão colaborativa iniciada', timestamp: new Date() }
        ],
        currentVoter: null
      });
    },

    simulateCollaboration: (decision) => {
      const participants = collaborativeSession.participants.map(p => {
        if (p.id === '1') return { ...p, vote: decision.id };
        
        const aiVote = collaborativeSystem.generateAIVote(p.role, decision);
        return { ...p, vote: aiVote };
      });

      setCollaborativeSession(prev => ({
        ...prev,
        participants,
        messages: [
          ...prev.messages,
          { id: Date.now(), user: 'Ana Silva', message: 'Analisando dados de inteligência...', timestamp: new Date() },
          { id: Date.now() + 1, user: 'Carlos Santos', message: 'Considerando impactos políticos', timestamp: new Date() }
        ]
      }));
    },

    generateAIVote: (role, decision) => {
      const rolePreferences = {
        'Intelligence Analyst': ['covert_response', 'bilateral_talks'],
        'Political Advisor': ['diplomatic_approach', 'mediation_request']
      };
      
      return rolePreferences[role]?.[Math.floor(Math.random() * rolePreferences[role].length)] || decision.id;
    }
  };

  const TutorialSystem = () => {
    const [tutorialStep, setTutorialStep] = useState(0);
    const tutorialSteps = [
      {
        title: "Bem-vindo ao Simulador Avançado",
        content: "Este simulador oferece experiências de tomada de decisão estratégica realistas com IA adaptativa.",
        highlight: "simulator-title"
      },
      {
        title: "Tipos de Simulação",
        content: "Escolha entre 15 tipos diferentes de cenários, cada um com desafios únicos.",
        highlight: "simulation-types"
      },
      {
        title: "Modos de Jogo",
        content: "Jogue sozinho, em campanhas conectadas ou colaborativamente com equipes.",
        highlight: "game-modes"
      },
      {
        title: "Análise com IA",
        content: "Receba insights personalizados baseados em seu histórico de decisões.",
        highlight: "ai-insights"
      }
    ];

    if (!showTutorial) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center tutorial-overlay">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-xl font-bold mb-4">{tutorialSteps[tutorialStep].title}</h3>
          <p className="mb-6">{tutorialSteps[tutorialStep].content}</p>
          <div className="flex justify-between">
            <button
              onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
              disabled={tutorialStep === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="self-center text-sm text-gray-500">
              {tutorialStep + 1} de {tutorialSteps.length}
            </span>
            {tutorialStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setTutorialStep(tutorialStep + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={() => setShowTutorial(false)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Começar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AdvancedAnalysis = ({ results, userHistory }) => {
    if (!results) return null;

    return (
      <div className="mt-8 space-y-6 analysis-chart">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Brain className="mr-2" /> Análise com IA
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Impacto por Dimensão</h4>
              <div className="space-y-2">
                {Object.entries(results.scores).map(([area, score]) => (
                  <div key={area} className="flex items-center">
                    <span className="w-20 text-sm capitalize">{area}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                      <div 
                        className={`h-2 rounded-full progress-bar ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Insights da IA</h4>
              {aiInsights && (
                <div className="space-y-2 text-sm">
                  <p><strong>Estilo:</strong> {aiInsights.decisionStyle}</p>
                  <p><strong>Risco:</strong> {aiInsights.riskAssessment}</p>
                  <p><strong>Recomendação:</strong> {aiInsights.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {userHistory && userHistory.length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2" /> Evolução das Decisões
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.keys(results.scores).map(area => (
                <div key={area} className="text-center">
                  <div className="text-sm font-medium capitalize mb-1">{area}</div>
                  <div className="text-2xl font-bold">
                    {results.scores[area]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Média: {Math.round(userHistory.reduce((sum, h) => sum + h.scores[area], 0) / userHistory